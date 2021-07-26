import React from 'react'
import { PipelineStage } from '@pipeline/components/PipelineStages/PipelineStage'
import { FeatureAddEditStageView, FeatureAddEditStageViewProps } from './FeatureAddStageView/FeatureAddStageView'
import FeatureStageSetupShell from '../FeatureStageSetupShell/FeatureStageSetupShell'

type DeployStageProps = Omit<FeatureAddEditStageViewProps, 'onChange'>

export class FeatureFlagStage extends PipelineStage<DeployStageProps> {
  render(): JSX.Element {
    const { minimal, stageProps } = this.props
    if (minimal) {
      return <FeatureAddEditStageView {...stageProps} />
    }
    return <FeatureStageSetupShell />
  }
}
