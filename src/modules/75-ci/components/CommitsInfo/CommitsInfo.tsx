import React, { useState } from 'react'
import { first } from 'lodash-es'
import { Text, Button, Icon, Utils, Container } from '@wings-software/uicore'
import { Collapse } from '@blueprintjs/core'
import type { CIBuildCommit } from 'services/ci'
import { String, useStrings } from 'framework/strings'
import { UserLabel, TimeAgoPopover } from '@common/exports'

import css from './CommitsInfo.module.scss'

export interface CommitIdProps {
  commitId: string
  commitLink?: string
}

export function CommitId({ commitId, commitLink }: CommitIdProps): React.ReactElement {
  const [isCommitIdCopied, setIsCommitIdCopied] = useState(false)
  const { getString } = useStrings()

  const slicedCommitId = commitId.slice(0, 7)

  const handleCopyButtonClick = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    Utils.copy(commitLink || commitId)
    setIsCommitIdCopied(true)
  }

  const handleCopyButtonTooltipClosed = (): void => {
    setIsCommitIdCopied(false)
  }

  const handleLinkClick = (event: any): void => {
    event.stopPropagation()
    window.open(event.target.href, '_blank')
  }

  return (
    <Text className={css.commitId}>
      {commitLink ? (
        <a className={css.label} href={commitLink} rel="noreferrer" target="_blank" onClick={handleLinkClick}>
          {slicedCommitId}
        </a>
      ) : (
        <span className={css.label}>{slicedCommitId}</span>
      )}
      <Text
        tooltip={
          <Container padding="small">{getString(isCommitIdCopied ? 'copiedToClipboard' : 'clickToCopy')}</Container>
        }
        tooltipProps={{
          onClosed: handleCopyButtonTooltipClosed
        }}
        style={{ cursor: 'pointer' }}
      >
        <Icon name="copy" size={14} onClick={handleCopyButtonClick} />
      </Text>
    </Text>
  )
}

export interface LastCommitProps {
  lastCommit: CIBuildCommit
}

export function LastCommit({ lastCommit }: LastCommitProps): React.ReactElement {
  return (
    <Text className={css.lastCommit}>
      <Icon className={css.icon} name="git-commit" size={14} />
      <div style={{ fontSize: 0 }}>
        <Text className={css.message} tooltip={<Container padding="small">{lastCommit.message}</Container>}>
          {lastCommit.message}
        </Text>
      </div>
      {lastCommit?.id && <CommitId commitId={lastCommit.id} commitLink={lastCommit.link} />}
    </Text>
  )
}

export interface CommitsInfoProps {
  commits?: CIBuildCommit[]
  authorAvatar?: string
}

export function CommitsInfo(props: CommitsInfoProps): React.ReactElement | null {
  const [showCommits, setShowCommits] = React.useState(false)

  const { commits = [], authorAvatar } = props
  const lastCommit = first(commits || [])

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
                  <div style={{ fontSize: 0 }}>
                    <Text className={css.commitText} tooltip={<Container padding="small">{commit.message}</Container>}>
                      {commit.message}
                    </Text>
                  </div>
                  <Container flex>
                    {commit.ownerName && (
                      <UserLabel
                        className={css.user}
                        name={commit.ownerName}
                        email={commit.ownerEmail}
                        profilePictureUrl={authorAvatar}
                        iconProps={{ size: 16 }}
                      />
                    )}
                    <TimeAgoPopover time={commit.timeStamp || 0} inline={false} />
                  </Container>
                  {commit.id && <CommitId commitId={commit.id} commitLink={commit.link} />}
                </div>
              )
            })}
          </Collapse>
        </React.Fragment>
      ) : null}
    </div>
  )
}
