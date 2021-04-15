import { isEmpty as _isEmpty } from 'lodash-es'
import { Intent } from '@blueprintjs/core'
import { useConfirmationDialog } from '@common/exports'
import { useStrings } from 'framework/exports'
import { useToggleAutostoppingRule, Service } from 'services/lw'

interface UseToggleAutostoppingRuleProps {
  orgIdentifier: string
  projectIdentifier: string
  serviceData: Service
  onSuccess?: (updatedServiceData: Service) => void
  onFailure?: (error: any) => void
}

interface UseToggleAutostoppingRuleReturn {
  triggerToggle: () => void
}

const useToggleRuleState = (props: UseToggleAutostoppingRuleProps): UseToggleAutostoppingRuleReturn => {
  const { orgIdentifier, projectIdentifier, serviceData } = props
  const { getString } = useStrings()
  const { mutate: toggleAutoStoppingRule } = useToggleAutostoppingRule({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    service_id: (serviceData.id as number).toString(), // eslint-disable-line
    queryParams: {
      disable: !serviceData.disabled
    }
  })

  const toggleRule = async (isConfirmed: boolean) => {
    if (isConfirmed) {
      try {
        const updatedData = await toggleAutoStoppingRule()
        if (!_isEmpty((updatedData as any).response)) {
          props.onSuccess?.((updatedData as any).response)
        }
      } catch (e) {
        props.onFailure?.(e)
      }
    }
  }

  const { openDialog } = useConfirmationDialog({
    titleText: getString(
      serviceData.disabled
        ? 'ce.co.autoStoppingRule.confirm.enableTitle'
        : 'ce.co.autoStoppingRule.confirm.disableTitle',
      { name: serviceData.name }
    ),
    contentText: getString(
      serviceData.disabled
        ? 'ce.co.autoStoppingRule.confirm.enableDialogText'
        : 'ce.co.autoStoppingRule.confirm.disableDialogText'
    ),
    confirmButtonText: getString(serviceData.disabled ? 'enable' : 'ce.co.autoStoppingRule.confirm.disable'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: toggleRule
  })

  return {
    triggerToggle: () => openDialog()
  }
}

export default useToggleRuleState
