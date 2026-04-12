export type CameraOptions = {
  smoothness: number

  target: { x: number; y: number } | null

  x: number
  y: number

  currentZoom: number
  minZoom: number
  maxZoom: number
  zoomSmoothness: number

  shakeIntensity: number
  shakeDecay: number
}
