import React, { useCallback, useEffect, useState } from 'react'
import { Container, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useGetDeploymentLogAnalysisResult, useGetDeploymentLogAnalysisClusters } from 'services/cv'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import LogAnalysis from './LogAnalysis'
import { pageSize, initialPageNumber, POLLING_INTERVAL, StepStatus } from './LogAnalysis.constants'
import type { LogAnalysisContainerProps } from './LogAnalysis.types'

export default function LogAnalysisContainer({ step, hostName }: LogAnalysisContainerProps): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()
  const [selectedClusterType, setSelectedClusterType] = useState<SelectOption>()
  const [pollingIntervalId, setPollingIntervalId] = useState<any>(-1)

  const {
    data: logsData,
    loading: logsLoading,
    error: logsError,
    refetch: fetchLogAnalysis
  } = useGetDeploymentLogAnalysisResult({
    activityId: step?.progressData?.activityId as unknown as string,
    queryParams: {
      accountId,
      pageNumber: initialPageNumber,
      pageSize
    },
    lazy: true
  })

  const {
    data: clusterChartData,
    loading: clusterChartLoading,
    error: clusterChartError,
    refetch: fetchClusterAnalysis
  } = useGetDeploymentLogAnalysisClusters({
    activityId: step?.progressData?.activityId as unknown as string,
    queryParams: {
      accountId
    },
    lazy: true
  })

  useEffect(() => {
    if (logsError) showError(logsError.message)
    if (clusterChartError) showError(clusterChartError.message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsError, clusterChartError])

  // Fetching logs and cluster data when different different host name is selected
  useEffect(() => {
    Promise.all([
      fetchLogAnalysis({
        queryParams: {
          accountId,
          pageNumber: initialPageNumber,
          pageSize,
          ...(hostName && { hostName }),
          ...(selectedClusterType?.value && { clusterType: selectedClusterType?.value })
        }
      }),
      fetchClusterAnalysis({
        queryParams: {
          accountId,
          ...(hostName && { hostName })
        }
      })
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hostName])

  // Fetching logs data for selected cluster type
  useEffect(() => {
    if (selectedClusterType) {
      fetchLogsDataForCluster(selectedClusterType.value as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClusterType?.value])

  useEffect(
    () => {
      let intervalId = pollingIntervalId
      clearInterval(intervalId)
      if (step?.status === StepStatus.Running || step?.status === StepStatus.AsyncWaiting) {
        intervalId = setInterval(() => {
          Promise.all([fetchLogAnalysis, fetchClusterAnalysis])
        }, POLLING_INTERVAL)
        setPollingIntervalId(intervalId)
      }
      return () => clearInterval(intervalId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step?.status]
  )

  const fetchLogsDataForCluster = useCallback(
    clusterType => {
      fetchLogAnalysis({
        queryParams: {
          accountId,
          pageNumber: initialPageNumber,
          pageSize,
          ...(hostName && { hostName }),
          ...(clusterType && { clusterType })
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, hostName]
  )
  const goToLogsPage = useCallback(
    pageNumber => {
      fetchLogAnalysis({
        queryParams: {
          accountId,
          pageNumber,
          pageSize
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId]
  )

  return (
    <Container padding="large">
      <LogAnalysis
        data={logsData}
        clusterChartData={clusterChartData}
        logsLoading={logsLoading}
        clusterChartLoading={clusterChartLoading}
        goToPage={goToLogsPage}
        selectedClusterType={selectedClusterType as SelectOption}
        setSelectedClusterType={setSelectedClusterType}
      />
    </Container>
  )
}
