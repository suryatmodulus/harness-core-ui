import React, { useState } from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { TimePeriodEnum } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import HealthScoreChart from '@cv/pages/monitored-service/components/ServiceHealth/components/HealthScoreChart/HealthScoreChart'
import ServiceDependenciesLegend from '@cv/components/ServiceDependenciesLegend/ServiceDependenciesLegend'
import { TimestampChart } from '@cv/components/ChangeTimeline/components/TimestampChart/TimestampChart'
import { getColorForChangeEventType } from '@cv/components/ChangeTimeline/ChangeTimeline.utils'
import type { ChangeEventServiceHealthProps } from './ChangeEventServiceHealth.types'
import { TWO_HOURS_IN_MILLISECONDS, COLUMN_CHART_PROPS } from './ChangeEventServiceHealth.constants'
import css from './ChangeEventServiceHealth.module.scss'

export default function ChangeEventServiceHealth(props: ChangeEventServiceHealthProps): JSX.Element {
  const { serviceIdentifier, envIdentifier, startTime, eventType } = props
  const { getString } = useStrings()
  const [timestamps, setTimestamps] = useState<number[]>([])
  return (
    <Container className={css.main}>
      <Text className={css.status}>{getString('status')}</Text>
      <Text className={css.healthTrend}>{getString('cv.serviceHealthTrend')}</Text>
      <HealthScoreChart
        envIdentifier={envIdentifier}
        serviceIdentifier={serviceIdentifier}
        duration={TimePeriodEnum.FOUR_HOURS}
        columChartProps={{
          ...COLUMN_CHART_PROPS,
          timestampMarker: {
            timestamp: startTime,
            color: getColorForChangeEventType(eventType)
          }
        }}
        endTime={startTime + TWO_HOURS_IN_MILLISECONDS}
        setHealthScoreData={riskData => {
          const updatedTimestamps = []
          for (const data of riskData || []) {
            if (data.endTime && data.startTime) {
              updatedTimestamps.push(data.startTime)
              updatedTimestamps.push(data.endTime)
            }
          }
          setTimestamps(updatedTimestamps)
        }}
      />
      <Container className={css.timestamps}>
        <TimestampChart timestamps={timestamps} tickAmount={5} />
      </Container>
      <ServiceDependenciesLegend className={css.legend} />
    </Container>
  )
}
