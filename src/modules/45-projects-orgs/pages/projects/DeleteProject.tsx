import { Intent } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useToaster, useConfirmationDialog } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Project, useDeleteProject } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

interface UseDeleteProjectDialogReturn {
  openDialog: () => void
}

const useDeleteProjectDialog = (data: Project, onSuccess: () => void): UseDeleteProjectDialogReturn => {
  const { accountId } = useParams<AccountPathProps>()
  const { updateAppStore } = useAppStore()
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
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteProject(data.identifier || /* istanbul ignore next */ '', {
            headers: { 'content-type': 'application/json' }
          })
          if (deleted)
            showSuccess(
              getString('projectCard.successMessage', { projectName: data.name || /* istanbul ignore next */ '' })
            )
          updateAppStore({ selectedProject: undefined, selectedOrg: undefined })
          onSuccess()
        } catch (err) {
          /* istanbul ignore next */
          showError(err.data?.message || err.message)
        }
      }
    }
  })
  return {
    openDialog
  }
}

export default useDeleteProjectDialog
