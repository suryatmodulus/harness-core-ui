import React, { useState } from 'react'
import { first } from 'lodash-es'
import { Text, Button, Icon, Utils, Container } from '@wings-software/uicore'
import { Collapse } from '@blueprintjs/core'

import type { CIBuildCommit } from 'services/ci'
import { UserLabel } from '@common/components/UserLabel/UserLabel'
import { String, useStrings } from 'framework/strings'

import css from './CommitsInfo.module.scss'

export interface CommitIdProps {
  commitLink: string
}

export function CommitId({ commitLink }: CommitIdProps): React.ReactElement {
  const [isCommitIdCopied, setIsCommitIdCopied] = useState(false)
  const { getString } = useStrings()

  const handleCommitIdClick = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    Utils.copy(commitLink)
    setIsCommitIdCopied(true)
  }

  const handleCommitIdTooltipClosed = (): void => {
    setIsCommitIdCopied(false)
  }

  return (
    <Text
      tooltip={
        <Container padding="small">{getString(isCommitIdCopied ? 'copiedToClipboard' : 'clickToCopy')}</Container>
      }
      tooltipProps={{
        onClosed: handleCommitIdTooltipClosed
      }}
      style={{ cursor: 'pointer' }}
    >
      <Icon name="copy" size={14} onClick={e => handleCommitIdClick(e)} />
    </Text>
  )
}

export interface LastCommitProps {
  lastCommit?: CIBuildCommit
}

export function LastCommit({ lastCommit }: LastCommitProps): React.ReactElement {
  const handleCommitIdClick = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    window.open(lastCommit?.link, '_blank')
  }

  return (
    <Text className={css.lastCommit} style={{ cursor: 'pointer' }}>
      <Icon className={css.icon} name="git-commit" size={14} />
      <Text className={css.message}>{lastCommit?.message}</Text>
      <a className={css.label} href={lastCommit?.link} rel="noreferrer" target="_blank" onClick={handleCommitIdClick}>
        {lastCommit?.id?.slice(0, 7)}
      </a>
      {lastCommit?.link && <CommitId commitLink={lastCommit.link} />}
    </Text>
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
                  {commit?.link && <CommitId commitLink={commit.link} />}
                </div>
              )
            })}
          </Collapse>
        </React.Fragment>
      ) : null}
    </div>
  )
}
