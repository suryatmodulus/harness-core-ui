import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { BuildStage } from './BuildStage'

const getStageAttributes = (getString: UseStringsReturn['getString']): StageAttributes => ({
  name: getString('buildText'),
  type: StageType.BUILD,
  icon: 'ci-main',
  iconColor: 'var(--pipeline-build-stage-color)',
  isApproval: false,
  openExecutionStrategy: false
})
const getStageEditorImplementation = (isEnabled: boolean, getString: UseStringsReturn['getString']) => (
  <BuildStage
    icon={'ci-main'}
    hoverIcon={'build-stage'}
    iconsStyle={{ color: 'var(--pipeline-build-stage-color)' }}
    name={getString('buildText')}
    type={StageType.BUILD}
    title={getString('pipelineSteps.build.create.buildStageName')}
    description={getString('ci.description')}
    isDisabled={false}
    isHidden={!isEnabled}
    isApproval={false}
  />
)
stagesCollection.registerStageFactory(StageType.BUILD, getStageAttributes, getStageEditorImplementation)
