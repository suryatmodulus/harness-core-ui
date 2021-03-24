import React from 'react'
import cx from 'classnames'
import { Heading, Text, Container, Color, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { TestReportSummary } from 'services/ti-service'
import { TestStatus } from './TestsUtils'
import css from './BuildTests.module.scss'

interface TestsExecutionResultProps {
  totalTests: number
  tests: NonNullable<TestReportSummary['tests']>
}

export const TestsExecutionResult: React.FC<TestsExecutionResultProps> = ({ totalTests, tests }) => {
  const { getString } = useStrings()

  const failedTests = tests.filter(({ status }) => status === TestStatus.FAILED || status === TestStatus.ERROR).length
  const skippedTests = tests?.filter(({ status }) => status === TestStatus.SKIPPED).length
  const passedTests = totalTests - failedTests - skippedTests

  return (
    <div className={cx(css.widgetWrapper, css.executionResult)}>
      <Container flex={{ justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
        <Heading level={2} font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('ci.testsReports.resultLabel')}
        </Heading>
        <Button
          icon="question"
          minimal
          tooltip={getString('ci.testsReports.resultInfo')}
          iconProps={{ size: 14 }}
          margin={{ left: 'xsmall' }}
        />
      </Container>

      <Container className={css.widget} height="100%" padding="medium">
        <Container flex margin={{ bottom: 'small' }}>
          <Text font={{ weight: 'semi-bold' }} style={{ fontSize: 10 }}>
            {getString('ci.testsReports.totalWithColon')} {totalTests} | {getString('ci.testsReports.failedWithColon')}{' '}
            {failedTests} | {getString('ci.testsReports.successWithColon')} {passedTests} |{' '}
            {getString('ci.testsReports.skippedWithColon')} {skippedTests}
          </Text>
          <Container flex>
            <Text
              font={{ weight: 'semi-bold' }}
              icon="stop"
              iconProps={{ size: 16, style: { color: '#DA291D' } }}
              margin={{ right: 'xsmall' }}
              style={{ fontSize: 10 }}
            >
              {getString('failed')}
            </Text>
            <Text
              font={{ weight: 'semi-bold' }}
              icon="stop"
              iconProps={{ size: 16, style: { color: '#6BD167' } }}
              margin={{ right: 'xsmall' }}
              style={{ fontSize: 10 }}
            >
              {getString('passed')}
            </Text>
            <Text
              font={{ weight: 'semi-bold' }}
              icon="stop"
              iconProps={{ size: 16, color: Color.GREY_300 }}
              style={{ fontSize: 10 }}
            >
              {getString('ci.testsReports.skipped')}
            </Text>
          </Container>
        </Container>
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
    </div>
  )
}
