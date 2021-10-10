import type { SetStateAction, Dispatch } from 'react'

export interface ToggleOnOffInterface {
  checked?: boolean
  beforeOnChange: (val: boolean, callbackFn: Dispatch<SetStateAction<boolean>>) => void
  disabled?: boolean
  loading?: boolean
}
