export type LayersOptions = {
  defaultList?: boolean
}

export type TimeEvent = {
  callback: () => void
  delay: number
  repeat: boolean
  elapsed: number
}
