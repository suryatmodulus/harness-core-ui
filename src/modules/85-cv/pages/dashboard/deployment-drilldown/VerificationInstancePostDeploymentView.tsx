import React, { useState, useEffect } from 'react'
import { Container, Tabs, Tab, Text, Pagination } from '@wings-software/uicore'
import classnames from 'classnames'
import { useParams } from 'react-router-dom'
import { ActivitiesFlagBorder } from '@cv/components/ActivitiesTimelineView/ActivitiesTimelineView'
import ActivitiesTimelineViewSection from '@cv/components/ActivitiesTimelineView/ActivitiesTimelineViewSection'
import { TimelineBar } from '@cv/components/TimelineView/TimelineBar'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import { useGetActivityMetrics, useGetActivityVerificationResult, useGetActivityLogs } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { EventDetailsForChange } from '@cv/components/EventDetailsForChange/EventDetailsForChange'
import { VerificationActivityRiskCard } from '@cv/components/VerificationActivityRiskCard/VerificationActivityRiskCard'
import { TimeBasedShadedRegion } from '@cv/components/TimeBasedShadedRegion/TimeBasedShadedRegion'
import { TabIdentifier } from './VerificationInstanceView'
import {
  MetricAnalysisFilter,
  MetricAnalysisFilterType
} from '../../services/analysis-drilldown-view/MetricAnalysisView/MetricAnalysisFilter/MetricAnalysisFilter'
import TimeseriesRow, { TimeseriesRowProps } from '../../../components/TimeseriesRow/TimeseriesRow'
import {
  LogAnalysisRow,
  LogAnalysisRowData
} from '../../services/analysis-drilldown-view/LogAnalysisView/LogAnalysisRow/LogAnalysisRow'
import i18n from './DeploymentDrilldownView.i18n'
import { ActivityLogAnalysisFrequencyChart } from '../../services/analysis-drilldown-view/LogAnalysisView/LogAnalysisFrequencyChart/LogAnalysisFrequencyChart'
import styles from './DeploymentDrilldownView.module.scss'

const TIME_SERIES_ROW_HEIGHT = 64
export interface VerificationInstacePostDeploymentViewProps {
  selectedActivityId: string
  activityStartTime: number
  durationMs: number
  environmentIdentifier: string
  onActivityLoaded?(activity: any): void
}

interface MetricsTabProps {
  activityId: string
  environmentIdentifier: string
  startTime: number
  endTime: number
  selectedActivityStartTime?: number
  shadedRegionEndTime?: number
  shadedRegionStartTime?: number
}

interface LogsTabProps {
  activityId: string
  environmentIdentifier: string
  startTime: number
  endTime: number
}

