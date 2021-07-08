import React from 'react'
import { Container } from '@wings-software/uicore'
import { get } from 'lodash-es'

import { useUpdateQueryParams } from '@common/hooks'
import { processExecutionData } from '@pipeline/utils/executionUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { StageSelection, StageSelectOption } from '@pipeline/components/StageSelection/StageSelection'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { isExecutionNotStarted, isExecutionSkipped } from '@pipeline/utils/statusHelpers'
import { LogsContent } from '@pipeline/components/LogsContent/LogsContent'

// import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
// import { ExecutionVerificationView } from '@pipeline/components/ExecutionVerification/ExecutionVerificationView'
import { StepsTree } from './StepsTree/StepsTree'
import css from './ExecutionLogView.module.scss'

export default function ExecutionLogView(): React.ReactElement {
  const { pipelineStagesMap, allNodeMap, pipelineExecutionDetail, selectedStageId, selectedStepId } =
    useExecutionContext()
  const { updateQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()

  const tree = React.useMemo(
    () => processExecutionData(pipelineExecutionDetail?.executionGraph),
    [pipelineExecutionDetail?.executionGraph]
  )
  const selectOptions: StageSelectOption[] = React.useMemo(() => {
    return [...pipelineStagesMap.entries()].map(([identifier, stage]) => ({
      label: stage.nodeIdentifier || '',
      value: identifier,
      node: stage,
      type: stage.nodeType || ''
    }))
  }, [pipelineStagesMap])

  const selectedStep = allNodeMap[selectedStepId]
  const errorMessage =
    get(selectedStep, 'failureInfo.message') || get(selectedStep, 'executableResponses[0].skipTask.message')
  const isSkipped = isExecutionSkipped(selectedStep?.status)

  function handleStageChange(item: StageSelectOption): void {
    updateQueryParams({ stage: item.value as string })
  }

  function handleStepSelect(stepId: string): void {
    updateQueryParams({ step: stepId, stage: selectedStageId })
  }

  function logViewerView() {
    // if (selectedStep?.stepType === StepType.Verify) {
    //   return <ExecutionVerificationView />
    // }
    return (
      <div className={css.logViewer}>
        <LogsContent mode="console-view" errorMessage={errorMessage} isWarning={isSkipped} />
      </div>
    )
  }

  return (
    <Container className={css.logsContainer}>
      <div className={css.stepsContainer}>
        <StageSelection
          selectOptions={selectOptions}
          onStageChange={handleStageChange}
          selectedStageId={selectedStageId}
          className={css.stageSelector}
          chevronIcon="chevron-down"
          itemDisabled={item => isExecutionNotStarted(item.node.status)}
          popoverProps={{ popoverClassName: css.stageSelectionMenu }}
        />
        <div className={css.stageTree}>
          <StepsTree nodes={tree} selectedStepId={selectedStepId} onStepSelect={handleStepSelect} isRoot />
        </div>
      </div>
      {logViewerView()}
    </Container>
  )
}
