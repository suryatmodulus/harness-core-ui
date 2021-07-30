import { Intent } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useMutate } from 'restful-react'
import { useToaster } from '@common/components/Toaster/useToaster'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useStrings } from 'framework/strings'

import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface UseDeleteFolderReturn {
  openDialog: () => void
}

interface FolderInterface {
  id: string
  name: string
  title?: string
  Children?: number
}
const useDeleteFolder = (folder: FolderInterface | undefined, onSuccess: () => void): UseDeleteFolderReturn => {
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: deleteFolder } = useMutate({
    verb: 'DELETE',
    path: 'dashboard/folder',
    queryParams: {
      accountId: accountId
    }
  })
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { openDialog } = useConfirmationDialog({
    contentText: getString('dashboards.deleteFolder.confirmDeleteText', { name: folder?.name }),
    titleText: getString('dashboards.deleteFolder.confirmDeleteTitle', { name: folder?.name }),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteFolder({ name: folder?.id })
          if (deleted) {
            showSuccess(getString('dashboards.deleteFolder.success'))
            onSuccess()
          }
        } catch (error: unknown | any) {
          showError(error?.data?.responseMessages)
        }
      }
    }
  })
  return {
    openDialog
  }
}

export default useDeleteFolder
