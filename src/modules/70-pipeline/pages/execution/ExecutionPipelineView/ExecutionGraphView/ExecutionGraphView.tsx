import React from 'react'

import { isExecutionNotStarted, isExecutionSkipped } from '@pipeline/utils/statusHelpers'
import ExecutionLayout from '@pipeline/components/ExecutionLayout/ExecutionLayout'
import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import ExecutionStepDetails from '@pipeline/components/ExecutionStepDetails/ExecutionStepDetails'

import ExecutionGraph from './ExecutionGraph/ExecutionGraph'
import ExecutionStageDetails from './ExecutionStageDetails/ExecutionStageDetails'

import css from './ExecutionGraphView.module.scss'

export const PANEL_RESIZE_DELTA = 50
export const MIN_PANEL_SIZE = 200

export default function ExecutionGraphView(): React.ReactElement {
  const { replaceQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const { allNodeMap, pipelineStagesMap, selectedStageId, queryParams, setSelectedStepId } = useExecutionContext()

  function handleStepSelection(step?: string): void {
    if (!step) {
      const params = {
        ...queryParams
      }

      delete params.step

      replaceQueryParams(params)
      setSelectedStepId('')
    } else {
      const selectedStep = allNodeMap?.[step]

      if (isExecutionNotStarted(selectedStep?.status)) {
        return
      }

      const params = {
        ...queryParams,
        stage: selectedStageId,
        step
      }

      replaceQueryParams(params)
    }
  }

  function handleStageSelection(stage: string): void {
    const selectedStage = pipelineStagesMap.get(stage)

    if (isExecutionNotStarted(selectedStage?.status) || isExecutionSkipped(selectedStage?.status)) {
      return
    }

    const params = {
      ...queryParams,
      stage
    }

    delete params.step

    replaceQueryParams(params)
  }

  return (
    <ExecutionLayout className={css.main}>
      <ExecutionGraph onSelectedStage={handleStageSelection} />
      <ExecutionStageDetails onStepSelect={handleStepSelection} onStageSelect={handleStageSelection} />
      <ExecutionStepDetails />
    </ExecutionLayout>
  )
}
