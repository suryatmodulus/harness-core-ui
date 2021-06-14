import React from 'react'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'

import ExecutionCard from './ExecutionCard/ExecutionCard'
import css from './ExecutionList.module.scss'

export interface ExecutionsListProps {
  pipelineExecutionSummary: PipelineExecutionSummary[] | undefined
}

export default function ExecutionsList({ pipelineExecutionSummary }: ExecutionsListProps): React.ReactElement {
  return (
    <div className={css.main}>
      {pipelineExecutionSummary?.map(pipelineExecution => (
        <ExecutionCard pipelineExecution={pipelineExecution} key={pipelineExecution.planExecutionId} />
      ))}
    </div>
  )
}
