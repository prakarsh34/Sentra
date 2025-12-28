export function isPotentialDuplicate(
  a: any,
  b: any
): boolean {
  if (!a.location || !b.location) return false;
  if (a.type !== b.type) return false;

  const timeDiff =
    Math.abs(a.createdAt?.toDate() - b.createdAt?.toDate()) /
    (1000 * 60);

  if (timeDiff > 10) return false; // 10 minutes

  const dx = a.location.lat - b.location.lat;
  const dy = a.location.lng - b.location.lng;

  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < 0.01; // ~1km
}
