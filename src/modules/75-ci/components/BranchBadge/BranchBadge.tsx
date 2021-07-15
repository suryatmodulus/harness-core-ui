import React from 'react'
import cx from 'classnames'
import { Icon } from '@wings-software/uicore'

import { Badge } from '../Badge/Badge'
import css from './BranchBadge.module.scss'

export interface BranchBadgeProps {
  branchName?: string
  tagName?: string
  commitId?: string
  className?: string
}

export function BranchBadge(props: BranchBadgeProps): React.ReactElement {
  const { branchName, commitId, tagName, className } = props

  return (
    <div className={cx(css.main, className)}>
      {branchName ? (
        <Badge>
          <Icon className={css.icon} name={tagName ? 'tag' : 'git-branch'} size={10} />
          <span className={css.branchName}>{tagName || branchName}</span>
        </Badge>
      ) : null}
      {commitId ? (
        <Badge>
          <Icon className={css.icon} name="git-commit" size={10} />
          <span>{commitId?.slice(0, 7)}</span>
        </Badge>
      ) : null}
    </div>
  )
}
