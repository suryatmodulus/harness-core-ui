import React, { useEffect, useState } from 'react'
import { Container, Icon, Color, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useGetDeploymentActivitySummary } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import { isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import { ManualInterventionTab } from '@pipeline/components/execution/StepDetails/tabs/ManualInterventionTab/ManualInterventionTab'
import { allowedStrategiesAsPerStep } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { StepMode } from '@pipeline/utils/stepUtils'
import { Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { StageType } from '@pipeline/utils/stageHelpers'
import { SummaryOfDeployedNodes } from './components/SummaryOfDeployedNodes/SummaryOfDeployedNodes'
import { getErrorMessage } from '../DeploymentMetrics/DeploymentMetrics.utils'
import { DeploymentProgressAndNodes } from '../DeploymentProgressAndNodes/DeploymentProgressAndNodes'
import type { VerifyExecutionProps } from './ExecutionVerificationSummary.types'
import css from './ExecutionVerificationSummary.module.scss'

const POLLING_INTERVAL = 15000

export function ExecutionVerificationSummary(props: VerifyExecutionProps): JSX.Element {
  const { step, displayAnalysisCount = true, className, onSelectNode, stageType } = props
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
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const failureStrategies = allowedStrategiesAsPerStep(stageType || StageType.DEPLOY)[StepMode.STEP].filter(
    st => st !== Strategy.ManualIntervention
  )

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

  if (isManualInterruption) {
    return <ManualInterventionTab step={step} allowedStrategies={failureStrategies} />
  }

  return (
    <Container className={cx(css.main, className)}>
      {step.failureInfo?.message && (
        <Text
          font={{ size: 'small', weight: 'bold' }}
          className={css.failureMessage}
          lineClamp={4}
          color={Color.RED_500}
        >
          {step.failureInfo.message}
        </Text>
      )}
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
