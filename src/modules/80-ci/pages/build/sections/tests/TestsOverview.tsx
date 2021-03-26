import React from 'react'
import { Text, Container, Layout, Heading, Color, timeToDisplayText } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/exports'
import { Duration } from '@common/exports'
import css from './BuildTests.module.scss'

interface TestsOverviewProps {
  totalTests: number
  skippedTests: number
  timeSavedMS: number
  durationMS?: number
}

const now = Date.now()

export const TestsOverview: React.FC<TestsOverviewProps> = ({ totalTests, skippedTests, timeSavedMS, durationMS }) => {
  const { getString } = useStrings()

  const selectedTests = totalTests - skippedTests

  return (
    <div className={cx(css.widgetWrapper, css.overview)}>
      <Container
        flex={{ justifyContent: 'flex-start' }}
        margin={{ bottom: 'xsmall' }}
        style={{ height: 32, flexShrink: 0 }}
      >
        <Heading level={2} font={{ weight: 'semi-bold' }} color={Color.GREY_600} margin={{ right: 'medium' }}>
          {getString('ci.testsReports.executionOverview')}
        </Heading>
        {durationMS && (
          <Duration
            color={Color.GREY_600}
            iconProps={{ color: Color.GREY_450 }}
            durationText=" "
            icon="time"
            startTime={now - durationMS}
            endTime={now}
          ></Duration>
        )}
      </Container>

      <Container height="100%">
        <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
          <Text
            className={css.stats}
            padding="medium"
            color={Color.GREY_700}
            style={{ backgroundColor: 'var(--white)' }}
          >
            <Text className={cx(css.statsTitle)} margin={{ bottom: 'large' }}>
              {getString('ci.testsReports.totalTests')}
            </Text>
            <span className={cx(css.statsNumber)}>{totalTests}</span>
          </Text>
          <Text
            className={css.stats}
            padding="medium"
            color={Color.GREY_700}
            style={{ position: 'relative', backgroundColor: 'var(--white)' }}
          >
            <Text className={cx(css.statsTitle)} margin={{ bottom: 'large' }}>
              {getString('ci.testsReports.numberOfSelectedTests')}
            </Text>
            <span className={cx(css.statsNumber)}>{selectedTests}</span>
            <div className={css.linesWrapper}>
              <div className={css.line} style={{ height: `${selectedTests / (totalTests / 100)}%` }}></div>
              <div className={css.line} style={{ height: `${skippedTests / (totalTests / 100)}%` }}></div>
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
            <Text className={cx(css.statsTitle)} margin={{ bottom: 'xsmall' }}>
              {getString('ci.testsReports.testsIntelligentlySkipped')}
            </Text>
            <span className={cx(css.statsNumber)}>{skippedTests}</span>
          </Text>
          <Text className={css.stats} padding="medium" color={Color.WHITE} style={{ backgroundColor: '#4DC952' }}>
            <Text className={cx(css.statsTitle)} color={Color.WHITE} margin={{ bottom: 'large' }}>
              {getString('ci.testsReports.timeSaved')}
            </Text>
            <span className={cx(css.statsNumber)}>{timeToDisplayText(timeSavedMS) || '0ms'}</span>
          </Text>
        </Layout.Horizontal>
      </Container>
    </div>
  )
}
