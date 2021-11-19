import React from 'react'
import { Container, Layout, Heading, Card, NoDataCard, FontVariation } from '@wings-software/uicore'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import { useStrings } from 'framework/strings'
import LogAnalysis from '@cv/components/LogsAnalysis/LogAnalysis'
import type { MetricsAndLogsProps } from './MetricsAndLogs.types'
import MetricsAnalysisContainer from './components/MetricsAnalysisContainer/MetricsAnalysisContainer'
import css from './MetricsAndLogs.module.scss'

const MetricsAndLogs: React.FC<MetricsAndLogsProps> = props => {
  const { getString } = useStrings()

  const { startTime, endTime } = props

  return (
    <Container margin={{ bottom: 'medium' }}>
      <Heading level={2} font={{ variation: FontVariation.H6 }} padding={{ bottom: 'small' }}>
        {getString('cv.monitoredServices.serviceHealth.metricsAndLogs')}
      </Heading>

      {startTime && endTime ? (
        <Layout.Horizontal data-testid="analysis-view" spacing="medium">
          <Card className={css.metricsAndLogsCard}>
            <MetricsAnalysisContainer {...props} startTime={startTime} endTime={endTime} />
          </Card>
          <Card className={css.metricsAndLogsCard}>
            <LogAnalysis {...props} startTime={startTime} endTime={endTime} />
          </Card>
        </Layout.Horizontal>
      ) : (
        <Card className={css.noServiceImageCard} data-testid="analysis-image-view">
          <NoDataCard
            image={noServiceAvailableImage}
            message={getString('cv.monitoredServices.serviceHealth.selectTimeline')}
            containerClassName={css.noDataCardContainer}
            className={css.noDataCard}
            imageClassName={css.noServiceImage}
          />
        </Card>
      )}
    </Container>
  )
}

export default MetricsAndLogs
