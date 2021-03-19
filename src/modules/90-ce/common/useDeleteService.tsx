import { Intent } from '@blueprintjs/core'
import { useConfirmationDialog } from '@common/exports'
import { useStrings } from 'framework/exports'
import { Service, useDeleteService } from 'services/lw'

interface UseDeleteServiceHookProps {
  orgIdentifier: string
  projectIdentifier: string
  serviceData: Service
  onSuccess?: (data: Service) => void
  onFailure?: (error: any) => void
}

interface UseDeleteServiceHookReturn {
  triggerDelete: () => void
}

const useDeleteServiceHook = (props: UseDeleteServiceHookProps): UseDeleteServiceHookReturn => {
  const { orgIdentifier, projectIdentifier, serviceData } = props
  const { getString } = useStrings()
  const { mutate: deleteServiceApiCall } = useDeleteService({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier // eslint-disable-line
  })

  const deleteRule = async (isConfirmed: boolean) => {
    if (isConfirmed) {
      try {
        const deletionResponse: any = await deleteServiceApiCall(serviceData.id as number)
        if (deletionResponse.success) {
          props.onSuccess?.(serviceData)
        } else {
          props.onFailure?.(deletionResponse.errors?.join('\n'))
        }
      } catch (e) {
        props.onFailure?.(e)
      }
    }
  }

  const { openDialog } = useConfirmationDialog({
    titleText: getString('ce.co.autoStoppingRule.confirm.deleteServiceTitle', { name: serviceData.name }),
    contentText: getString('ce.co.autoStoppingRule.confirm.deleteDialogText'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    onCloseDialog: deleteRule
  })

  return {
    triggerDelete: () => openDialog()
  }
}

export default useDeleteServiceHook
