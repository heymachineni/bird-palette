/** Hosts we proxy for canvas pixel sampling (client + server must match). */
export const PHOTO_SAMPLE_HOSTS = new Set([
  "birdnet.cornell.edu",
  "cdn.download.ams.birds.cornell.edu",
  "inaturalist-open-data.s3.amazonaws.com",
  "static.inaturalist.org",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
]);

export function isPhotoSampleHost(hostname: string): boolean {
  return PHOTO_SAMPLE_HOSTS.has(hostname);
}
