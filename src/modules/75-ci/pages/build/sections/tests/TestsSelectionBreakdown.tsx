import React from 'react'
import cx from 'classnames'
import { Text, Container, Heading, Color, Button } from '@wings-software/uicore'
import { ProgressBar } from '@blueprintjs/core'
import { useStrings } from 'framework/exports'
import css from './BuildTests.module.scss'

export interface TestsSelectionBreakdownProps {
  sourceCodeChanges: number
  newTests: number
  updatedTests: number
}

export const TestsSelectionBreakdown: React.FC<TestsSelectionBreakdownProps> = ({
  sourceCodeChanges,
  newTests,
  updatedTests
}) => {
  const { getString } = useStrings()

  const selectedTests = sourceCodeChanges + newTests + updatedTests

  return (
    <div className={cx(css.widgetWrapper, css.selectionBreakdown)}>
      <Container flex={{ justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
        <Heading level={2} font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('ci.testsReports.selectionBreakdown')}
        </Heading>
        <Button
          icon="question"
          minimal
          tooltip={getString('ci.testsReports.selectionBreakdownInfo')}
          iconProps={{ size: 14 }}
          margin={{ left: 'xsmall' }}
        />
      </Container>

      <Container className={css.widget} height="100%">
        <Container className={css.section} flex>
          <Text className={css.type} color={Color.GREY_800}>
            <Text color={Color.GREY_800}>{getString('ci.testsReports.correlatedWithCodeChanges')}</Text>
            <ProgressBar
              className={css.testsSelectionBreakdown}
              animate={false}
              stripes={false}
              value={sourceCodeChanges / selectedTests}
            />
          </Text>
          <Text className={css.number} font={{ weight: 'bold' }} color={Color.GREY_800}>
            {sourceCodeChanges}
          </Text>
        </Container>

        <Container className={css.section} flex>
          <Text className={css.type} color={Color.GREY_800}>
            <Text color={Color.GREY_800}>{getString('ci.testsReports.newTests')}</Text>
            <ProgressBar
              className={css.testsSelectionBreakdown}
              animate={false}
              stripes={false}
              value={newTests / selectedTests}
            />
          </Text>
          <Text className={css.number} font={{ weight: 'bold' }} color={Color.GREY_800}>
            {newTests}
          </Text>
        </Container>

        <Container className={css.section} flex>
          <Text className={css.type} color={Color.GREY_800}>
            <Text color={Color.GREY_800}>{getString('ci.testsReports.updatedTests')}</Text>
            <ProgressBar
              className={css.testsSelectionBreakdown}
              animate={false}
              stripes={false}
              value={updatedTests / selectedTests}
            />
          </Text>
          <Text className={css.number} font={{ weight: 'bold' }} color={Color.GREY_800}>
            {updatedTests}
          </Text>
        </Container>
      </Container>
    </div>
  )
}
