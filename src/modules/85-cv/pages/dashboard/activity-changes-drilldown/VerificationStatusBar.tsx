import React, { useState } from 'react'
import { Container, Text, Button, Color } from '@wings-software/uicore'
import { Collapse } from '@blueprintjs/core'
import classnames from 'classnames'
import moment from 'moment'
import { RiskScoreTile } from '@cv/components/RiskScoreTile/RiskScoreTile'
import {
  MetricCategoriesWithRiskScore,
  CategoriesWithRiskScoreProps
} from '@cv/components/MetricCategoriesWithRiskScore/MetricCategoriesWithRiskScore'
import type { VerificationResult } from 'services/cv'
import i18n from './ActivityChangesDrilldownView.i18n'
import styles from './VerificationStatusBar.module.scss'

export interface VerificationStatusBarProps {
  status: VerificationResult['status']
  startTime: number
  remainingTimeMs: number
  cumulativeRisk: number
  scoresBeforeChanges: CategoriesWithRiskScoreProps['categoriesWithRiskScores']
  scoresAfterChanges: CategoriesWithRiskScoreProps['categoriesWithRiskScores']
  dropDownContent?: JSX.Element
}

export default function VerificationStatusBar({
  status,
  startTime,
  remainingTimeMs,
  cumulativeRisk,
  scoresBeforeChanges,
  scoresAfterChanges,
  dropDownContent
}: VerificationStatusBarProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <Container className={styles.main}>
        <Container className={classnames(styles.column, styles.statusGroup)}>
          <Text color={Color.BLACK}>{`${i18n.verification} ${mapStatus(status, remainingTimeMs)}`}</Text>
          <Text style={{ fontSize: 12 }}>{`${i18n.startedOn}: ${moment(startTime).format('MMM D, h:mm:ss a')}`}</Text>
        </Container>
        <Container className={classnames(styles.column, styles.risksGroup)}>
          <Text>{i18n.riskBeforeChanges}</Text>
          <MetricCategoriesWithRiskScore
            infoContainerClassName={styles.infoContainer}
            categoriesWithRiskScores={scoresBeforeChanges}
          />
        </Container>
        <Container className={classnames(styles.column, styles.risksGroup)}>
          <Text>{i18n.riskAfterChanges}</Text>
          <MetricCategoriesWithRiskScore
            infoContainerClassName={styles.infoContainer}
            categoriesWithRiskScores={scoresAfterChanges}
          />
        </Container>
        <Container className={classnames(styles.column, styles.cumulativeRisk)}>
          <RiskScoreTile riskScore={cumulativeRisk} isLarge />
          <Text>
            {i18n.cumulative}
            <br />
            {i18n.risk}
          </Text>
          {!!dropDownContent && (
            <Button
              small
              minimal
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              onClick={() => setExpanded(!expanded)}
            />
          )}
        </Container>
      </Container>
      <Collapse isOpen={expanded}>{dropDownContent}</Collapse>
    </>
  )
}

export function mapStatus(status: VerificationResult['status'], remainingTimeMs?: number): string {
  switch (status) {
    case 'IN_PROGRESS':
      return `${i18n.inProgress} (${Math.floor(remainingTimeMs! / (1000 * 60))} ${i18n.minutesRemaining})`
    case 'VERIFICATION_PASSED':
      return i18n.passed
    case 'VERIFICATION_FAILED':
    case 'ERROR':
      return i18n.failed
    default:
      return i18n.notStarted
  }
}
