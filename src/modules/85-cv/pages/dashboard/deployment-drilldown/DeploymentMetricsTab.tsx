import React, { useState, useMemo } from 'react'
import { Container, Pagination, Link } from '@wings-software/uicore'
import { extendMoment } from 'moment-range'
import classnames from 'classnames'
import { TimelineBar } from '@cv/components/TimelineView/TimelineBar'
import type { RestResponseTransactionMetricInfoSummaryPageDTO, HostData, TimeRange } from 'services/cv'
import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import {
  MetricAnalysisFilter,
  MetricAnalysisFilterType
} from '../../services/analysis-drilldown-view/MetricAnalysisView/MetricAnalysisFilter/MetricAnalysisFilter'
import TimeseriesRow, { SeriesConfig } from '../../../components/TimeseriesRow/TimeseriesRow'
import i18n from './DeploymentDrilldownView.i18n'
import styles from './DeploymentDrilldownView.module.scss'

const moment = extendMoment(require('moment')) // eslint-disable-line

export interface DeploymentMetricsTabProps {
  data: RestResponseTransactionMetricInfoSummaryPageDTO | null
  goToPage(val: number): void
  onAnomalousMetricsOnly(val: boolean): void
  isLoading: boolean
}

export interface TransactionRowProps {
  transactionName?: string
  metricName?: string
  riskScore?: number
  nodes?: HostData[]
  timeRange?: TimeRange
}

export default function DeploymentMetricsTab({
  data,
  goToPage,
  onAnomalousMetricsOnly,
  isLoading
}: DeploymentMetricsTabProps) {
  return (
    <div className={classnames(styles.metricsTab, styles.panel)}>
      <Container className={styles.timeFilterAndBar}>
        <MetricAnalysisFilter
          onChangeFilter={val => onAnomalousMetricsOnly(val === MetricAnalysisFilterType.ANOMALOUS)}
        />
        {data?.resource?.deploymentTimeRange && (
          <TimelineBar
            className={styles.timelineBar}
            startDate={data?.resource?.deploymentTimeRange.startTime as number}
            endDate={data?.resource?.deploymentTimeRange.endTime as number}
          />
        )}
      </Container>
      {data?.resource?.pageResponse?.content?.length === 0 && !isLoading && (
        <NoDataCard className={styles.noDataCard} message={i18n.nothingToDisplay} icon="warning-sign" />
      )}
      <Container className={styles.timeseriesList}>
        {data?.resource?.pageResponse?.content?.map(value => (
          <TransactionRow
            key={(value.transactionMetric?.transactionName as string) + value.transactionMetric?.metricName}
            transactionName={value.transactionMetric?.transactionName}
            metricName={value.transactionMetric?.metricName}
            nodes={value.nodes}
            timeRange={data?.resource?.deploymentTimeRange}
          />
        ))}
      </Container>
      {!!data?.resource?.pageResponse?.totalPages && (
        <Pagination
          pageSize={data.resource.pageResponse?.pageSize as number}
          pageCount={data.resource.pageResponse.totalPages + 1}
          itemCount={data.resource.pageResponse.totalItems as number}
          pageIndex={data.resource.pageResponse.pageIndex}
          gotoPage={goToPage}
        />
      )}
    </div>
  )
}

const DEFAULT_ROW_SIZE = 3

function TransactionRow({ transactionName, metricName, nodes = [], timeRange }: TransactionRowProps) {
  const [showMax, setShowMax] = useState<number>(DEFAULT_ROW_SIZE)
  const range = moment.range(moment(timeRange?.startTime), moment(timeRange?.endTime))
  const mapSeriesData = (items?: number[]) => {
    items = items || []
    const increment = Math.floor(range.diff() / Math.max(items.length - 1, 1))
    return items.map((item, index) => ({
      x: range.start.valueOf() + index * increment,
      y: item != -1 ? item : null
    }))
  }
  const mapChartOptions = (testData?: number[], controlData?: number[]) => {
    testData = testData || []
    controlData = controlData || []
    const itemsLength = Math.max(testData.length, controlData.length, 3)
    const combinedItems = [...testData, ...controlData].filter(val => val != -1)
    const xIncrement = range.diff() / (itemsLength - 1)
    const xTickPositions = Array(itemsLength)
      .fill(null)
      .map((_, i) => range.start.valueOf() + i * xIncrement)
    const minValue = Math.min.apply(null, combinedItems)
    const maxValue = Math.max.apply(null, combinedItems)
    const yIncrement = (maxValue - minValue) / 3
    let yTickPositions
    if (minValue === maxValue) {
      yTickPositions = [minValue - 1, minValue, minValue + 1]
    } else {
      yTickPositions = Array(4)
        .fill(null)
        .map((_, i) => minValue + i * yIncrement)
      // Make sure rounding doesn't make a problem and the last value is exact as maxValue
      yTickPositions[3] = maxValue
    }

    return {
      xAxis: {
        tickPositions: xTickPositions
      },
      yAxis: {
        tickPositions: yTickPositions
      }
    }
  }
  const seriesData: Array<SeriesConfig> = useMemo(
    () =>
      nodes
        .map((node, index) => {
          if (index + 1 > showMax) {
            return undefined
          }
          return {
            name: node.hostName,
            series: [
              {
                name: 'testData',
                type: 'spline',
                color: getRiskColorValue(node.risk),
                data: mapSeriesData(node.testData)
              },
              {
                name: 'controlData',
                type: 'spline',
                color: 'var(--grey-350)',
                data: mapSeriesData(node.controlData)
              }
            ],
            chartOptions: mapChartOptions(node.testData, node.controlData)
          }
        })
        .filter(val => !!val) as Array<SeriesConfig>,
    [nodes, timeRange, showMax]
  )

  return (
    <>
      <TimeseriesRow
        transactionName={transactionName}
        metricName={metricName}
        seriesData={seriesData}
        chartOptions={{
          chart: {
            height: 80
          },
          xAxis: {
            gridLineWidth: 1,
            gridLineDashStyle: 'Dash'
          },
          yAxis: {
            gridLineWidth: 1,
            gridLineDashStyle: 'Dash'
          },
          plotOptions: {
            series: {
              marker: {
                radius: 3,
                symbol: 'circle',
                fillColor: 'white',
                lineWidth: 1,
                lineColor: null as any // inherit from series
              },
              states: {
                hover: {
                  halo: {
                    size: 0
                  }
                }
              }
            }
          }
        }}
      />
      <Container className={styles.showMore}>
        {nodes.length > showMax && (
          <Link minimal font={{ size: 'small' }} onClick={() => setShowMax(Infinity)}>
            {i18n.showMore}
          </Link>
        )}
        {showMax > DEFAULT_ROW_SIZE && (
          <Link minimal font={{ size: 'small' }} onClick={() => setShowMax(DEFAULT_ROW_SIZE)}>
            {i18n.showLess}
          </Link>
        )}
      </Container>
    </>
  )
}
