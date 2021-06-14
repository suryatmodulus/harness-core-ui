import type { StepProps } from '@common/components/WizardWithProgress/WizardWithProgress'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'

export interface ConnectionConfigProps extends StepProps<ConnectorConfigDTO> {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  isEditMode: boolean
  identifier?: string
  connectorInfo?: ConnectorInfoDTO | void
}
