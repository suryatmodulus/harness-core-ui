import React, { useState } from 'react'
import { Container, Text, Button, Color } from '@wings-software/uicore'
import { Collapse } from '@blueprintjs/core'
import classnames from 'classnames'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { RiskScoreTile } from '@cv/components/RiskScoreTile/RiskScoreTile'
import {
  MetricCategoriesWithRiskScore,
  CategoriesWithRiskScoreProps
} from '@cv/components/MetricCategoriesWithRiskScore/MetricCategoriesWithRiskScore'
import type { VerificationResult } from 'services/cv'
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
  const { getString } = useStrings()
  return (
    <>
      <Container className={styles.main}>
        <Container className={classnames(styles.column, styles.statusGroup)}>
          <Text color={Color.BLACK}>{`${getString('cv.admin.notifications.create.stepThree.verification')} ${mapStatus(
            status,
            getString,
            remainingTimeMs
          )}`}</Text>
          <Text style={{ fontSize: 12 }}>{`${getString('pipeline.startedOn')}: ${moment(startTime).format(
            'MMM D, h:mm:ss a'
          )}`}</Text>
        </Container>
        <Container className={classnames(styles.column, styles.risksGroup)}>
          <Text>{getString('cv.activityChanges.riskBeforeChange')}</Text>
          <MetricCategoriesWithRiskScore
            infoContainerClassName={styles.infoContainer}
            categoriesWithRiskScores={scoresBeforeChanges}
          />
        </Container>
        <Container className={classnames(styles.column, styles.risksGroup)}>
          <Text>{getString('cv.activityChanges.riskAfterChange')}</Text>
          <MetricCategoriesWithRiskScore
            infoContainerClassName={styles.infoContainer}
            categoriesWithRiskScores={scoresAfterChanges}
          />
        </Container>
        <Container className={classnames(styles.column, styles.cumulativeRisk)}>
          <RiskScoreTile riskScore={cumulativeRisk} isLarge />
          <Text>
            {getString('cv.activityChanges.cumulative')}
            <br />
            {getString('risk')}
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

export function mapStatus(
  status: VerificationResult['status'],
  getString: UseStringsReturn['getString'],
  remainingTimeMs?: number
): string {
  switch (status) {
    case 'IN_PROGRESS':
      return `${getString('inProgress')} (${Math.floor(remainingTimeMs! / (1000 * 60))} ${getString(
        'cv.activityChanges.minutesRemaining'
      ).toLocaleLowerCase()})`
    case 'VERIFICATION_PASSED':
      return getString('passed').toLocaleLowerCase()
    case 'VERIFICATION_FAILED':
    case 'ERROR':
      return getString('failed').toLocaleLowerCase()
    default:
      return getString('pipeline.executionStatus.NotStarted').toLocaleLowerCase()
  }
}
