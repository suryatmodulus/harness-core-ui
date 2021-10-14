import type { GitOpsInfoDTO, ManagedArgoGitOpsInfoDTO, ConnectedArgoGitOpsInfoDTO } from 'services/cd-ng'

export type GitOpsProviderType = Required<GitOpsInfoDTO>['type']

export const GitOpsProviderTypeEnum: Record<GitOpsProviderType, GitOpsProviderType> = {
  CONNECTED_ARGO_PROVIDER: 'CONNECTED_ARGO_PROVIDER',
  MANAGED_ARGO_PROVIDER: 'MANAGED_ARGO_PROVIDER'
}

export function isConnectedGitOpsProvider(obj?: GitOpsInfoDTO | null): obj is ConnectedArgoGitOpsInfoDTO {
  return obj?.type === GitOpsProviderTypeEnum.CONNECTED_ARGO_PROVIDER
}

export function isManagedGitOpsProvider(obj?: GitOpsInfoDTO | null): obj is ManagedArgoGitOpsInfoDTO {
  return obj?.type === GitOpsProviderTypeEnum.MANAGED_ARGO_PROVIDER
}
