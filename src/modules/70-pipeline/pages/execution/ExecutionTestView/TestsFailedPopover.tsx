import React from 'react'
import { Container, Heading, Layout, Text, Color } from '@wings-software/uicore'
import Ansi from 'ansi-to-react'
import { useStrings } from 'framework/strings'
import type { TestCase } from 'services/ti-service'
import css from './BuildTests.module.scss'

const PopoverSection: React.FC<{ label: string; content: string }> = props => {
  const { label, content } = props
  return (
    <Container>
      <Heading className={css.testPopoverHeading} level={3} font={{ weight: 'bold' }}>
        {label}
      </Heading>
      <Text className={css.testPopoverDetail} font={{ mono: true }}>
        <Ansi useClasses>{content}</Ansi>
      </Text>
    </Container>
  )
}

export const TestsFailedPopover: React.FC<{
  testCase: TestCase
  openTestsFailedModal?: (errorContent: JSX.Element) => void
}> = ({ testCase, openTestsFailedModal }) => {
  const { getString } = useStrings()
  const { result: { status = '', message, desc, type } = {}, stderr: stacktrace, stdout: output } = testCase

  const failed = ['error', 'failed'].includes(status)

  if (failed) {
    const errorContent = (
      <Layout.Vertical spacing="xlarge" padding="xlarge" className={css.testPopoverBody}>
        {status && <PopoverSection label={getString('pipeline.testsReports.status')} content={status} />}

        {type && <PopoverSection label={getString('pipeline.testsReports.type')} content={type} />}

        {message && <PopoverSection label={getString('pipeline.testsReports.failureMessage')} content={message} />}

        {desc && <PopoverSection label={getString('pipeline.testsReports.description')} content={desc} />}

        {stacktrace && <PopoverSection label={getString('pipeline.testsReports.stackTrace')} content={stacktrace} />}

        {output && <PopoverSection label={getString('pipeline.testsReports.consoleOutput')} content={output} />}
      </Layout.Vertical>
    )
    return (
      <Layout.Vertical>
        {errorContent}
        <Text
          padding="xlarge"
          style={{ cursor: 'pointer' }}
          color={Color.PRIMARY_7}
          onClick={e => {
            e.stopPropagation()
            openTestsFailedModal?.(errorContent)
          }}
        >
          {getString('pipeline.clickToExpandErrorDetails')}
        </Text>
      </Layout.Vertical>
    )
  }

  return null
}
