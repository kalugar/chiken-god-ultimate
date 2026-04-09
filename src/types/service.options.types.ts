export type LayersOptions = {
  defaultList?: boolean
}

export type TimeEvent = {
  callback: () => void
  delay: number
  repeat: boolean
  elapsed: number
}

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
