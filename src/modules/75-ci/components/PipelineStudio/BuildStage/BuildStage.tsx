import React from 'react'
import { PipelineStage } from '@pipeline/exports'
import type { StageElementWrapper } from 'services/cd-ng'
import { EditStageView } from './EditStageView/EditStageView'
import BuildStageSetupShell from '../BuildStageSetupShell/BuildStageSetupShell'

interface BuildStageProps {
  data?: StageElementWrapper
  onSubmit?: (values: StageElementWrapper, identifier: string) => void
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
