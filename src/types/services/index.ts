export type ServiceToken<T = any> = abstract new (...args: any[]) => T;

export type LayersOptions = {
  defaultList?: boolean
}

export type TimeEvent = {
  callback: () => void
  delay: number
  repeat: boolean
  elapsed: number
}

export type InputAction = 'up' | 'down' | 'left' | 'right' | 'fire';