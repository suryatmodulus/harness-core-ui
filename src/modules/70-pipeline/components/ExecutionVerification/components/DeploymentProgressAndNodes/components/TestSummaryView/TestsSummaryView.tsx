import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import moment from 'moment'
import type { FontProps } from '@wings-software/uicore/dist/styled-props/font/FontProps'
import { useStrings } from 'framework/strings'
import styles from './TestsSummaryView.module.scss'

export interface TestsSummaryViewProps {
  baselineTestName: string
  baselineTestDate: number
  currentTestName: string
  currentTestDate: number
}

const defaultDateFormat = 'MMM D, YYYY h:mm A'

const primaryFontProps: FontProps = { size: 'normal' }
const secondaryFontProps: FontProps = { weight: 'bold', size: 'small' }

export default function TestsSummaryView({
  baselineTestName,
  baselineTestDate,
  currentTestName,
  currentTestDate
}: TestsSummaryViewProps) {
  const { getString } = useStrings()
  return (
    <Container className={styles.testsSummaryView}>
      <Container className={styles.baselineTest}>
        <Text font={primaryFontProps} className={styles.mainLabel}>
          {getString('pipeline.verification.baselineTest')}
        </Text>
        <Text font={secondaryFontProps}>{baselineTestName || 'none'}</Text>
        <Text font={secondaryFontProps}>
          {getString('pipeline.verification.testsRan')}:
          {(baselineTestDate && moment(baselineTestDate).format(defaultDateFormat)) || 'none'}
        </Text>
      </Container>
      <Container className={styles.separator} />
      <Container>
        <Text font={primaryFontProps} className={styles.mainLabel}>
          {getString('pipeline.verification.currentTest')}
        </Text>
        <Text font={secondaryFontProps}>{currentTestName || 'none'}</Text>
        <Text font={secondaryFontProps}>
          {getString('pipeline.verification.testsRan')}:{' '}
          {(currentTestDate && moment(currentTestDate).format(defaultDateFormat)) || 'none'}
        </Text>
      </Container>
    </Container>
  )
}
