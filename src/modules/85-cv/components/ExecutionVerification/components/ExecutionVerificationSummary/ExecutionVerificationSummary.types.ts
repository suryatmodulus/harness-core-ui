import type { StageType } from '@pipeline/utils/stageHelpers'
import type { ExecutionNode } from 'services/pipeline-ng'
import type { DeploymentNodeAnalysisResult } from '../DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'

export interface VerifyExecutionProps {
  step: ExecutionNode
  stageType?: StageType
  displayAnalysisCount?: boolean
  onSelectNode?: (selectedNode?: DeploymentNodeAnalysisResult) => void
  className?: string
}
