import React from 'react'
import { Container, Text, Icon, Color } from '@wings-software/uicore'
import classnames from 'classnames'
import pendingApprovalSvg from './PendingApproval.svg'
import styles from './BuildCards.module.scss'
export interface ActiveBuildCardProps {
  title: string
  message: string
  status: 'PENDING' | 'RUNNING'
}

const PendingApprovalLabel = () => (
  <div className={classnames(styles.statusLabel, styles.pendingApprovalLabel)}>
    <img src={pendingApprovalSvg} alt="" />
    PENDING APPROVAL
  </div>
)

const RunningLabel = () => (
  <div className={classnames(styles.statusLabel, styles.runningLabel)}>
    <Icon size={10} style={{ color: 'var(--ci-color-blue-400)' }} name="spinner" />
    RUNNING
  </div>
)

export default function ActiveBuildCard({ title, message, status }: ActiveBuildCardProps) {
  return (
    <Container className={styles.activeBuildCard}>
      <Icon name="ci-active-build" className={styles.buildIcon} />
      <Container className={styles.titleAndMessage}>
        <Text className={styles.title} margin={{ bottom: 'xsmall' }} color={Color.BLACK} lineClamp={1}>
          {title}
        </Text>
        <Text style={{ fontSize: 'var(--ci-font-size-small)' }} color={Color.BLACK} lineClamp={1}>
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
