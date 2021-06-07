import React from 'react'
import { Container, Text, Avatar, Icon, Color } from '@wings-software/uicore'
import moment from 'moment'
import classnames from 'classnames'
import { diffStartAndEndTime } from '../shared'
import styles from './BuildCards.module.scss'

export interface FailedBuildCardProps {
  title: string
  message: string
  username?: string
  branchName?: string
  commitId?: string
  startTime?: number
  endTime?: number
  silentStatus?: boolean
}

export default function FailedBuildCard({
  title,
  message,
  username,
  branchName,
  commitId,
  startTime,
  endTime,
  silentStatus
}: FailedBuildCardProps) {
  const duration = diffStartAndEndTime(startTime, endTime)
  return (
    <Container className={styles.failedBuildCard}>
      {username && <Avatar name={username} />}
      <Container className={styles.titleAndMessage}>
        <Text className={styles.title} margin={{ bottom: 'xsmall' }} color={Color.BLACK} lineClamp={1}>
          {title}
        </Text>
        <Text style={{ fontSize: 'var(--ci-font-size-small)' }} color={Color.BLACK} lineClamp={1}>
          {message}
        </Text>
      </Container>
      <Container>
        <Container
          className={classnames(styles.times, { [styles.timesColored]: silentStatus })}
          margin={{ bottom: 'medium' }}
        >
          {moment(startTime).fromNow()}
          {duration && (
            <>
              <Icon size={10} name="time" className={styles.timeIcon} />
              {duration}
            </>
          )}
        </Container>
        <Container>
          {branchName && (
            <div className={styles.linkWrap}>
              <Icon size={10} name="git-branch" />
              <a>{branchName}</a>
            </div>
          )}
          {commitId && (
            <div className={styles.linkWrap}>
              <Icon size={10} name="git-commit" />
              <a>{shortenCommitId(commitId)}</a>
            </div>
          )}
        </Container>
      </Container>
      {!silentStatus && <div className={styles.leftBorder} />}
    </Container>
  )
}

export function shortenCommitId(commitId: string) {
  return commitId?.length && commitId.length > 7 ? commitId.slice(commitId.length - 7) : commitId
}
