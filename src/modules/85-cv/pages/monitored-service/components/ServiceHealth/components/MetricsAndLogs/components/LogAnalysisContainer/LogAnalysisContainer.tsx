import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAllLogsClusterData, useGetAllLogsData } from 'services/cv'
import { useToaster } from '@common/exports'
import LogAnalysis from '@cv/components/LogsAnalysis/LogAnalysis'
import { pageSize } from '@cv/components/LogsAnalysis/LogAnalysis.constants'
import type { LogAnalysisRowData } from '@cv/components/LogsAnalysis/LogAnalysis.types'
import Card from '@cv/components/Card/Card'
import type { MetricsAndLogsProps } from '../../MetricsAndLogs.types'
import { getLogAnalysisTableData } from './LogAnalysisContainer.utils'
import css from './LogAnalysisContainer.module.scss'

export default function LogAnalysisContainer(props: MetricsAndLogsProps): JSX.Element {
  const { serviceIdentifier, environmentIdentifier, startTime, endTime } = props
  const { showError } = useToaster()

  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const [selectedClusterType, setSelectedClusterType] = useState<SelectOption>()
  const [selectedHealthSource, setSelectedHealthSource] = useState<string>()

  const logsAnalysisQueryParams = useMemo(() => {
    return {
      size: pageSize,
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      environmentIdentifier,
      startTime,
      endTime,
      ...(selectedClusterType?.value && {
        clusterTypes: (selectedClusterType.value as string).split('_')[0] as any
      }),
      ...(selectedHealthSource && { healthSources: selectedHealthSource as any })
    }
  }, [
    accountId,
    endTime,
    environmentIdentifier,
    orgIdentifier,
    projectIdentifier,
    serviceIdentifier,
    startTime,
    selectedClusterType?.value,
    selectedHealthSource
  ])

  const clusterAnalysisQueryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      environmentIdentifier,
      startTime,
      endTime,
      ...(selectedClusterType?.value && {
        clusterTypes: (selectedClusterType.value as string).split('_')[0] as any
      }),
      ...(selectedHealthSource && { healthSources: selectedHealthSource as any })
    }
  }, [
    accountId,
    endTime,
    environmentIdentifier,
    orgIdentifier,
    projectIdentifier,
    selectedClusterType?.value,
    selectedHealthSource,
    serviceIdentifier,
    startTime
  ])

  // api for logs analysis
  const {
    data: logsData,
    refetch: fetchLogAnalysis,
    loading: logsLoading,
    error: logsError
  } = useGetAllLogsData({ queryParams: logsAnalysisQueryParams, lazy: true })

  // api for cluster chart data
  const {
    data: clusterChartData,
    loading: clusterChartLoading,
    error: clusterChartError,
    refetch: fetchClusterAnalysis
  } = useGetAllLogsClusterData({
    queryParams: clusterAnalysisQueryParams,
    lazy: true
  })

  // Whenever startTime , endTime changes refetching the logs and metrics data
  useEffect(() => {
    Promise.all([
      fetchLogAnalysis({ queryParams: logsAnalysisQueryParams }),
      fetchClusterAnalysis({ queryParams: clusterAnalysisQueryParams })
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime])

  // Fetching logs and cluster data for selected cluster type
  useEffect(() => {
    fetchLogsDataForCluster(selectedClusterType?.value as string)
    fetchLogsClusterDataForCluster(selectedClusterType?.value as string)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClusterType?.value])

  // Fetching logs data for selected health source
  useEffect(() => {
    fetchLogsDataForHealthSource(selectedHealthSource)
    fetchLogsClusterDataForHealthSource(selectedHealthSource)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHealthSource])

  const goToLogsPage = useCallback(
    page => {
      fetchLogAnalysis({
        queryParams: { ...logsAnalysisQueryParams, page, size: pageSize }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  // showing error in case of any api errors.
  useEffect(() => {
    if (logsError) {
      showError(logsError.message)
    }
    if (clusterChartError) {
      showError(clusterChartError.message)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsError, clusterChartError])

  const fetchLogsDataForHealthSource = useCallback(
    currentHealthSource => {
      fetchLogAnalysis({
        queryParams: { ...logsAnalysisQueryParams, ...(currentHealthSource && { healthSources: currentHealthSource }) }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const fetchLogsClusterDataForHealthSource = useCallback(
    currentHealthSource => {
      fetchClusterAnalysis({
        queryParams: {
          ...clusterAnalysisQueryParams,
          ...(currentHealthSource && { healthSources: currentHealthSource })
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clusterAnalysisQueryParams]
  )

  const fetchLogsDataForCluster = useCallback(
    clusterType => {
      fetchLogAnalysis({
        queryParams: {
          ...logsAnalysisQueryParams,
          ...(clusterType && { clusterTypes: clusterType.split('_')[0] as any })
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const fetchLogsClusterDataForCluster = useCallback(
    clusterType => {
      fetchClusterAnalysis({
        queryParams: {
          ...clusterAnalysisQueryParams,
          ...(clusterType && { clusterTypes: clusterType.split('_')[0] as any })
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clusterAnalysisQueryParams]
  )

  const logAnalysisTableData = useMemo((): LogAnalysisRowData[] => {
    return getLogAnalysisTableData(logsData)
  }, [logsData])

  return (
    <Card className={css.logsContainer}>
      <LogAnalysis
        serviceIdentifier={serviceIdentifier}
        environmentIdentifier={environmentIdentifier}
        data={logsData}
        logAnalysisTableData={logAnalysisTableData}
        logsLoading={logsLoading}
        clusterChartData={clusterChartData}
        clusterChartLoading={clusterChartLoading}
        goToPage={goToLogsPage}
        setSelectedClusterType={setSelectedClusterType}
        onChangeHealthSource={setSelectedHealthSource}
        showClusterChart={true}
      />
    </Card>
  )
}
