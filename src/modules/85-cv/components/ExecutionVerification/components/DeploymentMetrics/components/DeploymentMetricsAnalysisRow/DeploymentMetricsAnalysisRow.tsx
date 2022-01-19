import React, { useRef, useState, useLayoutEffect, useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import cx from 'classnames'
import { Color, Container, Text, Icon, Button, Layout } from '@wings-software/uicore'
import type { TransactionMetric } from 'services/cv'
import { useStrings } from 'framework/strings'
import { chartsConfig } from './DeeploymentMetricsChartConfig'
import {
  healthSourceTypeToLogo,
  transformControlAndTestDataToHighChartsSeries
} from './DeploymentMetricsAnalysisRow.utils'
import type { HostTestData } from './DeploymentMetricsAnalysisRow.constants'
import css from './DeploymentMetricsAnalysisRow.module.scss'

export interface DeploymentMetricsAnalysisRowProps {
  healthSourceType: any
  transactionName: string
  metricName: string
  controlData?: Highcharts.SeriesLineOptions['data'][]
  testData?: HostTestData[]
  className?: string
  risk?: TransactionMetric['risk']
}

export function DeploymentMetricsAnalysisRow(props: DeploymentMetricsAnalysisRowProps): JSX.Element {
  const { healthSourceType, transactionName, metricName, controlData, testData, className } = props
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const [graphWidth, setGraphWidth] = useState(0)
  const charts: Highcharts.SeriesAreasplineOptions[][] = useMemo(() => {
    return transformControlAndTestDataToHighChartsSeries(controlData || [], testData || [])
  }, [controlData, testData])

  const { getString } = useStrings()

  useLayoutEffect(() => {
    if (!graphContainerRef?.current) {
      return
    }
    const containerWidth = graphContainerRef.current.getBoundingClientRect().width
    setGraphWidth(containerWidth / 4)
  }, [graphContainerRef])

  return (
    <Container className={cx(css.main, className)}>
      <Layout.Horizontal className={css.nodeDetails}>
        <Container>
          <Text>{getString('pipeline.verification.controlHostName')}</Text>
          <Text color={Color.GREY_800}>Control host name here</Text>
        </Container>
        <Container>
          <Text>{getString('pipeline.verification.testHostName')}</Text>
          <Text color={Color.GREY_800}>{testData?.[0].name}</Text>
        </Container>
        <Container>
          <Text>{getString('cv.healthScore')}</Text>
          <Layout.Horizontal>
            <Icon name={healthSourceTypeToLogo(healthSourceType)} margin={{ right: 'small' }} size={16} />
            <Text lineClamp={1} width="100%">
              {healthSourceType}
            </Text>
          </Layout.Horizontal>
        </Container>
      </Layout.Horizontal>

      <div className={css.graphs} ref={graphContainerRef}>
        {charts.map((series, index) => (
          <HighchartsReact key={index} highcharts={Highcharts} options={chartsConfig(series, graphWidth, index)} />
        ))}
      </div>
    </Container>
  )
}
