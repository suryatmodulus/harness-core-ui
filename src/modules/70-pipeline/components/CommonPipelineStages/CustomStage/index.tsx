import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { CustomStage } from './CustomStage'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: 'Custom',
  type: StageType.CUSTOM,
  icon: 'pipeline-custom',
  iconColor: 'var(--pipeline-custom-stage-color)',
  isApproval: false,
  openExecutionStrategy: false
})

const getStageEditorImplementation = (isEnabled: boolean, _getString: UseStringsReturn['getString']) => (
  <CustomStage
    icon={'custom-stage-icon'}
    name={_getString('pipeline.pipelineSteps.customStage')}
    title=""
    description=""
    type={StageType.CUSTOM}
    isDisabled={!isEnabled}
    isApproval={false}
  />
)

stagesCollection.registerStageFactory(StageType.CUSTOM, getStageAttributes, getStageEditorImplementation)
