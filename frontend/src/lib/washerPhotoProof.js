const PREFIX = 'washgo:washer:photoProof:';

export function demoPhotoProofKey(kind, jobId) {
  return `${PREFIX}${kind}:${jobId || 'demo'}`;
}

export function readDemoPhotoProof(jobId) {
  try {
    return {
      arrival: sessionStorage.getItem(demoPhotoProofKey('arrival', jobId)) === '1',
      before: sessionStorage.getItem(demoPhotoProofKey('before', jobId)) === '1',
      after: sessionStorage.getItem(demoPhotoProofKey('after', jobId)) === '1',
    };
  } catch {
    return { arrival: false, before: false, after: false };
  }
}

export function hasBookingPhoto(job, kind, { isDemo = false, jobId = null } = {}) {
  if (isDemo && jobId) return readDemoPhotoProof(jobId)[kind];
  return Boolean(job?.photos?.some((p) => p.kind === kind));
}
