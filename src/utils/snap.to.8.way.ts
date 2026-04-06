export function snapToNWay(ways: number, dx: number, dy: number): { x: number; y: number } {
  const angle = Math.atan2(dy, dx)
  const SECTOR = (2 * Math.PI) / ways
  const snappedAngle = Math.round(angle / SECTOR) * SECTOR
  return {
    x: Math.cos(snappedAngle),
    y: Math.sin(snappedAngle)
  }
}
