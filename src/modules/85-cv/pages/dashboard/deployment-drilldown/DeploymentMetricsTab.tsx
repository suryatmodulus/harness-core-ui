import React, { useState, useMemo } from 'react'
import { Container, Pagination, Link } from '@wings-software/uikit'
import { extendMoment } from 'moment-range'
import classnames from 'classnames'
import { TimelineBar } from '@common/components/TimelineView/TimelineBar'
import type { RestResponseTransactionMetricInfoSummaryPageDTO, HostData, TimeRange } from 'services/cv'
import { getColorValue } from '@common/components/HeatMap/ColorUtils'
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
  const mapSeriesData = (items: number[]) => {
    const increment = Math.floor(range.diff() / Math.max(items.length - 1, 1))
    return items.map((item, index) => ({
      x: range.start.valueOf() + index * increment,
      y: item
    }))
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
                type: 'line',
                color: getColorValue(node.score!),
                data: mapSeriesData(node.testData ?? [])
              },
              {
                name: 'controlData',
                type: 'line',
                color: 'var(--grey-350)',
                data: mapSeriesData(node.controlData ?? [])
              }
            ]
          }
        })
        .filter(val => !!val) as Array<SeriesConfig>,
    [nodes, timeRange, showMax]
  )
  return (
    <>
      <TimeseriesRow transactionName={transactionName} metricName={metricName} seriesData={seriesData} />
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
