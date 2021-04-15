import React from 'react'
import { Container, Heading, Layout, Text } from '@wings-software/uicore'
import Ansi from 'ansi-to-react'
import { useStrings } from 'framework/exports'
import type { TestCase } from 'services/ti-service'
import css from './BuildTests.module.scss'

export const TestsFailedPopover: React.FC<{ testCase: TestCase }> = ({ testCase }) => {
  const { getString } = useStrings()
  const failed = ['error', 'failed'].includes(testCase.result?.status || '')
  const output = testCase.stdout
  const message = testCase.result?.message || testCase.result?.desc || testCase.result?.type
  const stacktrace = testCase.stderr

  if (failed) {
    return (
      <Layout.Vertical spacing="xlarge" padding="xlarge" className={css.testPopoverBody}>
        {message && (
          <Container>
            <Heading className={css.testPopoverHeading} level={3} font={{ weight: 'bold' }}>
              {getString('ci.testsReports.failureMessage')}
            </Heading>
            <Text className={css.testPopoverDetail} font={{ mono: true }}>
              <Ansi useClasses>{message}</Ansi>
            </Text>
          </Container>
        )}

        {stacktrace && (
          <Container>
            <Heading className={css.testPopoverHeading} level={3} font={{ weight: 'bold' }}>
              {getString('ci.testsReports.stackTrace')}
            </Heading>
            <Text className={css.testPopoverDetail} font={{ mono: true }}>
              <Ansi useClasses>{stacktrace}</Ansi>
            </Text>
          </Container>
        )}

        {output && (
          <Container>
            <Heading className={css.testPopoverHeading} level={3} font={{ weight: 'bold' }}>
              {getString('ci.testsReports.consoleOutput')}
            </Heading>
            <Text className={css.testPopoverDetail} font={{ mono: true }}>
              <Ansi useClasses>{output}</Ansi>
            </Text>
          </Container>
        )}
      </Layout.Vertical>
    )
  }

  return null
}
