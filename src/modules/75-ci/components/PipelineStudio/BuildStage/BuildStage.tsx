import React from 'react'
import { PipelineStage } from '@pipeline/components/PipelineStages/PipelineStage'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { EditStageView } from './EditStageView/EditStageView'
import BuildStageSetupShell from '../BuildStageSetupShell/BuildStageSetupShell'

interface BuildStageProps {
  data?: StageElementWrapper<BuildStageElementConfig>
  onSubmit?: (values: StageElementWrapper<BuildStageElementConfig>, identifier: string) => void
}

export class BuildStage extends PipelineStage<BuildStageProps> {
  render(): JSX.Element {
    const { minimal, stageProps } = this.props
    if (minimal) {
      return <EditStageView {...stageProps} />
    }
    return <BuildStageSetupShell />
  }
}
