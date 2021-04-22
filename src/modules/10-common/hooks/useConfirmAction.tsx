import { Intent } from '@blueprintjs/core'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useStrings } from 'framework/exports'

export interface UseConfirmActionDialogProps {
  message: React.ReactElement
  intent?: Intent
  title?: string
  confirmText?: string
  cancelText?: string
  action: () => void
}

export const useConfirmAction = (props: UseConfirmActionDialogProps) => {
  const { title, message, confirmText, cancelText, intent, action } = props
  const { getString } = useStrings()
  const { openDialog } = useConfirmationDialog({
    titleText: title || getString('confirmation'),
    contentText: message,
    confirmButtonText: confirmText || getString('confirm'),
    cancelButtonText: cancelText || getString('common.cancel'),
    buttonIntent: intent || Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        action()
      }
    }
  })

  return openDialog
}
