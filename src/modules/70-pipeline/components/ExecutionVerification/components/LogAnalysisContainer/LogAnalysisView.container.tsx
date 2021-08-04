import React, { useCallback, useEffect, useMemo } from 'react'
import { Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useGetDeploymentLogAnalysisResult, useGetDeploymentLogAnalysisClusters } from 'services/cv'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import LogAnalysis from './LogAnalysis'
import { pageSize, initialPageNumber } from './LogAnalysis.constants'
import type { LogAnalysisContainerProps } from './LogAnalysis.types'

export default function LogAnalysisContainer({ step, hostName }: LogAnalysisContainerProps): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()

  const {
    data: logsData,
    loading: logsLoading,
    error: logsError,
    refetch: fetchLogAnalyses
  } = useGetDeploymentLogAnalysisResult({
    activityId: step?.progressData?.activityId as unknown as string,
    queryParams: {
      accountId,
      pageNumber: initialPageNumber,
      pageSize
    }
  })

  const {
    data: clusterChartData,
    loading: clusterChartLoading,
    error: clusterChartError
  } = useGetDeploymentLogAnalysisClusters({
    activityId: step?.progressData?.activityId as unknown as string,
    queryParams: {
      accountId
    }
  })

  const goToLogsPage = useCallback(
    pageNumber => {
      fetchLogAnalyses({
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

  useEffect(() => {
    if (logsError) {
      showError(logsError.message)
    } else if (clusterChartError) {
      showError(clusterChartError.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsError, clusterChartError])

  useEffect(() => {
    if (hostName) {
      fetchLogAnalyses({
        queryParams: {
          accountId,
          pageNumber: initialPageNumber,
          pageSize,
          hostName
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hostName])

  const isLoading = useMemo(() => logsLoading || clusterChartLoading, [logsLoading, clusterChartLoading])

  if (isLoading) {
    return <PageSpinner />
  }

  return (
    <Container padding="large">
      <LogAnalysis data={logsData} clusterChartData={clusterChartData} isLoading={isLoading} goToPage={goToLogsPage} />
    </Container>
  )
}
