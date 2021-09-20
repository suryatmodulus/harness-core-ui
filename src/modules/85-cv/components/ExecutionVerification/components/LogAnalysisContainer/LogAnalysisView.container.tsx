import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Container, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import {
  useGetDeploymentLogAnalysisResult,
  useGetDeploymentLogAnalysisClusters,
  GetDeploymentLogAnalysisResultQueryParams
} from 'services/cv'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import LogAnalysis from './LogAnalysis'
import { pageSize, initialPageNumber, POLLING_INTERVAL, StepStatus } from './LogAnalysis.constants'
import type { LogAnalysisContainerProps } from './LogAnalysis.types'
import { getActivityId } from '../../ExecutionVerificationView.utils'
import { getClusterTypes } from './LogAnalysis.utils'

export default function LogAnalysisContainer({ step, hostName }: LogAnalysisContainerProps): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()
  const { getString } = useStrings()
  const [selectedClusterType, setSelectedClusterType] = useState<SelectOption>(getClusterTypes(getString)[0])
  const [selectedHealthSource, setSelectedHealthSource] = useState<string>()
  const [pollingIntervalId, setPollingIntervalId] = useState<any>(-1)
  const activityId = useMemo(() => getActivityId(step), [step])

  const logsAnalysisQueryParams = useMemo(() => {
    return {
      accountId,
      pageNumber: initialPageNumber,
      pageSize,
      ...(hostName && { hostName }),
      ...(selectedClusterType?.value && {
        clusterType: selectedClusterType?.value as GetDeploymentLogAnalysisResultQueryParams['clusterType']
      }),
      ...(selectedHealthSource && { healthSource: selectedHealthSource as any })
    }
  }, [accountId, hostName, selectedClusterType?.value, selectedHealthSource])

  const clusterAnalysisQueryParams = useMemo(() => {
    return {
      accountId,
      ...(hostName && { hostName }),
      ...(selectedClusterType?.value && {
        clusterType: selectedClusterType?.value as any
      }),
      ...(selectedHealthSource && { healthSource: selectedHealthSource as any })
    }
  }, [accountId, hostName, selectedClusterType?.value, selectedHealthSource])

  const {
    data: logsData,
    loading: logsLoading,
    error: logsError,
    refetch: fetchLogAnalysis
  } = useGetDeploymentLogAnalysisResult({
    activityId: activityId as unknown as string,
    queryParams: logsAnalysisQueryParams,
    lazy: true
  })

  const {
    data: clusterChartData,
    loading: clusterChartLoading,
    error: clusterChartError,
    refetch: fetchClusterAnalysis
  } = useGetDeploymentLogAnalysisClusters({
    activityId: activityId as unknown as string,
    queryParams: clusterAnalysisQueryParams,
    lazy: true
  })

  // Fetching logs and cluster data for selected cluster type
  useEffect(() => {
    fetchLogsDataForCluster(selectedClusterType.value as string)
    fetchLogsClusterDataForCluster(selectedClusterType.value as string)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClusterType?.value])

  // Fetching logs and cluster data for selected health source
  useEffect(() => {
    fetchLogsDataForHealthSource(selectedHealthSource)
    fetchLogsClusterDataForHealthSource(selectedHealthSource)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHealthSource])

  useEffect(() => {
    if (logsError) showError(logsError.message)
    if (clusterChartError) showError(clusterChartError.message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsError, clusterChartError])

  // Fetching logs and cluster data when different host name is selected
  useEffect(() => {
    Promise.all([
      fetchLogAnalysis({ queryParams: logsAnalysisQueryParams }),
      fetchClusterAnalysis({ queryParams: clusterAnalysisQueryParams })
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hostName])

  // Polling for Logs and Cluster Chart data
  useEffect(() => {
    let intervalId = pollingIntervalId
    clearInterval(intervalId)
    if (step?.status === StepStatus.Running || step?.status === StepStatus.AsyncWaiting) {
      intervalId = setInterval(() => {
        Promise.all([
          fetchLogAnalysis({ queryParams: logsAnalysisQueryParams }),
          fetchClusterAnalysis({ queryParams: clusterAnalysisQueryParams })
        ])
      }, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }
    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterAnalysisQueryParams, logsAnalysisQueryParams, pollingIntervalId, step?.status])

  const fetchLogsDataForHealthSource = useCallback(
    currentHealthSource => {
      fetchLogAnalysis({
        queryParams: { ...logsAnalysisQueryParams, ...(currentHealthSource && { healthSource: currentHealthSource }) }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const fetchLogsDataForCluster = useCallback(
    clusterType => {
      fetchLogAnalysis({
        queryParams: { ...logsAnalysisQueryParams, ...(clusterType && { clusterType }) }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const fetchLogsClusterDataForHealthSource = useCallback(
    currentHealthSource => {
      fetchClusterAnalysis({
        queryParams: { ...logsAnalysisQueryParams, ...(currentHealthSource && { healthSource: currentHealthSource }) }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const fetchLogsClusterDataForCluster = useCallback(
    clusterType => {
      fetchClusterAnalysis({
        queryParams: { ...logsAnalysisQueryParams, ...(clusterType && { clusterType }) }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const goToLogsPage = useCallback(
    pageNumber => {
      fetchLogAnalysis({
        queryParams: { ...logsAnalysisQueryParams, pageNumber }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  return (
    <Container padding="large">
      <LogAnalysis
        data={logsData}
        clusterChartData={clusterChartData}
        logsLoading={logsLoading}
        clusterChartLoading={clusterChartLoading}
        goToPage={goToLogsPage}
        setSelectedClusterType={setSelectedClusterType}
        onChangeHealthSource={setSelectedHealthSource}
        activityId={activityId}
      />
    </Container>
  )
}
