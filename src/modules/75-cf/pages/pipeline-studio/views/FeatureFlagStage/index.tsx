import React, { ReactElement } from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { FeatureFlagStage } from './FeatureFlagStage'

const getStageAttributes = (getString: UseStringsReturn['getString']): StageAttributes => ({
  name: getString('pipelineSteps.feature.create.featureStageName'),
  type: StageType.FEATURE,
  icon: 'cf-main',
  iconColor: 'var(--pipeline-feature-stage-color)',
  isApproval: false,
  openExecutionStrategy: false
})

const getStageEditorImplementation = (isEnabled: boolean, getString: UseStringsReturn['getString']): ReactElement => (
  <FeatureFlagStage
    icon={'cf-main'}
    hoverIcon={'feature-flag-stage'}
    iconsStyle={{ color: 'var(--pipeline-feature-stage-color)' }}
    name={getString('pipelineSteps.feature.create.featureStageName')}
    type={StageType.FEATURE}
    title={getString('pipelineSteps.feature.create.featureStageName')}
    description={getString('pipeline.pipelineSteps.featureStageDescription')}
    isDisabled={false}
    isHidden={!isEnabled}
    isApproval={false}
  />
)

export function registerFeatureFlagPipelineStage(): void {
  stagesCollection.registerStageFactory(StageType.FEATURE, getStageAttributes, getStageEditorImplementation)
}
