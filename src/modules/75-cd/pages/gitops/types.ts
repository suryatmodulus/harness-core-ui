import type { StepProps } from '@wings-software/uicore'

import type { GitOpsProvider, GitopsProviderResponse } from 'services/cd-ng'

export interface BaseProviderStepProps extends StepProps<GitOpsProvider> {
  isEditMode?: boolean
  provider?: GitopsProviderResponse | null
  onLaunchArgoDashboard?(provider?: GitOpsProvider): void
  onUpdateMode?(mode: boolean): void
  onClose?(): void
}
