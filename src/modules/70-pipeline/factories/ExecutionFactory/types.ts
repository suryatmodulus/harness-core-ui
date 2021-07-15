import type { IconName } from '@wings-software/uicore'

import type { ExecutionNode, GraphLayoutNode } from 'services/pipeline-ng'
import type { StageType } from '@pipeline/utils/stageHelpers'

export interface StepDetailProps {
  step: ExecutionNode
  stageType?: StageType
}

export interface StepDetailsRegister {
  component: React.ComponentType<StepDetailProps>
}

export interface ExecutionCardInfoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  nodeMap: Record<string, GraphLayoutNode>
  startingNodeId: string
}

export interface ExecutionCardInfoRegister {
  component: React.ComponentType<ExecutionCardInfoProps>
  icon: IconName
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ExecutionSummaryProps<T = any> {
  data: T
  nodeMap: Map<string, GraphLayoutNode>
}

export interface ExecutionSummaryRegister {
  component: React.ComponentType<ExecutionSummaryProps>
}
