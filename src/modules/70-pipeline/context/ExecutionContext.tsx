import { createContext, useContext } from 'react'

import type { ExecutionNode } from 'services/pipeline-ng'
import type { PipelineExecutionDetail, GraphLayoutNode } from 'services/pipeline-ng'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'

export interface GraphCanvasState {
  offsetX?: number
  offsetY?: number
  zoom?: number
}

export interface ExecutionContextParams {
  pipelineExecutionDetail: PipelineExecutionDetail | null
  allNodeMap: { [key: string]: ExecutionNode }
  pipelineStagesMap: Map<string, GraphLayoutNode>
  selectedStageId: string
  selectedStepId: string
  loading: boolean
  isDataLoadedForSelectedStage: boolean
  queryParams: ExecutionPageQueryParams
  logsToken: string
  setLogsToken: (token: string) => void
  refetch?: (() => Promise<void>) | undefined
  addNewNodeToMap(id: string, node: ExecutionNode): void
  setStepsGraphCanvasState?: (canvasState: GraphCanvasState) => void
  stepsGraphCanvasState?: GraphCanvasState
  setSelectedStepId: (step: string) => void
  setSelectedStageId: (stage: string) => void
}

export const ExecutionContext = createContext<ExecutionContextParams>({
  pipelineExecutionDetail: null,
  allNodeMap: {},
  pipelineStagesMap: new Map(),
  selectedStageId: '',
  selectedStepId: '',
  loading: false,
  isDataLoadedForSelectedStage: false,
  queryParams: {},
  logsToken: '',
  setLogsToken: () => void 0,
  refetch: undefined,
  addNewNodeToMap: () => void 0,
  setStepsGraphCanvasState: () => undefined,
  stepsGraphCanvasState: { offsetX: 0, offsetY: 0, zoom: 100 },
  setSelectedStepId: () => void 0,
  setSelectedStageId: () => void 0
})

export default ExecutionContext

export function useExecutionContext(): ExecutionContextParams {
  return useContext(ExecutionContext)
}
