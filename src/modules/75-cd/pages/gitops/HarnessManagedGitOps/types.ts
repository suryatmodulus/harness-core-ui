import type { StepProps } from '@wings-software/uicore'
import type { V1Agent } from 'services/gitops'

export interface BaseProviderStepProps extends StepProps<V1Agent & { agentIdentifier?: string }> {
  isEditMode?: boolean
  provider?: V1Agent | null
  onUpdateMode?(mode: boolean): void
  onClose?(): void
}