export function VerificationInstancePostDeploymentView({
  selectedActivityId,
  activityStartTime,
  durationMs,
  environmentIdentifier,
  onActivityLoaded
}: VerificationInstacePostDeploymentViewProps): React.ReactElement {
  const rangeStartTime = activityStartTime - 2 * 60 * 60000
  const rangeEndTime = activityStartTime + durationMs
  const { accountId } = useParams<ProjectPathProps>()
  const [showEventDetails, setShowEventDetails] = useState(false)
  const { data: activityWithRisks } = useGetActivityVerificationResult({
    activityId: selectedActivityId,
    queryParams: {
      accountId
    }
  })

  useEffect(() => {
    if (activityWithRisks?.resource) {
      onActivityLoaded?.(activityWithRisks.resource)
    }
  }, [activityWithRisks])

  return (
    <Container className={styles.postDeploymentView}>
      {showEventDetails && (
        <EventDetailsForChange
          onCloseCallback={() => setShowEventDetails(false)}
          selectedActivityInfo={{ selectedActivityId, selectedActivityType: activityWithRisks?.resource?.activityType }}
        />
      )}
      <VerificationActivityRiskCard
        onClickKubernetesEvent={() => setShowEventDetails(true)}
        activityWithRisks={activityWithRisks}
      />
      {!!rangeStartTime && !!rangeEndTime && (
        <>
          <Container className={styles.panel}>
            <ActivitiesTimelineViewSection
              environmentIdentifier={environmentIdentifier}
              selectedActivityId={selectedActivityId}
              startTime={rangeStartTime}
              endTime={rangeEndTime}
              timelineViewProps={{
                shadedRegionProps: {
                  shadedRegionEndTime: rangeEndTime,
                  shadedRegionStartTime: rangeStartTime + 2 * 60 * 60 * 1000,
                  startTime: rangeStartTime,
                  endTime: rangeEndTime,
                  height: '92%',
                  top: 10,
                  leftOffset: 200
                }
              }}
            />
          </Container>
          <Tabs id="tabs1">
            <Tab
              title={i18n.metrics}
              id={TabIdentifier.METRICS_TAB}
              panel={
                <Container className={styles.panel}>
                  <MetricsTab
                    activityId={selectedActivityId}
                    environmentIdentifier={environmentIdentifier}
                    startTime={rangeStartTime}
                    endTime={rangeEndTime}
                    shadedRegionStartTime={rangeStartTime + 2 * 60 * 60 * 1000}
                    shadedRegionEndTime={rangeEndTime}
                    selectedActivityStartTime={activityStartTime}
                  />
                </Container>
              }
            />
            <Tab
              title={i18n.logs}
              id={TabIdentifier.LOGS_TAB}
              panel={
                <Container>
                  <LogsTab
                    activityId={selectedActivityId}
                    environmentIdentifier={environmentIdentifier}
                    startTime={rangeStartTime}
                    endTime={rangeEndTime}
                  />
                </Container>
              }
            />
          </Tabs>
        </>
      )}
    </Container>
  )
}

export function mapMetricsData(res: any, startTime: number, endTime: number) {
  return res?.resource?.content.map((item: any) => ({
    transactionName: item.groupName,
    metricName: item.metricName,
    seriesData: [
      {
        series: [
          {
            type: 'line',
            color: 'var(--green-500)',
            data: item.metricDataList.map((val: any) => ({
              x: val.timestamp,
              y: val.value
            }))
          }
        ]
      }
    ],
    chartOptions: {
      chart: {
        height: 50,
        spacing: [5, 0, 5, 0]
      },
      xAxis: {
        min: startTime,
        max: endTime
      }
    }
  }))
}

export function getSeriesZones(items: any[], mapColor = getRiskColorValue) {
  const zones = []
  for (let i = 0; i < items.length; i++) {
    const prevRisk = i > 0 ? items[i - 1].risk : undefined
    const prevTimestamp = prevRisk && items[i - 1].timestamp
    if (items[i].risk !== prevRisk && !!prevRisk) {
      zones.push({
        value: prevTimestamp,
        color: mapColor(prevRisk)
      })
    }
    if (i === items.length - 1) {
      zones.push({
        value: items[i].timestamp,
        color: mapColor(items[i].risk)
      })
    }
  }
  return zones
}

