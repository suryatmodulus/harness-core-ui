import React from 'react'
import { Text, Icon } from '@wings-software/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { CIBuildPRHook } from 'services/ci'

import css from './PullRequestInfo.module.scss'

export interface PullRequestInfoProps {
  pullRequest?: CIBuildPRHook
  minimal?: boolean
}

export function PullRequestInfo(props: PullRequestInfoProps): React.ReactElement {
  const { pullRequest, minimal = false } = props
  const { getString } = useStrings()

  function killEvent(e: React.SyntheticEvent): void {
    e.stopPropagation()
  }

  return (
    <div className={cx(css.pullRequestInfo, { [css.minimal]: minimal })} onClick={killEvent}>
      {!minimal ? (
        <React.Fragment>
          <Icon className={css.icon} name="git-pull" size={14} />
          <Text>{pullRequest?.title}</Text>
        </React.Fragment>
      ) : null}
      <a className={css.prNumber} href={pullRequest?.link || ''} target="_blank" rel="noopener noreferrer">
        {getString('ci.prSymbol')}
        {typeof pullRequest?.id === 'string' || typeof pullRequest?.id === 'number'
          ? pullRequest?.id
          : pullRequest?.id?.['$numberLong']
          ? pullRequest?.id?.['$numberLong']
          : ''}
      </a>
      <div className={css.pullRequestStatus}>{pullRequest?.state}</div>
    </div>
  )
}
