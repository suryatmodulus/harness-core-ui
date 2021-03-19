import { createContext, useContext } from 'react'

import type { ExecutionNode } from 'services/cd-ng'
import type { PipelineExecutionDetail, GraphLayoutNode } from 'services/pipeline-ng'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'

export interface ExecutionContextParams {
  pipelineExecutionDetail: PipelineExecutionDetail | null
  allNodeMap: { [key: string]: ExecutionNode }
  pipelineStagesMap: Map<string, GraphLayoutNode>
  selectedStageId: string
  selectedStepId: string
  loading: boolean
  queryParams: ExecutionPageQueryParams
  logsToken: string
  setLogsToken: (token: string) => void
  refetch?: (() => Promise<void>) | undefined
}

const ExecutionContext = createContext<ExecutionContextParams>({
  pipelineExecutionDetail: null,
  allNodeMap: {},
  pipelineStagesMap: new Map(),
  selectedStageId: '',
  selectedStepId: '',
  loading: false,
  queryParams: {},
  logsToken: '',
  setLogsToken: () => void 0,
  refetch: undefined
})

export default ExecutionContext

export function useExecutionContext(): ExecutionContextParams {
  return useContext(ExecutionContext)
}