function MetricsTab({
  activityId,
  environmentIdentifier,
  startTime,
  endTime,
  shadedRegionEndTime,
  shadedRegionStartTime
}: MetricsTabProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [timeSeriesRowRef, setTimeSeriesRowRef] = useState<HTMLDivElement | null>(null)
  const [metricsData, setMetricsData] = useState<Array<TimeseriesRowProps>>()
  const [anomalousOnly, setAnomalousOnly] = useState(true)
  const { data, refetch, loading } = useGetActivityMetrics({
    activityId,
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      environmentIdentifier,
      anomalousOnly,
      startTime,
      endTime,
      page: 0
    },
    resolve: res => {
      if (res?.resource?.content) {
        setMetricsData(mapMetricsData(res, startTime, endTime))
      }
      return res
    }
  })
  const goToPage = (page: number) =>
    refetch({
      queryParams: {
        accountId,
        projectIdentifier,
        orgIdentifier,
        environmentIdentifier,
        anomalousOnly,
        startTime,
        endTime,
        page
      }
    })
  return (
    <Container className={styles.postDeploymentMetrics}>
      <Container className={styles.filtersAndStatusBar}>
        <MetricAnalysisFilter
          onChangeFilter={val => setAnomalousOnly(val === MetricAnalysisFilterType.ANOMALOUS)}
          className={styles.filter}
        />
        <TimelineBar className={styles.timelineBar} startDate={startTime} endDate={endTime} />
      </Container>
      {!data?.resource?.content?.length && !loading && (
        <NoDataCard className={styles.noDataCard} message={i18n.nothingToDisplay} icon="warning-sign" />
      )}
      {metricsData?.map((mData: TimeseriesRowProps, index: number) => (
        <TimeseriesRow
          key={`${mData.transactionName}${mData.metricName}${index}`}
          className={styles.seriesRow}
          {...mData}
          setChartDivRef={setTimeSeriesRowRef}
        />
      ))}
      <ActivitiesFlagBorder />
      {(!!data?.resource && (data.resource.pageIndex ?? -1) >= 0 && (
        <Pagination
          pageSize={data.resource.pageSize as number}
          pageCount={data.resource.totalPages as number}
          itemCount={data.resource.totalItems as number}
          pageIndex={data.resource.pageIndex}
          gotoPage={p => goToPage?.(p)}
        />
      )) ||
        null}
      {shadedRegionEndTime && shadedRegionStartTime && !loading && data?.resource?.content?.length && (
        <TimeBasedShadedRegion
          shadedRegionEndTime={shadedRegionEndTime}
          shadedRegionStartTime={shadedRegionStartTime}
          startTime={startTime}
          endTime={endTime}
          top={8}
          leftOffset={210}
          parentRef={timeSeriesRowRef}
          height={data.resource.content.length * TIME_SERIES_ROW_HEIGHT}
        />
      )}
    </Container>
  )
}

function LogsTab({ activityId, environmentIdentifier, startTime, endTime }: LogsTabProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [logsData, setLogsData] = useState<LogAnalysisRowData[]>([])
  const { data, refetch, loading } = useGetActivityLogs({
    activityId,
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      environmentIdentifier,
      startTime,
      endTime,
      page: 0
    }
  })
  const goToPage = (page: number) =>
    refetch({
      queryParams: {
        accountId,
        projectIdentifier,
        orgIdentifier,
        environmentIdentifier,
        startTime,
        endTime,
        page
      }
    })

  useEffect(() => {
    if (data?.resource?.content?.length) {
      setLogsData(
        data.resource.content.map(({ logData }: any) => ({
          clusterType: logData.tag,
          count: logData.count,
          message: logData.text,
          messageFrequency: [
            {
              type: 'line',
              color: 'var(--green-500)',
              data: logData?.trend
                ?.sort((a: any, b: any) => a.timestamp - b.timestamp)
                .map((d: any) => ({
                  x: d.timestamp,
                  y: d.count
                }))
            }
          ]
        }))
      )
    } else {
      setLogsData([])
    }
  }, [data])

  return (
    <Container>
      <Container className={classnames(styles.frequencyChart, styles.panel)}>
        <Container className={styles.frequencyChartContent}>
          <Text font={{ weight: 'bold' }}>{`${i18n.logCluster} ${i18n.timeline}`}</Text>
          <ActivityLogAnalysisFrequencyChart
            activityId={activityId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            startTime={startTime}
            endTime={endTime}
          />
        </Container>
        <ActivitiesFlagBorder />
      </Container>
      {logsData && <LogAnalysisRow data={logsData!} />}
      {!data?.resource?.content?.length && !loading && (
        <NoDataCard className={styles.noDataCard} message={i18n.nothingToDisplay} icon="warning-sign" />
      )}
      {(!!data?.resource && (data.resource.pageIndex ?? -1) >= 0 && (
        <Pagination
          pageSize={data.resource.pageSize as number}
          pageCount={data.resource.totalPages as number}
          itemCount={data.resource.totalItems as number}
          pageIndex={data.resource.pageIndex}
          gotoPage={p => goToPage?.(p)}
        />
      )) ||
        null}
    </Container>
  )
}
