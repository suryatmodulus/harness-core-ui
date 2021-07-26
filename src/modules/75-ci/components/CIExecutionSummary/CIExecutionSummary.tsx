import React from 'react'
import { first } from 'lodash-es'
import { Icon } from '@wings-software/uicore'

import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'
import type { CIWebhookInfoDTO } from 'services/ci'

import { LastCommit } from '../CommitsInfo/CommitsInfo'
import { BranchBadge } from '../BranchBadge/BranchBadge'
import { PullRequestInfo } from '../PullRequestInfo/PullRequestInfo'
import { RepositoryInfo } from '../RepositoryInfo/RepositoryInfo'

import css from './CIExecutionSummary.module.scss'

export function CIExecutionSummary(props: ExecutionSummaryProps): React.ReactElement {
  const { data } = props
  const buildData = data?.ciExecutionInfoDTO as CIWebhookInfoDTO
  const branchName = data?.branch as string
  const tagName = data?.tag
  const repoName = data?.repoName
  const commits =
    buildData?.event === 'branch'
      ? buildData?.branch?.commits
      : buildData?.event === 'pullRequest'
      ? buildData?.pullRequest?.commits
      : []
  const lastCommit = first(commits || [])
  return (
    <div className={css.main}>
      <Icon className={css.icon} size={14} name="ci-main" />
      <RepositoryInfo repoName={repoName} />
      {buildData?.event === 'branch' ? (
        <LastCommit lastCommit={lastCommit} />
      ) : buildData?.event === 'pullRequest' ? (
        <React.Fragment>
          <LastCommit lastCommit={lastCommit} />
          <PullRequestInfo minimal pullRequest={buildData?.pullRequest} />
        </React.Fragment>
      ) : (
        <BranchBadge branchName={branchName} tagName={tagName} />
      )}
    </div>
  )
}
