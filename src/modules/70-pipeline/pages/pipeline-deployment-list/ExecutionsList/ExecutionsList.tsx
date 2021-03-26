import React from 'react'
import { Text } from '@wings-software/uicore'
import { String } from 'framework/exports'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'

import ExecutionCard from './ExecutionCard/ExecutionCard'
import css from './ExecutionList.module.scss'

export interface ExecutionsListProps {
  pipelineExecutionSummary: PipelineExecutionSummary[] | undefined
  hasFilters?: boolean
  isMinimalView?: boolean
}

export default function ExecutionsList({
  pipelineExecutionSummary,
  hasFilters,
  isMinimalView
}: ExecutionsListProps): React.ReactElement {
  return (
    <div className={css.main}>
      {hasFilters && !pipelineExecutionSummary?.length ? (
        <Text>
          <String stringID="noSearchResultsFoundPeriod" />
        </Text>
      ) : null}
      {pipelineExecutionSummary?.map(pipelineExecution => (
        <ExecutionCard
          pipelineExecution={pipelineExecution}
          key={pipelineExecution.planExecutionId}
          isMinimalView={isMinimalView}
        />
      ))}
    </div>
  )
}
