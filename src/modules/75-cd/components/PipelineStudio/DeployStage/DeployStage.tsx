import React from 'react'
import { PipelineStage } from '@pipeline/components/PipelineStages/PipelineStage'
import { DeployStageErrorProvider } from '@pipeline/context/StageErrorContext'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { EditStageView } from './EditStageView/EditStageView'
import DeployStageSetupShell from '../DeployStageSetupShell/DeployStageSetupShell'

interface DeployStageProps {
  data?: StageElementWrapper<DeploymentStageElementConfig>
  onSubmit?: (values: StageElementWrapper<DeploymentStageElementConfig>, identifier?: string) => void
}

export class DeployStage extends PipelineStage<DeployStageProps> {
  render(): JSX.Element {
    const { minimal, stageProps } = this.props
    if (minimal) {
      return <EditStageView isReadonly={false} {...stageProps} />
    }
    return (
      <DeployStageErrorProvider>
        <DeployStageSetupShell />
      </DeployStageErrorProvider>
    )
  }
}
