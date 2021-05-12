import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { ResponseMessage } from 'services/cd-ng'
import type { ExecutionNode } from 'services/pipeline-ng'
import { String } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { PipelineType, ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { LogsContent } from '@pipeline/components/LogsContent/LogsContent'
import { isExecutionSkipped, isExecutionCompletedWithBadState } from '@pipeline/utils/statusHelpers'
import { StepDetails } from '../Common/StepDetails/StepDetails'

import css from './ExecutionStepDetailsTab.module.scss'

export interface ExecutionStepDetailsTabProps {
  step: ExecutionNode
}

export default function ExecutionStepDetailsTab(props: ExecutionStepDetailsTabProps): React.ReactElement {
  const { step } = props

  const { orgIdentifier, executionIdentifier, pipelineIdentifier, projectIdentifier, accountId, module } = useParams<
    PipelineType<ExecutionPathProps>
  >()

  const logUrl = routes.toExecutionPipelineView({
    orgIdentifier,
    executionIdentifier,
    pipelineIdentifier,
    projectIdentifier,
    accountId,
    module
  })

  const errorMessage = step?.failureInfo?.message || step.executableResponses?.[0]?.skipTask?.message
  const isFailed = isExecutionCompletedWithBadState(step.status)
  const isSkipped = isExecutionSkipped(step.status)

  return (
    <div className={css.detailsTab}>
      {step.failureInfo?.responseMessages?.length ? (
        <ErrorHandler responseMessages={step.failureInfo?.responseMessages as ResponseMessage[]} />
      ) : errorMessage ? (
        <div className={cx(css.errorMsg, { [css.error]: isFailed, [css.warn]: isSkipped })}>
          <String className={css.title} stringID="errorSummaryText" tagName="div" />
          <p>{errorMessage}</p>
        </div>
      ) : null}
      <StepDetails step={step} />
      <LogsContent mode="step-details" toConsoleView={`${logUrl}?view=log`} />
    </div>
  )
}
