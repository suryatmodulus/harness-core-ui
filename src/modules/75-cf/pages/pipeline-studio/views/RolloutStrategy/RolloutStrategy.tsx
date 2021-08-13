import React from 'react'
import { set } from 'lodash-es'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'

export interface RolloutStrategyProps {
  selectedStageId: string
}

export const RolloutStrategy: React.FC<RolloutStrategyProps> = ({ selectedStageId }) => {
  const {
    state: { pipeline, originalPipeline, pipelineView },
    stepsFactory,
    isReadonly,
    updatePipeline,
    updateStage,
    getStageFromPipeline,
    updatePipelineView,
    setSelectedStepId,
    getStagePathFromPipeline
  } = React.useContext(PipelineContext)
  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')

  React.useEffect(() => {
    const { stage: data } = getStageFromPipeline(selectedStageId)

    if (data) {
      let shouldUpdate = false

      if (!data?.stage?.spec?.execution?.steps) {
        set(data, 'stage.spec.execution.steps', [])
        shouldUpdate = true
      }

      if (shouldUpdate) {
        updatePipeline(pipeline)
      }
    }
  }, [pipeline, selectedStageId, getStageFromPipeline, updatePipeline])

  const selectedStage = getStageFromPipeline(selectedStageId).stage
  const originalStage = getStageFromPipeline(selectedStageId, originalPipeline).stage
  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)

  return (
    <ExecutionGraph
      allowAddGroup={false}
      hasRollback={false}
      isReadonly={isReadonly}
      hasDependencies={false}
      stepsFactory={stepsFactory}
      ref={executionRef}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stage={selectedStage!}
      originalStage={originalStage}
      updateStage={stageData => {
        updateStage(stageData.stage!)
      }}
      pathToStage={`${stagePath}.stage.spec.execution`}
      onAddStep={(event: ExecutionGraphAddStepEvent) => {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: DrawerTypes.AddStep,
            data: {
              paletteData: {
                entity: event.entity,
                stepsMap: event.stepsMap,
                onUpdate: executionRef.current?.stepGroupUpdated,
                // isAddStepOverride: true,
                isRollback: event.isRollback,
                isParallelNodeClicked: event.isParallel,
                hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
              }
            }
          }
        })
      }}
      onEditStep={(event: ExecutionGraphEditStepEvent) => {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: DrawerTypes.StepConfig,
            data: {
              stepConfig: {
                node: event.node as any,
                stepsMap: event.stepsMap,
                onUpdate: executionRef.current?.stepGroupUpdated,
                isStepGroup: event.isStepGroup,
                isUnderStepGroup: event.isUnderStepGroup,
                addOrEdit: event.addOrEdit,
                hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
              }
            }
          }
        })
      }}
      onSelectStep={(stepId: string) => {
        setSelectedStepId(stepId)
      }}
    />
  )
}
