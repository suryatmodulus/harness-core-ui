import { Container, Text } from '@wings-software/uicore'
import React from 'react'
import metricsAndLogsImage from '@cv/assets/metricsAndLogs.svg'
import { useStrings } from 'framework/strings'
import Card from '@cv/components/Card/Card'
import LogAnalysisContainer from './components/LogAnalysisContainer/LogAnalysisContainer'
import type { MetricsAndLogsProps } from './MetricsAndLogs.types'
import MetricsAnalysisContainer from './components/MetricsAnalysisContainer/MetricsAnalysisContainer'
import css from './MetricsAndLogs.module.scss'

export default function MetricsAndLogs(props: MetricsAndLogsProps): JSX.Element {
  const { startTime, endTime, serviceIdentifier, environmentIdentifier } = props
  const { getString } = useStrings()

  return (
    <Container className={css.metricsLogsContainer}>
      <Text font={{ weight: 'bold', size: 'normal' }} padding={{ bottom: 'small' }}>
        {getString('cv.monitoredServices.serviceHealth.metricsAndLogs')}
      </Text>

      {startTime && endTime && serviceIdentifier && environmentIdentifier ? (
        <Container className={css.analysisContainer} data-testid="analysis-view">
          <MetricsAnalysisContainer {...props} />
          <LogAnalysisContainer {...props} />
        </Container>
      ) : (
        <Card>
          <Container className={css.noTimeRangeSelected} data-testid="analysis-image-view">
            <img src={metricsAndLogsImage} width={600} />
            <Text>{getString('cv.monitoredServices.serviceHealth.selectTimeline')}</Text>
          </Container>
        </Card>
      )}
    </Container>
  )
}
