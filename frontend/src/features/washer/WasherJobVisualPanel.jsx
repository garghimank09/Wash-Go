import { Card } from '../../ui/card';
import { WasherEtaRouteCard } from './WasherEtaRouteCard';
import { WasherPhotoProofSection } from './WasherPhotoProofSection';

/**
 * Map + proof photos — single panel for the washer job left column.
 */
export function WasherJobVisualPanel({
  displayJob,
  phase,
  tracking,
  trackActive,
  trackingError,
  jobId,
  isDemo,
  servicePhase,
  initialArrivalNotes,
  onArrivalUploaded,
  jobStatus = null,
}) {
  const isCompleted = phase === 'completed' || jobStatus === 'completed';
  const showMap = !isCompleted;

  return (
    <Card variant="glass" className="overflow-hidden border-white/15 p-0 shadow-wg-card ring-1 ring-cyan-500/10 dark:border-white/10">
      {showMap ? (
        <>
          <WasherEtaRouteCard
            embedded
            etaMinutes={displayJob.etaMinutes ?? tracking?.eta_minutes ?? 22}
            address={displayJob.service_address}
            phase={phase}
            tracking={trackActive ? tracking : undefined}
          />
          {trackingError && trackActive && !tracking ? (
            <p className="border-b border-wg-border/60 px-4 py-2.5 text-xs font-medium text-amber-900 dark:border-white/10 dark:text-amber-100">
              Map unavailable: {trackingError}
            </p>
          ) : null}
        </>
      ) : null}

      <div
        className={
          showMap
            ? 'border-t border-wg-border/60 bg-wg-surface-elevated/30 p-4 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]'
            : 'bg-wg-surface-elevated/30 p-4 sm:p-6 dark:bg-white/[0.02]'
        }
      >
        <WasherPhotoProofSection
          embedded
          jobId={jobId}
          isDemo={isDemo}
          washerPhase={phase}
          servicePhase={servicePhase}
          initialArrivalNotes={initialArrivalNotes}
          onArrivalUploaded={onArrivalUploaded}
        />
      </div>
    </Card>
  );
}
