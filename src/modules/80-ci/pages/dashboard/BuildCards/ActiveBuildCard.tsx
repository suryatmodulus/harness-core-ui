import React from 'react'
import { Container, Text, Icon, Color } from '@wings-software/uicore'
import classnames from 'classnames'
import styles from './BuildCards.module.scss'

export interface ActiveBuildCardProps {
  title: string
  message: string
  status: 'PENDING' | 'RUNNING'
}

const PendingApprovalLabel = () => (
  <div className={classnames(styles.statusLabel, styles.pendingApprovalLabel)}>
    <Icon className={styles.statusLabelIcon} name="time" />
    PENDING APPROVAL
  </div>
)

const RunningLabel = () => (
  <div className={classnames(styles.statusLabel, styles.runningLabel)}>
    <Icon className={styles.statusLabelIcon} name="refresh" />
    RUNNING
  </div>
)

export default function ActiveBuildCard({ title, message, status }: ActiveBuildCardProps) {
  return (
    <Container className={styles.activeBuildCard}>
      <Icon name="ci-active-build" className={styles.buildIcon} />
      <Container className={styles.titleAndMessage}>
        <Text className={styles.title} font={{ weight: 'bold' }} color={Color.BLACK} lineClamp={1}>
          {title}
        </Text>
        <Text font={{ size: 'small' }} color={Color.BLACK} lineClamp={1}>
          {message}
        </Text>
      </Container>
      <Container>
        {status === 'PENDING' && <PendingApprovalLabel />}
        {status === 'RUNNING' && <RunningLabel />}
      </Container>
    </Container>
  )
}
