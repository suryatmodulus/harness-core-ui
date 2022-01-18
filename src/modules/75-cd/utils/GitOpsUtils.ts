/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
