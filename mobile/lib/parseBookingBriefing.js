import { decodeBookingMeta } from '../services/bookingService';
import { getPackage, getVehicleSize } from '../services/pricingService';

function parseHandoffLine(line) {
  if (!line.startsWith('HandoffIssue:')) return null;
  const body = line.slice('HandoffIssue:'.length);
  const pipe = body.indexOf('|');
  const key = (pipe >= 0 ? body.slice(0, pipe) : body).trim();
  const detail = pipe >= 0 ? body.slice(pipe + 1).trim() : '';
  if (!key) return null;
  return { key, detail };
}

function humanizeKey(key) {
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseMetadataLine(line) {
  const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
  let packageId = null;
  let vehicleSize = null;
  let customerInstructions = null;
  const trailing = [];

  for (const part of parts) {
    if (part === 'WashGo') continue;

    const colon = part.indexOf(':');
    if (colon > 0) {
      const k = part.slice(0, colon);
      const v = part.slice(colon + 1).trim();
      if (k === 'package') packageId = v;
      else if (k === 'vehicle') vehicleSize = v;
      else if (k === 'note') customerInstructions = v;
      else trailing.push(part);
    } else {
      trailing.push(part);
    }
  }

  if (!customerInstructions && trailing.length > 0) {
    customerInstructions = trailing.join(' · ');
  }

  return { packageId, vehicleSize, customerInstructions };
}

/**
 * Build structured field briefing from backend booking notes + arrival notes.
 */
export function buildFieldBriefing({ notes, arrivalConditionNotes } = {}) {
  const alerts = [];
  const metaLines = [];

  if (notes && typeof notes === 'string') {
    for (const line of notes.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const handoff = parseHandoffLine(trimmed);
      if (handoff) {
        const label = handoff.detail
          ? `Handoff issue: ${handoff.detail}`
          : `Handoff issue: ${humanizeKey(handoff.key)}`;
        alerts.push({
          id: `handoff-${handoff.key}`,
          label,
          tone: 'warning',
        });
      } else {
        metaLines.push(trimmed);
      }
    }
  }

  const metaLine = metaLines[0] || '';
  const parsed = metaLine ? parseMetadataLine(metaLine) : {};
  const decoded = decodeBookingMeta(metaLine);
  const packageId = parsed.packageId || decoded.packageId;
  const vehicleSize = parsed.vehicleSize || decoded.vehicleSize;

  const tags = [];
  if (packageId) {
    const pkg = getPackage(packageId);
    tags.push({
      id: 'package',
      label: pkg?.label || humanizeKey(packageId),
      tone: 'premium',
    });
  }
  if (vehicleSize) {
    const size = getVehicleSize(vehicleSize);
    tags.push({
      id: 'vehicle',
      label: size?.label || humanizeKey(vehicleSize),
      tone: 'info',
    });
  }

  const customerInstructions = parsed.customerInstructions?.trim() || null;
  const arrivalNotes = (arrivalConditionNotes || '').trim() || null;

  if (
    tags.length === 0 &&
    !customerInstructions &&
    !arrivalNotes &&
    alerts.length === 0
  ) {
    return null;
  }

  return {
    tags,
    customerInstructions,
    arrivalNotes,
    alerts,
  };
}

export function hasBriefingContent(briefing) {
  if (!briefing) return false;
  return (
    (briefing.tags?.length ?? 0) > 0 ||
    Boolean(briefing.customerInstructions) ||
    Boolean(briefing.arrivalNotes) ||
    (briefing.alerts?.length ?? 0) > 0
  );
}
