

/*
 * Token utilities.
 */

export function isTokenNotExpired(createdAt: Date, ttlInSeconds: number): boolean {
  const now = new Date();
  const diff = (now.getTime() - createdAt.getTime()) / 1000;

  return diff < ttlInSeconds;
}
