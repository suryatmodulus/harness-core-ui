import type { GitOpsInfoDTO, ManagedArgoGitOpsInfoDTO, ConnectedArgoGitOpsInfoDTO } from 'services/cd-ng'

import argoLogo from '@cd/icons/argo-logo.svg'
import harnessLogo from '@cd/icons/harness-logo.png'

export type GitOpsProviderType = Required<GitOpsInfoDTO>['type']

export const GitOpsProviderTypeEnum: Record<GitOpsProviderType, GitOpsProviderType> = {
  ConnectedArgoProvider: 'ConnectedArgoProvider',
  ManagedArgoProvider: 'ManagedArgoProvider'
}

export function isConnectedGitOpsProvider(obj?: GitOpsInfoDTO | null): obj is ConnectedArgoGitOpsInfoDTO {
  return obj?.type === GitOpsProviderTypeEnum.ConnectedArgoProvider
}

export function isManagedGitOpsProvider(obj?: GitOpsInfoDTO | null): obj is ManagedArgoGitOpsInfoDTO {
  return obj?.type === GitOpsProviderTypeEnum.ManagedArgoProvider
}

export function getGitOpsLogo(obj?: GitOpsInfoDTO | null): string {
  return isConnectedGitOpsProvider(obj) ? argoLogo : harnessLogo
}
