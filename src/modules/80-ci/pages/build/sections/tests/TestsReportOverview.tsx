import React from 'react'
import { Text, Container, Layout, Heading, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/exports'
import type { TestReportSummary } from 'services/ti-service'
import { Duration } from '@common/exports'
import { renderFailureRate, TestStatus } from './TestsUtils'
import css from './BuildTests.module.scss'

interface TestsReportOverviewProps {
  totalTests: number
  durationMS: number
  tests: NonNullable<TestReportSummary['tests']>
}

const now = Date.now()

export const TestsReportOverview: React.FC<TestsReportOverviewProps> = ({ totalTests, durationMS, tests }) => {
  const { getString } = useStrings()

  const failedTests = tests.filter(({ status }) => status === TestStatus.FAILED || status === TestStatus.ERROR).length
  const skippedTests = tests.filter(({ status }) => status === TestStatus.SKIPPED).length
  const passedTests = totalTests - failedTests - skippedTests
  const failureRate = failedTests / (totalTests || 1)
  const failureRateDisplay = renderFailureRate(failureRate) + `%`

  return (
    <Container className={css.leftContainer}>
      <Container
        flex={{ justifyContent: 'flex-start' }}
        margin={{ bottom: 'xsmall' }}
        style={{ height: 32, flexShrink: 0 }}
      >
        <Heading level={2} font={{ weight: 'semi-bold' }} color={Color.GREY_600} margin={{ right: 'medium' }}>
          {getString('overview')}
        </Heading>
        <Duration
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
            {getString('ci.testsReports.totalExecutedTest')}
            <span className={cx(css.statsNumber)}>{totalTests}</span>
          </Text>
          <Text className={css.stats} width="30%" background={Color.RED_200} padding="small" color={Color.RED_800}>
            {getString('ci.testsReports.failedTests')}
            <span className={cx(css.statsNumber)}>{failedTests}</span>
          </Text>
          <Text className={css.stats} width="30%" background={Color.RED_200} padding="small" color={Color.RED_800}>
            {getString('ci.testsReports.failureRate')}
            <span className={cx(css.statsNumber)}>{failureRateDisplay}</span>
          </Text>
        </Layout.Horizontal>
        <Text className={css.overviewResultLabel} padding={{ top: 'medium', bottom: 'medium' }} color={Color.GREY_400}>
          {getString('ci.testsReports.resultLabel')}
        </Text>
        <Layout.Horizontal margin={{ bottom: 'medium' }} spacing="medium">
          <Text inline icon="stop" iconProps={{ size: 16, style: { color: '#DA291D' } }}>
            {getString('failed')}
            {` (${failedTests})`}
          </Text>
          <Text inline icon="stop" iconProps={{ size: 16, style: { color: '#6BD167' } }}>
            {getString('passed')}
            {` (${passedTests})`}
          </Text>
          <Text inline icon="stop" iconProps={{ size: 16, color: Color.GREY_300 }}>
            {getString('ci.testsReports.skipped')}
            {` (${skippedTests})`}
          </Text>
        </Layout.Horizontal>
        <Container className={css.graphWrapper}>
          <Container className={css.graphContainer}>
            <ul className={css.graph}>
              {tests.map((test, index) => (
                <li key={(test.name as string) + index} data-status={test.status}>
                  <Text inline /*tooltip={test.name} TODO: Performance issue, disable for now */>&nbsp;</Text>
                </li>
              ))}
            </ul>
          </Container>
        </Container>
      </Container>
    </Container>
  )
}
