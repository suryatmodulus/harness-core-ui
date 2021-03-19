import { Intent } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components/Toaster/useToaster'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useStrings } from 'framework/exports'
import { Project, useDeleteProject } from 'services/cd-ng'

import i18n from './DeleteProject.i18n'
interface UseDeleteProjectDialogReturn {
  openDialog: () => void
}

const useDeleteProjectDialog = (data: Project, onSuccess: () => void): UseDeleteProjectDialogReturn => {
  const { accountId } = useParams()
  const { mutate: deleteProject } = useDeleteProject({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ ''
    }
  })
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { openDialog } = useConfirmationDialog({
    contentText: getString('projectCard.confirmDelete', { name: data.name }),
    titleText: getString('projectCard.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteProject(data.identifier || /* istanbul ignore next */ '', {
            headers: { 'content-type': 'application/json' }
          })
          if (deleted) showSuccess(i18n.successMessage(data.name || /* istanbul ignore next */ ''))
          onSuccess()
        } catch (err) {
          /* istanbul ignore next */
          showError(err)
        }
      }
    }
  })
  return {
    openDialog
  }
}

export default useDeleteProjectDialog
