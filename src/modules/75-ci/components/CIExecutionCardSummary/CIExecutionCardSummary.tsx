import React from 'react'
import { first } from 'lodash-es'

import type { CIWebhookInfoDTO } from 'services/ci'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import { BranchBadge } from '@ci/components/BranchBadge/BranchBadge'
import { CommitsInfo } from '@ci/components/CommitsInfo/CommitsInfo'
import { PullRequestBadge } from '@ci/components/PullRequestBadge/PullRequestBadge'
import { PullRequestInfo } from '@ci/components/PullRequestInfo/PullRequestInfo'

import css from './CIExecutionCardSummary.module.scss'

export function CIExecutionCardSummary(props: ExecutionCardInfoProps): React.ReactElement {
  const { data } = props
  const buildData = data?.ciExecutionInfoDTO as CIWebhookInfoDTO
  const branchName = data?.branch as string
  const tagName = data?.tag
  const lastCommit = first(buildData?.branch?.commits || [])

  return (
    <div className={css.main}>
      {buildData?.event === 'branch' ? (
        <React.Fragment>
          <BranchBadge branchName={buildData?.branch?.name} commitId={lastCommit?.id?.slice(0, 7)} />
          <CommitsInfo commits={buildData?.branch?.commits} />
        </React.Fragment>
      ) : buildData?.event === 'pullRequest' ? (
        <React.Fragment>
          <PullRequestBadge pullRequest={buildData?.pullRequest} />
          <PullRequestInfo pullRequest={buildData?.pullRequest} />
          <CommitsInfo commits={buildData?.pullRequest?.commits} />
        </React.Fragment>
      ) : (
        <BranchBadge branchName={branchName} tagName={tagName} />
      )}
    </div>
  )
}
