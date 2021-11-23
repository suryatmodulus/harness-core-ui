import React from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { EvaluationView } from '@governance/EvaluationView'

export default function ExecutionPolicyEvaluationsView(): React.ReactElement | null {
  const { accountId, module } = useParams<PipelineType<ExecutionPathProps>>()
  const context = useExecutionContext()
  const governanceMetadata = context?.pipelineExecutionDetail?.pipelineExecutionSummary?.governanceMetadata

  if (!governanceMetadata) {
    return null
  }

  return (
    <Container width="100%" height="100%">
      <EvaluationView metadata={governanceMetadata} accountId={accountId} module={module} />
    </Container>
  )
}
