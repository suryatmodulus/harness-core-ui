import React from 'react'
import { first } from 'lodash-es'
import { Text, Button, Icon, Utils } from '@wings-software/uicore'
import { Collapse, Tooltip } from '@blueprintjs/core'

import type { CIBuildCommit } from 'services/ci'
import { UserLabel } from '@common/components/UserLabel/UserLabel'
import { String, useStrings } from 'framework/strings'

import css from './CommitsInfo.module.scss'

export interface CommitIdProps {
  commitId?: string
}

export function CommitId({ commitId }: CommitIdProps): React.ReactElement {
  const [copied, setCopied] = React.useState(false)
  const { getString } = useStrings()

  function handleCopy(e: React.SyntheticEvent): void {
    e.stopPropagation()
    Utils.copy(commitId || '')
    setCopied(true)
  }

  function onClosed(): void {
    setCopied(false)
  }

  return (
    <Tooltip
      wrapperTagName="div"
      targetTagName="div"
      content={getString(copied ? 'copiedToClipboard' : 'clickToCopy')}
      onClosed={onClosed}
      position="top"
    >
      <div className={css.commitId} onClick={handleCopy}>
        <Icon name="clipboard-alt" size={10} />
        <div className={css.sha}>{commitId?.slice(0, 6)}</div>
      </div>
    </Tooltip>
  )
}

export interface LastCommitProps {
  lastCommit?: CIBuildCommit
}

export function LastCommit({ lastCommit }: LastCommitProps): React.ReactElement {
  return (
    <div className={css.lastCommit}>
      <Icon className={css.icon} name="git-commit" size={14} />
      <Text className={css.message}>{lastCommit?.message}</Text>
      <CommitId commitId={lastCommit?.id} />
    </div>
  )
}

export interface CommitsInfoProps {
  commits?: CIBuildCommit[]
}

export function CommitsInfo(props: CommitsInfoProps): React.ReactElement | null {
  const { commits = [] } = props
  const lastCommit = first(commits || [])

  const [showCommits, setShowCommits] = React.useState(false)

  function toggleCommits(e: React.SyntheticEvent): void {
    e.stopPropagation()
    setShowCommits(status => !status)
  }

  if (!lastCommit) return null

  return (
    <div className={css.commitsInfo}>
      <LastCommit lastCommit={lastCommit} />
      {commits && commits.length > 1 ? (
        <React.Fragment>
          <div className={css.divider} data-show={showCommits} />
          <Button
            minimal
            icon={showCommits ? 'minus' : 'plus'}
            className={css.moreCommits}
            iconProps={{ size: 8 }}
            onClick={toggleCommits}
          >
            <String stringID="ci.moreCommitsLabel" />
          </Button>

          <Collapse isOpen={showCommits}>
            {commits.slice(1).map((commit, i) => {
              return (
                <div className={css.commit} key={i}>
                  <Text lineClamp={1}>{commit.message}</Text>
                  <UserLabel className={css.user} name={commit.ownerName || ''} iconProps={{ size: 16 }} />
                  <CommitId commitId={commit.id} />
                </div>
              )
            })}
          </Collapse>
        </React.Fragment>
      ) : null}
    </div>
  )
}
