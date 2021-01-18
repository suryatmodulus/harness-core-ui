import type { IconName } from '@wings-software/uicore'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { isExecutionSuccess, isExecutionCompletedWithBadState, isExecutionRunning } from '@pipeline/utils/statusHelpers'
import type { GraphLayoutNode, PipelineExecutionSummary, ExecutionGraph } from 'services/pipeline-ng'

export const LITE_ENGINE_TASK = 'liteEngineTask'

export const NonSelectableNodes: string[] = ['NG_SECTION', 'NG_FORK', 'DEPLOYMENT_STAGE_STEP']

/**
 * @deprecated use import { ExecutionPathProps } from '@common/interfaces/RouteInterfaces' instead
 */
export interface ExecutionPathParams {
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string
  executionIdentifier: string
  accountId: string
}

export interface ExecutionQueryParams {
  stage?: string
  step?: string
  view?: 'log' | 'graph'
}

export function getPipelineStagesMap(
  layoutNodeMap: PipelineExecutionSummary['layoutNodeMap'],
  startingNodeId?: string
): Map<string, GraphLayoutNode> {
  const map = new Map<string, GraphLayoutNode>()

  function recursiveSetInMap(node: GraphLayoutNode): void {
    if (node.nodeType === NodeTypes.Parallel) {
      node.edgeLayoutList?.currentNodeChildren?.forEach(item => {
        if (item && layoutNodeMap?.[item]) {
          map.set(layoutNodeMap[item].nodeUuid || '', layoutNodeMap[item])
          return
        }
      })
    }
    node.edgeLayoutList?.nextIds?.forEach(item => {
      if (item && layoutNodeMap?.[item]) {
        recursiveSetInMap(layoutNodeMap[item])
        return
      }
    })
    node.nodeType !== NodeTypes.Parallel && map.set(node.nodeUuid || '', node)
  }
  if (startingNodeId && layoutNodeMap?.[startingNodeId]) {
    const node = layoutNodeMap[startingNodeId]
    recursiveSetInMap(node)
  }

  return map
}

enum NodeTypes {
  Parallel = 'parallel',
  Stage = 'stage'
}
export interface ProcessLayoutNodeMapResponse {
  stage?: GraphLayoutNode
  parallel?: GraphLayoutNode[]
}

export const processLayoutNodeMap = (executionSummary?: PipelineExecutionSummary): ProcessLayoutNodeMapResponse[] => {
  const response: ProcessLayoutNodeMapResponse[] = []
  if (!executionSummary) {
    return response
  }
  const startingNodeId = executionSummary.startingNodeId
  const layoutNodeMap = executionSummary.layoutNodeMap
  if (startingNodeId && layoutNodeMap?.[startingNodeId]) {
    let node: GraphLayoutNode | undefined = layoutNodeMap[startingNodeId]
    while (node) {
      const currentNodeChildren: string[] | undefined = node?.edgeLayoutList?.currentNodeChildren
      const nextIds: string[] | undefined = node?.edgeLayoutList?.nextIds
      if (node.nodeType === NodeTypes.Parallel && currentNodeChildren && currentNodeChildren.length > 1) {
        response.push({ parallel: currentNodeChildren.map(item => layoutNodeMap[item]) })
        node = layoutNodeMap[node.edgeLayoutList?.nextIds?.[0] || '']
      } else if (node.nodeType === NodeTypes.Parallel && currentNodeChildren && layoutNodeMap[currentNodeChildren[0]]) {
        response.push({ stage: layoutNodeMap[currentNodeChildren[0]] })
        node = layoutNodeMap[node.edgeLayoutList?.nextIds?.[0] || '']
      } else {
        response.push({ stage: node })
        if (nextIds && nextIds.length === 1) {
          node = layoutNodeMap[nextIds[0]]
        } else {
          node = undefined
        }
      }
    }
  }
  return response
}

export function getRunningStageForPipeline(
  executionSummary?: PipelineExecutionSummary,
  pipelineExecutionStatus?: ExecutionStatus
): string | null {
  if (!executionSummary) {
    return null
  }
  const stages = processLayoutNodeMap(executionSummary)
  const n = stages.length
  // for completed pipeline, select the last completed stage
  if (isExecutionSuccess(pipelineExecutionStatus)) {
    const stage = stages[stages.length - 1]

    if (stage.stage) {
      return stage.stage.nodeUuid || ''
    } else if (stage.parallel && Array.isArray(stage.parallel) && stage.parallel[0]) {
      return stage.parallel[0].nodeUuid || ''
    }
  }

  // for errored pipeline, select the errored stage
  if (isExecutionCompletedWithBadState(pipelineExecutionStatus)) {
    for (let i = stages.length - 1; i >= 0; i--) {
      const stage = stages[i]

      if (stage.stage) {
        if (isExecutionCompletedWithBadState(stage.stage.status)) {
          return stage.stage.nodeUuid || ''
        } else {
          continue
        }
      } else if (stage.parallel && Array.isArray(stage.parallel)) {
        const erorredStage = stage.parallel.filter(item => isExecutionCompletedWithBadState(item.status))[0]

        /* istanbul ignore else */
        if (erorredStage) {
          return erorredStage.nodeUuid || ''
        }
      }
    }
  }

  // find the current running stage
  for (let i = 0; i < n; i++) {
    const stage = stages[i]

    // for normal stage
    if (stage.stage) {
      if (isExecutionRunning(stage.stage.status)) {
        return stage.stage.nodeUuid || ''
      } else {
        continue
      }
      // for parallel stage
    } else if (stage.parallel && Array.isArray(stage.parallel)) {
      const activeStage = stage.parallel.filter(item => isExecutionRunning(item.status))[0]

      /* istanbul ignore else */
      if (activeStage) {
        return activeStage.nodeUuid || ''
      }
    }
  }

  return null
}

export function getRunningStep(graph: ExecutionGraph, nodeId?: string): string | null {
  const { rootNodeId, nodeMap, nodeAdjacencyListMap } = graph

  if (!nodeMap || !nodeAdjacencyListMap) {
    return null
  }

  const currentNodeId = nodeId || rootNodeId

  if (!currentNodeId) return null

  const node = nodeMap[currentNodeId]
  const nodeAdjacencyList = nodeAdjacencyListMap[currentNodeId]

  if (!node || !nodeAdjacencyList) {
    return null
  }

  if (Array.isArray(nodeAdjacencyList.children) && nodeAdjacencyList.children.length > 0) {
    const n = nodeAdjacencyList.children.length

    for (let i = 0; i < n; i++) {
      const childNodeId = nodeAdjacencyList.children[i]
      const step = getRunningStep(graph, childNodeId)

      if (typeof step === 'string') return step
    }
  }

  if (nodeAdjacencyList.nextIds && nodeAdjacencyList.nextIds[0]) {
    const step = getRunningStep(graph, nodeAdjacencyList.nextIds[0])

    if (typeof step === 'string') return step
  }

  if (isExecutionRunning(node.status) && !NonSelectableNodes.includes(node.stepType || '')) {
    return currentNodeId
  }

  return null
}

export function getIconFromStageModule(stageModule: 'cd' | 'ci' | string | undefined): IconName {
  switch (stageModule) {
    case 'cd':
      return 'pipeline-deploy'
    case 'ci':
      return 'pipeline-build'
    default:
      return 'pipeline-deploy'
  }
}
