import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Color, Container, ExpandingSearchInput, Select, Text, Icon, Pagination } from '@wings-software/uicore'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import {
  RestResponsePageTimeSeriesMetricDataDTO,
  TimeSeriesMetricDataDTO,
  useGetTimeSeriesMetricData
} from 'services/cv'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { HealthSourceDropDown } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown'
import { TimelineBar } from '@cv/components/TimelineView/TimelineBar'
import {
  MetricTypeOptions,
  PAGE_SIZE,
  DEFAULT_PAGINATION_VALUE,
  MetricType
} from './MetricsAnalysisContainer.constants'
import { generatePointsForTimeSeries, getErrorMessage } from './MetricsAnalysisContainer.utils'
import type { MetricsAndLogsProps } from '../../MetricsAndLogs.types'
import MetricAnalysisRow from './components/MetricsAnalysisRow/MetricAnalysisRow'
import css from './MetricsAnalysisContainer.module.scss'

export default function MetricsAnalysisContainer(props: MetricsAndLogsProps): JSX.Element {
  const { serviceIdentifier, environmentIdentifier, startTime, endTime } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const [timeSeriesData, setTimeseriesData] = useState<TimeSeriesMetricDataDTO[]>([])

  const queryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      environmentIdentifier,
      startTime,
      endTime
    }
  }, [accountId, endTime, environmentIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier, startTime])

  // api for fetching metrics data
  const {
    data: metricsData,
    refetch: fetchMetricsData,
    loading: metricsLoading,
    error: metricsError
  } = useGetTimeSeriesMetricData({ queryParams, lazy: true })

  // Fetching metrics data whenever start or endtime changes
  useEffect(() => {
    fetchMetricsData({ queryParams })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime])

  useEffect(() => {
    if (metricsData && metricsData?.resource?.content?.length) {
      const timeSeriesInfo = generatePointsForTimeSeries(
        metricsData as RestResponsePageTimeSeriesMetricDataDTO,
        startTime,
        endTime
      )
      setTimeseriesData(timeSeriesInfo?.resource?.content as TimeSeriesMetricDataDTO[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricsData])

  const paginationInfo = useMemo(
    () => (metricsData?.resource ? omit(metricsData.resource, ['content', 'empty']) : DEFAULT_PAGINATION_VALUE),
    [metricsData?.resource]
  )

  const renderContent = (): JSX.Element => {
    if (metricsLoading) return <Icon name="steps-spinner" className={css.loading} color={Color.GREY_400} size={30} />

    if (metricsError) {
      return (
        <PageError message={getErrorMessage(metricsError)} onClick={() => fetchMetricsData()} className={css.error} />
      )
    }

    if (!timeSeriesData?.length) {
      return (
        <Container className={css.noData}>
          <NoDataCard
            onClick={() => fetchMetricsData()}
            message={getString('pipeline.verification.noMetrics')}
            icon="warning-sign"
          />
        </Container>
      )
    }

    return (
      <>
        {timeSeriesData?.map((d: TimeSeriesMetricDataDTO) => {
          const { groupName, metricDataList, metricName } = d
          return metricName && groupName && metricDataList?.length ? (
            <MetricAnalysisRow
              key={`$${groupName}-${metricName}`}
              metricName={metricName}
              startTime={startTime as number}
              endTime={endTime as number}
              transactionName={groupName}
              analysisData={metricDataList}
            />
          ) : null
        })}
        <TimelineBar startDate={startTime} className={css.timeline} endDate={endTime} columnWidth={70} />
      </>
    )
  }

  const goToMetricsPage = useCallback(
    page => {
      fetchMetricsData({ queryParams: { ...queryParams, page, size: PAGE_SIZE } })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryParams]
  )

  const handleMetricsTypeChange = useCallback(
    item => {
      fetchMetricsData({ queryParams: { ...queryParams, anomalous: item.value === MetricType.ANOMALOUS } })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryParams]
  )

  const handleSearch = useCallback(
    filterString => {
      fetchMetricsData({ queryParams: { ...queryParams, filter: filterString } })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryParams]
  )

  const handleHealthSourceChange = useCallback(
    selectedHealthSource => {
      fetchMetricsData({ queryParams: { ...queryParams, healthSources: selectedHealthSource } })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryParams]
  )

  return (
    <Container className={css.main}>
      <Container className={css.filters}>
        <Text color={Color.BLACK} font={{ size: 'small', weight: 'bold' }}>
          {getString('rbac.permissionLabels.view').toLocaleUpperCase()}:
        </Text>
        <Select
          items={MetricTypeOptions}
          className={css.maxDropDownWidth}
          defaultSelectedItem={MetricTypeOptions[0]}
          onChange={handleMetricsTypeChange}
        />
        {serviceIdentifier && environmentIdentifier ? (
          <HealthSourceDropDown
            onChange={handleHealthSourceChange}
            serviceIdentifier={serviceIdentifier as string}
            environmentIdentifier={environmentIdentifier as string}
          />
        ) : null}
        <ExpandingSearchInput
          throttle={500}
          className={css.filterBy}
          placeholder={getString('pipeline.verification.metricViewPlaceholder')}
          onChange={handleSearch}
        />
      </Container>
      <Container className={css.content}>{renderContent()}</Container>
      <Pagination
        pageSize={paginationInfo.pageSize as number}
        pageCount={paginationInfo.totalPages as number}
        itemCount={paginationInfo.totalItems as number}
        pageIndex={paginationInfo.pageIndex}
        gotoPage={goToMetricsPage}
      />
    </Container>
  )
}
