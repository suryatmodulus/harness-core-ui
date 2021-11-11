import React from 'react'
import { Text, Container, Layout, Heading, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import { renderFailureRate } from './TestsUtils'
import css from './BuildTests.module.scss'

interface TestsReportOverviewProps {
  totalTests: number
  failedTests: number
  skippedTests: number
  successfulTests: number
  durationMS: number
}

const now = Date.now()

export const TestsReportOverview: React.FC<TestsReportOverviewProps> = ({
  totalTests,
  failedTests,
  skippedTests,
  successfulTests,
  durationMS
}) => {
  const { getString } = useStrings()

  const failureRate = failedTests / (totalTests || 1)
  const failureRateDisplay = renderFailureRate(failureRate) + `%`

  return (
    <Container className={css.leftContainer}>
      <Container
        flex={{ justifyContent: 'flex-start' }}
        margin={{ bottom: 'xsmall' }}
        style={{ height: 32, flexShrink: 0 }}
      >
        <Heading
          level={6}
          data-name="test-execution-overview"
          style={{ fontWeight: 600, marginBottom: 'var(--spacing-3)' }}
          color={Color.GREY_600}
          margin={{ right: 'medium' }}
        >
          {getString('overview')}
        </Heading>
        <Duration
          style={{ marginBottom: 'var(--spacing-3)' }}
          color={Color.GREY_400}
          iconProps={{ color: Color.GREY_400 }}
          durationText=" "
          icon="time"
          startTime={now - durationMS}
          endTime={now}
        ></Duration>
      </Container>
      <Container className={cx(css.widget, css.reportsOverview)} padding="medium">
        <Layout.Horizontal spacing="small" margin={{ bottom: 'small' }}>
          <Text className={css.stats} width="40%" background={Color.GREY_100} padding="small">
            {getString('pipeline.testsReports.totalExecutedTest')}
            <span className={cx(css.statsNumber)}>{totalTests}</span>
          </Text>
          <Text className={css.stats} width="30%" background={Color.RED_200} padding="small" color={Color.RED_800}>
            {getString('pipeline.testsReports.failedTests')}
            <span className={cx(css.statsNumber)}>{failedTests}</span>
          </Text>
          <Text className={css.stats} width="30%" background={Color.RED_200} padding="small" color={Color.RED_800}>
            {getString('common.failureRate')}
            <span className={cx(css.statsNumber)}>{failureRateDisplay}</span>
          </Text>
        </Layout.Horizontal>
        <Text className={css.overviewResultLabel} padding={{ top: 'medium', bottom: 'medium' }} color={Color.GREY_400}>
          {getString('pipeline.testsReports.resultLabel')}
        </Text>
        <Layout.Horizontal margin={{ bottom: 'medium' }} spacing="medium">
          <Text inline icon="stop" iconProps={{ size: 16, style: { color: '#DA291D' } }}>
            {getString('failed')}
            {` (${failedTests})`}
          </Text>
          <Text inline icon="stop" iconProps={{ size: 16, style: { color: '#6BD167' } }}>
            {getString('passed')}
            {` (${successfulTests})`}
          </Text>
          <Text inline icon="stop" iconProps={{ size: 16, color: Color.GREY_300 }}>
            {getString('pipeline.testsReports.skipped')}
            {` (${skippedTests})`}
          </Text>
        </Layout.Horizontal>
        <Container className={css.graphWrapper}>
          <Container className={css.graphContainer}>
            <ul className={css.graph}>
              {Array.from(Array(failedTests)).map((_, index) => (
                <li key={index} data-status="failed"></li>
              ))}
              {Array.from(Array(successfulTests)).map((_, index) => (
                <li key={index}></li>
              ))}
              {Array.from(Array(skippedTests)).map((_, index) => (
                <li key={index} data-status="skipped"></li>
              ))}
            </ul>
          </Container>
        </Container>
      </Container>
    </Container>
  )
}
