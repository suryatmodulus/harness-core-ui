import type { IDialogProps } from '@blueprintjs/core'

export interface InputWithDynamicModalForJsonProps {
  onChange: (name: string, value: string) => void
  isQueryExecuted: boolean
  isDisabled: boolean
  sampleRecord: Record<string, any> | null
  inputLabel: string
  inputName: string
  noRecordModalHeader?: string
  noRecordInputLabel?: string
  recordsModalHeader: string
  fieldValue: string
  showExactJsonPath?: boolean
}

export const DialogProps: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { width: 600, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

export type NoRecordForm = {
  name: string
}
