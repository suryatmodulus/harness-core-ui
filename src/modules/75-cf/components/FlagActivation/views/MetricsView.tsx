import React, { useState } from 'react'
import { Container, Tab, Tabs, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { SEVEN_DAYS_IN_MILLIS } from '@cf/utils/CFUtils'
import type { Feature } from 'services/cf'
import { MetricsToolbar } from './MetricsToolbar'
import { TabEvaluations } from './TabEvaluations'
import { TabServedTargets } from './TabServedTargets'
import css from './MetricsView.module.scss'

export const MetricsView: React.FC<{ flagData: Feature }> = ({ flagData }) => {
  const { getString } = useStrings()
  const now = Date.now()
  const [startDate, setStartDate] = useState<Date>(new Date(now - SEVEN_DAYS_IN_MILLIS))
  const [endDate, setEndDate] = useState<Date>(new Date(now))

  return (
    <Container
      style={{
        marginTop: '-20px',
        height: 'calc(100vh - 135px)',
        overflow: 'auto',
        marginLeft: 'var(--spacing-large)'
      }}
    >
      <MetricsToolbar
        startDate={startDate}
        endDate={endDate}
        onSelectedDateRangeChange={selectedDates => {
          setStartDate(selectedDates[0])
          setEndDate(selectedDates[1])
        }}
      />
      <Container style={{ padding: 'var(--spacing-xsmall) 0 0 var(--spacing-xxxlarge)' }} className={css.content}>
        <Tabs id="flag-metrics" defaultSelectedTabId="evaluations">
          <Tab
            id="evaluations"
            title={
              <Text className={'css.tabTitle'}>
                {getString('cf.featureFlags.metrics.flagEvaluations', { count: 10 })}
              </Text>
            }
            panel={<TabEvaluations flagData={flagData} startDate={startDate} endDate={endDate} />}
          />
          <Tab
            id={'served-targets'}
            title={
              <Text className={'css.tabTitle'}>{getString('cf.featureFlags.metrics.targetServed', { count: 10 })}</Text>
            }
            panel={<TabServedTargets flagData={flagData} startDate={startDate} endDate={endDate} />}
          />
        </Tabs>
      </Container>
    </Container>
  )
}
