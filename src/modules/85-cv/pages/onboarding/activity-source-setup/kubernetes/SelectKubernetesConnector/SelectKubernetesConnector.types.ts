import type { KubernetesActivitySourceInfo } from '../KubernetesActivitySourceUtils'

export interface ValidateSubmitProp {
  values: KubernetesActivitySourceInfo
  params: {
    accountId: string
    projectIdentifier: string
    orgIdentifier: string
  }
  onSubmit: (data: KubernetesActivitySourceInfo) => void
  showError: (message: string, timeout?: number) => void
}
