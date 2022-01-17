/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'

export enum UIType {
  Branch = 'branch',
  Tag = 'tag',
  PullRequest = 'pull-request'
}

export function getUIType(data: ExecutionSummaryProps['data']): UIType {
  if (data?.tag) {
    return UIType.Tag
  } else if (data?.ciExecutionInfoDTO?.pullRequest) {
    return UIType.PullRequest
  } else {
    return UIType.Branch
  }
}
