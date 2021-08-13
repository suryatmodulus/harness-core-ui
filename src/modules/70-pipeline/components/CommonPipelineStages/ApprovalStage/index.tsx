import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStageProps } from '@pipeline/components/PipelineStages/PipelineStage'
import { ApprovalStage } from './ApprovalStage'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: 'Approval',
  type: StageType.APPROVAL,
  icon: 'approval-stage-icon',
  iconColor: 'var(--pipeline-approval-stage-color)',
  isApproval: true,
  openExecutionStrategy: false
})

const getStageEditorImplementation = (
  isEnabled: boolean,
  _getString: UseStringsReturn['getString']
): React.ReactElement<PipelineStageProps> => (
  <ApprovalStage
    icon={'approval-stage-icon'}
    name={'Approval'}
    hoverIcon={'approval-stage'}
    title={_getString('approvalStage.title')}
    description={_getString('pipeline.pipelineSteps.approvalStageDescription')}
    type={StageType.APPROVAL}
    iconsStyle={{ color: 'var(--pipeline-approval-stage-color)' }}
    isDisabled={!isEnabled}
    isApproval={true}
  />
)

stagesCollection.registerStageFactory(StageType.APPROVAL, getStageAttributes, getStageEditorImplementation)
