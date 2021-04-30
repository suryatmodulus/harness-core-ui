import React from 'react'
import { Container, Text, Avatar, Icon, Color } from '@wings-software/uicore'
import moment from 'moment'
import styles from './BuildCards.module.scss'

export interface FailedBuildCardProps {
  title: string
  message: string
  username?: string
  branchName?: string
  commitId?: string
  startTime: number
  endTime: number
}

export default function FailedBuildCard({
  title,
  message,
  username,
  branchName,
  commitId,
  startTime,
  endTime
}: FailedBuildCardProps) {
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
        <Container className={styles.times} margin={{ bottom: 'medium' }}>
          {moment(startTime).fromNow()}
          <Icon size={10} name="time" className={styles.timeIcon} />
          {formatDuration(startTime, endTime)}
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
      <div className={styles.leftBorder} />
    </Container>
  )
}

export function formatDuration(startTime: number, endTime: number) {
  const diffMins = moment(endTime).diff(startTime, 'minutes')
  return diffMins <= 180 ? `${diffMins}m` : `${moment(endTime).diff(startTime, 'hours')}h`
}

export function shortenCommitId(commitId: string) {
  return commitId?.length && commitId.length > 7 ? commitId.slice(commitId.length - 7) : commitId
}
