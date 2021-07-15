import React, { useRef, useState, useLayoutEffect, useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import cx from 'classnames'
import { Color, Container, Text, Icon, Button } from '@wings-software/uicore'
import type { MonitoringSource } from 'services/cv'
import { chartsConfig } from './DeeploymentMetricsChartConfig'
import {
  healthSourceTypeToLogo,
  transformControlAndTestDataToHighChartsSeries
} from './DeploymentMetricsAnalysisRow.utils'
import type { HostTestData } from './DeploymentMetricsAnalysisRow.constants'
import css from './DeploymentMetricsAnalysisRow.module.scss'

export interface DeploymentMetricsAnalysisRowProps {
  healthSourceType: MonitoringSource['type']
  transactionName: string
  metricName: string
  controlData?: Highcharts.SeriesLineOptions['data'][]
  testData?: HostTestData[]
  className?: string
}

export function DeploymentMetricsAnalysisRow(props: DeploymentMetricsAnalysisRowProps): JSX.Element {
  const { healthSourceType, transactionName, metricName, controlData, testData, className } = props
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const [graphWidth, setGraphWidth] = useState(0)
  const [indxOfLastVisibleGraph, setIndexOfLastVisibleGraph] = useState(3)
  const charts: Highcharts.SeriesLineOptions[][] = useMemo(() => {
    return transformControlAndTestDataToHighChartsSeries(controlData || [], testData || [])
  }, [controlData, testData])

  useLayoutEffect(() => {
    if (!graphContainerRef?.current) {
      return
    }
    const containerWidth = graphContainerRef.current.getBoundingClientRect().width
    setGraphWidth(containerWidth / 3)
  }, [graphContainerRef])

  return (
    <Container className={cx(css.main, className)}>
      <Container className={css.transactionMetric}>
        <Icon name={healthSourceTypeToLogo(healthSourceType)} size={25} />
        <Text intent="primary" lineClamp={1} width={152}>
          {transactionName}
        </Text>
        <Text color={Color.BLACK} lineClamp={1} width={152} font={{ size: 'small' }}>
          {metricName}
        </Text>
      </Container>
      {indxOfLastVisibleGraph - 3 > 0 ? (
        <Button
          className={css.scrollArrow}
          data-name="previousArrow"
          icon="chevron-left"
          onClick={() => {
            if (graphContainerRef.current) {
              graphContainerRef.current.scrollLeft -= graphWidth + 4 * (indxOfLastVisibleGraph - 3)
              setIndexOfLastVisibleGraph(lastIndex => lastIndex - 1)
            }
          }}
        />
      ) : (
        <Container className={css.scrollArrowPlaceholder} />
      )}
      <div className={css.graphs} ref={graphContainerRef}>
        {charts.map((series, index) => (
          <HighchartsReact key={index} highcharts={Highcharts} options={chartsConfig(series, graphWidth)} />
        ))}
      </div>
      {indxOfLastVisibleGraph < charts.length ? (
        <Button
          className={css.scrollArrow}
          data-name="nextArrow"
          icon="chevron-right"
          onClick={() => {
            if (graphContainerRef.current) {
              graphContainerRef.current.scrollLeft += graphWidth + 4 * (indxOfLastVisibleGraph - 3)
              setIndexOfLastVisibleGraph(lastIndex => lastIndex + 1)
            }
          }}
        />
      ) : (
        <Container className={css.scrollArrowPlaceholder} />
      )}
    </Container>
  )
}
