import React, { useState } from 'react'
import { Container } from '@wings-software/uicore'
import cx from 'classnames'
import type { DatasourceTypeDTO } from 'services/cv'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { CVAnalysisTabs } from '@cv/components/CVAnalysisTabs/CVAnalysisTabs'
import i18n from './AnalysisDrillDownView.i18n'
import { MetricAnalysisView, MetricAnalysisViewProps } from './MetricAnalysisView/MetricAnalysisView'
import LogAnalysisView from './LogAnalysisView/LogAnalysisView'
import css from './AnalysisDrillDownView.module.scss'

export interface AnalysisDrillDownViewProps {
  className?: string
  startTime: number
  endTime: number
  historyStartTime?: number
  categoryName?: string
  environmentIdentifier?: string
  serviceIdentifier?: string
  asModal?: boolean
  shadedRegionForMetricProps?: MetricAnalysisViewProps['shadedRegionProps']
}

export function AnalysisDrillDownView(props: AnalysisDrillDownViewProps): JSX.Element | null {
  const {
    className,
    startTime,
    endTime,
    categoryName,
    environmentIdentifier,
    serviceIdentifier,
    historyStartTime,
    asModal,
    shadedRegionForMetricProps
  } = props

  const [selectedMetric, setSelectedMetric] = useState<DatasourceTypeDTO['dataSourceType'] | undefined>()

  if (!startTime || !endTime) {
    return (
      <Container height={200}>
        <NoDataCard icon="warning-sign" iconSize={30} message={i18n.noDataText} />
      </Container>
    )
  }
  return (
    <Container className={cx(asModal ? undefined : css.main, className)}>
      <CVAnalysisTabs
        onMonitoringSourceSelect={setSelectedMetric}
        serviceIdentifier={serviceIdentifier}
        environmentIdentifier={environmentIdentifier}
        metricAnalysisView={
          <MetricAnalysisView
            startTime={startTime}
            endTime={endTime}
            selectedMonitoringSource={selectedMetric}
            historyStartTime={historyStartTime}
            categoryName={categoryName}
            showHistorySelection={asModal}
            environmentIdentifier={environmentIdentifier}
            serviceIdentifier={serviceIdentifier}
            shadedRegionProps={shadedRegionForMetricProps}
          />
        }
        logAnalysisView={
          <LogAnalysisView
            startTime={startTime}
            endTime={endTime}
            categoryName={categoryName}
            historyStartTime={historyStartTime}
            serviceIdentifier={serviceIdentifier}
            environmentIdentifier={environmentIdentifier}
          />
        }
      />
    </Container>
  )
}
