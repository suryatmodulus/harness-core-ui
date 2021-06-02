import React, { useMemo } from 'react'
import { Icon, Text, Container, Layout, Heading, Color, timeToDisplayText } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import css from './BuildTests.module.scss'

interface TestsOverviewProps {
  totalTests: number
  skippedTests: number
  timeSavedMS: number
  durationMS?: number
  testsCountDiff?: number
}

const now = Date.now()

export const TestsOverview: React.FC<TestsOverviewProps> = ({
  totalTests,
  skippedTests,
  timeSavedMS,
  durationMS,
  testsCountDiff
}) => {
  const { getString } = useStrings()

  const selectedTests = totalTests - skippedTests

  const timeSavedToDisplay: string = useMemo(() => {
    if (!timeSavedMS) {
      return '0'
    }
    return timeToDisplayText(timeSavedMS).replace(/(\d+ms)$/, '')
  }, [timeSavedMS])

  return (
    <div className={cx(css.widgetWrapper, css.overview)}>
      <Container
        flex={{ justifyContent: 'flex-start' }}
        margin={{ bottom: 'xsmall' }}
        style={{ height: 32, flexShrink: 0 }}
      >
        <Heading level={2} font={{ weight: 'semi-bold' }} color={Color.GREY_600} margin={{ right: 'medium' }}>
          {getString('pipeline.testsReports.executionOverview')}
        </Heading>
      </Container>

      <Container height="100%">
        <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
          <Text
            className={css.stats}
            padding="medium"
            color={Color.GREY_700}
            style={{ backgroundColor: 'var(--white)' }}
          >
            <Text className={cx(css.statsTitle)} margin={{ bottom: 'xlarge' }}>
              {getString('pipeline.testsReports.totalTests')}
            </Text>
            <span className={cx(css.statsNumber, css.row)}>
              {totalTests}
              {testsCountDiff && (
                <span className={cx(css.diff, { [css.diffNegative]: testsCountDiff < 0 })}>
                  <Icon name={testsCountDiff < 0 ? 'arrow-down' : 'arrow-up'} size={11} />
                  &nbsp;
                  {Math.abs(testsCountDiff)}%
                </span>
              )}
            </span>
          </Text>
          <Text
            className={css.stats}
            padding="medium"
            color={Color.GREY_700}
            style={{ position: 'relative', backgroundColor: 'var(--white)' }}
          >
            <Text className={cx(css.statsTitle)} margin={{ bottom: 'small', right: 'small' }}>
              {getString('pipeline.testsReports.numberOfSelectedTests')}
            </Text>
            <span className={cx(css.statsNumber)}>{`${selectedTests}/${totalTests}`}</span>
            <div className={css.linesWrapper}>
              {totalTests > 0 && (
                <div
                  className={cx(css.line, css.selected)}
                  style={{ height: `${selectedTests / (totalTests / 100)}%` }}
                ></div>
              )}
              {skippedTests > 0 && (
                <div className={css.line} style={{ height: `${skippedTests / (totalTests / 100)}%` }}></div>
              )}
            </div>
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="medium">
          <Text
            className={css.stats}
            padding="medium"
            color={Color.GREY_700}
            style={{ backgroundColor: 'var(--white)' }}
          >
            <Text className={cx(css.statsTitle)} margin={{ bottom: 'large' }}>
              {getString('pipeline.testsReports.totalDuration')}
            </Text>
            <Duration
              color={Color.GREY_700}
              durationText=" "
              startTime={now - (durationMS || 0)}
              endTime={now}
              style={{
                fontSize: '32px',
                fontWeight: 600
              }}
            ></Duration>
          </Text>
          <Text className={cx(css.stats, css.timeSaved)} padding="medium" color={Color.WHITE}>
            <Text className={cx(css.statsTitle)} color={Color.PURPLE_700} margin={{ bottom: 'large' }}>
              {getString('pipeline.testsReports.timeSaved')}
            </Text>
            <span className={cx(css.statsNumber)}>{timeSavedToDisplay}</span>
          </Text>
        </Layout.Horizontal>
      </Container>
    </div>
  )
}
