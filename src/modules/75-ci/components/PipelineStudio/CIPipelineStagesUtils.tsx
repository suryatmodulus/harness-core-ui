import React from 'react'
import type { UseStringsReturn } from 'framework/exports'
import { PipelineStages, PipelineStagesProps } from '@pipeline/exports'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { StageTypes } from '@pipeline/components/PipelineStudio/Stages/StageTypes'

export const getCIPipelineStages: (
  args: Omit<PipelineStagesProps, 'children'>,
  getString: UseStringsReturn['getString'],
  isCIEnabled?: boolean,
  isCDEnabled?: boolean,
  isCFEnabled?: boolean,
  isApprovalStageEnabled?: boolean
) => React.ReactElement<PipelineStagesProps> = (
  args,
  getString,
  isCIEnabled = false,
  isCDEnabled = false,
  isCFEnabled = false,
  isApprovalStageEnabled = false
) => {
  return (
    <PipelineStages {...args}>
      {stagesCollection.getStage(StageTypes.BUILD, isCIEnabled, getString)}
      {stagesCollection.getStage(StageTypes.DEPLOY, isCDEnabled, getString)}
      {stagesCollection.getStage(StageTypes.FEATURE, isCFEnabled, getString)}
      {stagesCollection.getStage(StageTypes.PIPELINE, false, getString)}
      {stagesCollection.getStage(StageTypes.APPROVAL, isApprovalStageEnabled, getString)}
      {stagesCollection.getStage(StageTypes.CUSTOM, false, getString)}
    </PipelineStages>
  )
}
