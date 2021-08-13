import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DeployStage } from './DeployStage'

const getStageAttributes = (getString: UseStringsReturn['getString']): StageAttributes => ({
  name: getString('pipelineSteps.deploy.create.deployStageName'),
  type: StageType.DEPLOY,
  icon: 'cd-main',
  iconColor: 'var(--pipeline-deploy-stage-color)',
  isApproval: false,
  openExecutionStrategy: true
})

const getStageEditorImplementation = (isEnabled: boolean, getString: UseStringsReturn['getString']) => (
  <DeployStage
    icon={'cd-main'}
    hoverIcon={'deploy-stage'}
    iconsStyle={{ color: 'var(--pipeline-deploy-stage-color)' }}
    name={getString('pipelineSteps.deploy.create.deployStageName')}
    type={StageType.DEPLOY}
    title={getString('pipelineSteps.deploy.create.deployStageName')}
    description={getString('pipeline.pipelineSteps.deployStageDescription')}
    isHidden={!isEnabled}
    isDisabled={false}
    isApproval={false}
  />
)

stagesCollection.registerStageFactory(StageType.DEPLOY, getStageAttributes, getStageEditorImplementation)
