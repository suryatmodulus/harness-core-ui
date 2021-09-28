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
