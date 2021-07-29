import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStage } from './PipelineStage'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: 'Pipeline',
  type: StageType.PIPELINE,
  icon: 'pipeline',
  iconColor: 'var(--pipeline-blue-color)',
  isApproval: false,
  openExecutionStrategy: false
})

const getStageEditorImplementation = (isEnabled: boolean, _getString: UseStringsReturn['getString']) => (
  <PipelineStage
    icon={'chained-pipeline'}
    name={_getString('pipeline.pipelineSteps.chainedPipeline')}
    title=""
    description=""
    type={StageType.PIPELINE}
    isDisabled={!isEnabled}
    isApproval={false}
  />
)

stagesCollection.registerStageFactory(StageType.PIPELINE, getStageAttributes, getStageEditorImplementation)
