import React from 'react'
import { Container, Text, Avatar, Icon, Color } from '@wings-software/uicore'
import moment from 'moment'
import styles from './BuildCards.module.scss'

export interface FailedBuildCardProps {
  title: string
  message: string
  username: string
  branchName: string
  commitId: string
  durationMin: number
  timestamp: number
}

export default function FailedBuildCard({
  title,
  message,
  username,
  branchName,
  commitId,
  durationMin,
  timestamp
}: FailedBuildCardProps) {
  return (
    <Container className={styles.failedBuildCard}>
      <Avatar name={username} />
      <Container className={styles.titleAndMessage}>
        <Text className={styles.title} font={{ weight: 'bold' }} color={Color.BLACK} lineClamp={1}>
          {title}
        </Text>
        <Text font={{ size: 'small' }} color={Color.BLACK} lineClamp={1}>
          {message}
        </Text>
      </Container>
      <Container>
        <Container className={styles.times} margin={{ bottom: 'medium' }}>
          {moment(timestamp).fromNow()}
          <Icon size={14} name="time" className={styles.timeIcon} />
          {`${durationMin}m`}
        </Container>
        <Container>
          <div className={styles.linkWrap}>
            <Icon size={14} name="git-branch" />
            <a>{branchName}</a>
          </div>
          <div className={styles.linkWrap}>
            <Icon size={14} name="git-commit" />
            <a>{shortenCommitId(commitId)}</a>
          </div>
        </Container>
      </Container>
      <div className={styles.leftBorder} />
    </Container>
  )
}

function shortenCommitId(commitId: string) {
  return commitId?.length && commitId.length > 7 ? commitId.slice(0, 7) : commitId
}
