export function moveTowards(current: number, target: number, maxDelta: number): number {
  if (current < target) {
    return Math.min(current + maxDelta, target)
  } else if (current > target) {
    return Math.max(current - maxDelta, target)
  }
  return target
}
