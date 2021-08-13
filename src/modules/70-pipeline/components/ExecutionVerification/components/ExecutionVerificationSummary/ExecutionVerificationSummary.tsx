import React, { useEffect, useState } from 'react'
import { Container, Icon, Color } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useGetDeploymentActivitySummary } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import type { ExecutionNode } from 'services/pipeline-ng'
import { SummaryOfDeployedNodes } from './components/SummaryOfDeployedNodes/SummaryOfDeployedNodes'
import { getErrorMessage } from '../DeploymentMetrics/DeploymentMetrics.utils'
import { DeploymentProgressAndNodes } from '../DeploymentProgressAndNodes/DeploymentProgressAndNodes'
import type { DeploymentNodeAnalysisResult } from '../DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import css from './ExecutionVerificationSummary.module.scss'

const POLLING_INTERVAL = 15000

export interface VerifyExecutionProps {
  step: ExecutionNode
  displayAnalysisCount?: boolean
  onSelectNode?: (selectedNode?: DeploymentNodeAnalysisResult) => void
  className?: string
}

export function ExecutionVerificationSummary(props: VerifyExecutionProps): JSX.Element {
  const { step, displayAnalysisCount = true, className, onSelectNode } = props
  const { accountId } = useParams<ProjectPathProps>()
  const [pollingIntervalId, setPollingIntervalId] = useState(-1)
  const [showSpinner, setShowSpinner] = useState(true)
  const activityId = step?.progressData?.activityId ? (step.progressData.activityId as unknown as string) : ''
  const { data, error, refetch } = useGetDeploymentActivitySummary({
    queryParams: { accountId },
    activityId,
    lazy: true
  })
  const { deploymentVerificationJobInstanceSummary = {} } = data?.resource || {}

  useEffect(() => {
    if (!activityId) {
      setPollingIntervalId(oldIntervalId => {
        clearInterval(oldIntervalId)
        return -1
      })
      return
    }

    let intervalId = pollingIntervalId
    clearInterval(intervalId)

    if (step?.status === 'Running' || step?.status === 'AsyncWaiting') {
      intervalId = setInterval(refetch, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }

    refetch()
    return () => clearInterval(intervalId)
  }, [step?.progressData?.activityId, step?.status])

  useEffect(() => {
    setShowSpinner(Boolean(step?.progressData?.activityId))
  }, [step?.progressData?.activityId])

  useEffect(() => {
    if ((data || error) && showSpinner) setShowSpinner(false)
  }, [data, error])

  if (showSpinner) {
    return (
      <Container className={cx(css.main, className)}>
        <Icon name="steps-spinner" className={css.loading} color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className={cx(css.main, className)}>
        <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
      </Container>
    )
  }

  return (
    <Container className={cx(css.main, className)}>
      <DeploymentProgressAndNodes
        deploymentSummary={deploymentVerificationJobInstanceSummary}
        className={css.details}
        onSelectNode={onSelectNode}
      />
      {displayAnalysisCount && (
        <SummaryOfDeployedNodes
          metricsInViolation={deploymentVerificationJobInstanceSummary?.timeSeriesAnalysisSummary?.numAnomMetrics || 0}
          totalMetrics={deploymentVerificationJobInstanceSummary?.timeSeriesAnalysisSummary?.totalNumMetrics || 0}
          logClustersInViolation={
            deploymentVerificationJobInstanceSummary?.logsAnalysisSummary?.anomalousClusterCount || 0
          }
          totalLogClusters={deploymentVerificationJobInstanceSummary?.logsAnalysisSummary?.totalClusterCount || 0}
        />
      )}
    </Container>
  )
}
