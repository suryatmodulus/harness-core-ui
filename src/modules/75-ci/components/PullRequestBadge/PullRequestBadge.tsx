import React from 'react'
import cx from 'classnames'
import { Icon } from '@wings-software/uicore'

import type { CIBuildPRHook } from 'services/ci'
import { Badge } from '@ci/components/Badge/Badge'
import css from './PullRequestBadge.module.scss'

export interface PullRequestBadgeProps {
  pullRequest?: CIBuildPRHook
  className?: string
}

export function PullRequestBadge(props: PullRequestBadgeProps): React.ReactElement {
  const { pullRequest, className } = props
  const { sourceRepo, sourceBranch, targetBranch } = pullRequest || {}

  return (
    <div className={cx(css.main, className)}>
      <Badge>
        {sourceRepo ? <span className={cx(css.ellipsis, css.sourceRepo)}>{sourceRepo}</span> : null}
        <Icon className={css.icon} name="git-branch" size={10} />
        <span className={cx(css.ellipsis, css.sourceBranch)}>{sourceBranch}</span>
      </Badge>
      <span>⟶</span>
      <Badge>
        <Icon className={css.icon} name="git-branch" size={10} />
        <span className={cx(css.ellipsis, css.targetBranch)}>{targetBranch}</span>
      </Badge>
    </div>
  )
}
