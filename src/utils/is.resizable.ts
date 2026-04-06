import type { IResizable } from '@app-types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isResizable(object: any): object is IResizable {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return object && typeof object.resize === 'function'
}
