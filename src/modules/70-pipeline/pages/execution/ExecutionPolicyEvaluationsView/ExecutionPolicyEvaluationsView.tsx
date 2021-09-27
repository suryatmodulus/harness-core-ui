import React from 'react'
import { useParams } from 'react-router-dom'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import css from './ExecutionPolicyEvaluationsView.module.scss'

export default function ExecutionPolicyEvaluationsView(): React.ReactElement | null {
  const { projectIdentifier, orgIdentifier, pipelineIdentifier, accountId, module, executionIdentifier } =
    useParams<PipelineType<ExecutionPathProps>>()

  const context = useExecutionContext()
  const status = (context?.pipelineExecutionDetail?.pipelineExecutionSummary?.status || '').toUpperCase()

  // When build/execution is not resolved from context, render nothing
  // Spinner is already provided by the parent
  if (!status) {
    return null
  }

  const governanceMetadata = context.pipelineExecutionDetail?.pipelineExecutionSummary?.governanceMetadata

  console.log(governanceMetadata)

  return <div className={css.main}>HERE WE GO</div>
}
