/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type * as React from 'react'
import type { IconName } from '@wings-software/uicore'
import { has, isEmpty } from 'lodash-es'

import {
  ExecutionStatus,
  ExecutionStatusEnum,
  isExecutionSuccess,
  isExecutionCompletedWithBadState,
  isExecutionRunning,
  isExecutionWaiting
} from '@pipeline/utils/statusHelpers'
import type {
  GraphLayoutNode,
  PipelineExecutionSummary,
  ExecutionGraph,
  ExecutionNode,
  ExecutionNodeAdjacencyList
} from 'services/pipeline-ng'
import {
  ExecutionPipelineNode,
  ExecutionPipelineNodeType,
  ExecutionPipelineItem,
  ExecutionPipelineGroupInfo
} from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { isApprovalStep } from './stepUtils'

export const LITE_ENGINE_TASK = 'liteEngineTask'
export const STATIC_SERVICE_GROUP_NAME = 'static_service_group'
export const RollbackIdentifier = 'Rollback'
export const StepGroupRollbackIdentifier = '(Rollback)'

export const RollbackContainerCss: React.CSSProperties = {
  borderColor: 'var(--red-450)'
}

// TODO: remove use DTO
export interface ServiceDependency {
  identifier: string
  name: string | null
  image: string
  status: string
  startTime: string
  endTime: string | null
  errorMessage: string | null
  errorReason: string | null
}

export enum NodeType {
  SERVICE = 'SERVICE',
  SERVICE_CONFIG = 'SERVICE_CONFIG',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  GENERIC_SECTION = 'GENERIC_SECTION',
  STEP_GROUP = 'STEP_GROUP',
  NG_SECTION = 'NG_SECTION',
  ROLLBACK_OPTIONAL_CHILD_CHAIN = 'ROLLBACK_OPTIONAL_CHILD_CHAIN',
  FORK = 'NG_FORK',
  INFRASTRUCTURE_SECTION = 'INFRASTRUCTURE_SECTION',
  DEPLOYMENT_STAGE_STEP = 'DEPLOYMENT_STAGE_STEP',
  APPROVAL_STAGE = 'APPROVAL_STAGE',
  NG_SECTION_WITH_ROLLBACK_INFO = 'NG_SECTION_WITH_ROLLBACK_INFO',
  NG_EXECUTION = 'NG_EXECUTION'
}

export const NonSelectableNodes: NodeType[] = [
  NodeType.NG_SECTION,
  NodeType.FORK,
  NodeType.DEPLOYMENT_STAGE_STEP,
  NodeType.APPROVAL_STAGE
]
export const TopLevelNodes: NodeType[] = [
  NodeType.NG_SECTION,
  NodeType.ROLLBACK_OPTIONAL_CHILD_CHAIN,
  NodeType.INFRASTRUCTURE_SECTION,
  NodeType.NG_SECTION_WITH_ROLLBACK_INFO,
  NodeType.NG_EXECUTION
]
export const StepTypeIconsMap: { [key in NodeType]: IconName } = {
  SERVICE: 'services',
  SERVICE_CONFIG: 'services',
  GENERIC_SECTION: 'step-group',
  NG_SECTION_WITH_ROLLBACK_INFO: 'step-group',
  NG_SECTION: 'step-group',
  NG_EXECUTION: 'step-group',
  ROLLBACK_OPTIONAL_CHILD_CHAIN: 'step-group',
  INFRASTRUCTURE_SECTION: 'step-group',
  STEP_GROUP: 'step-group',
  INFRASTRUCTURE: 'infrastructure',
  NG_FORK: 'fork',
  DEPLOYMENT_STAGE_STEP: 'circle',
  APPROVAL_STAGE: 'approval-stage-icon'
}

export const ExecutionStatusIconMap: Record<ExecutionStatus, IconName> = {
  Success: 'tick-circle',
  Running: 'main-more',
  AsyncWaiting: 'main-more',
  TaskWaiting: 'main-more',
  TimedWaiting: 'main-more',
  Failed: 'circle-cross',
  Errored: 'circle-cross',
  IgnoreFailed: 'tick-circle',
  Expired: 'expired',
  Aborted: 'banned',
  Discontinuing: 'banned',
  Suspended: 'banned',
  Queued: 'queued',
  NotStarted: 'pending',
  Paused: 'pause',
  ResourceWaiting: 'waiting',
  Skipped: 'skipped',
  ApprovalRejected: 'circle-cross',
  InterventionWaiting: 'waiting',
  ApprovalWaiting: 'waiting',
  Pausing: 'pause'
}

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
    } else {
      map.set(node.nodeUuid || '', node)
    }

    node.edgeLayoutList?.nextIds?.forEach(item => {
      if (item && layoutNodeMap?.[item]) {
        recursiveSetInMap(layoutNodeMap[item])
        return
      }
    })
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

export function getActiveStageForPipeline(
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
  // for waiting status, select the waiting state
  if (isExecutionCompletedWithBadState(pipelineExecutionStatus) || isExecutionWaiting(pipelineExecutionStatus)) {
    for (let i = stages.length - 1; i >= 0; i--) {
      const stage = stages[i]

      if (stage.stage) {
        if (isExecutionCompletedWithBadState(stage.stage.status) || isExecutionWaiting(stage.stage.status)) {
          return stage.stage.nodeUuid || ''
        }
      } else if (stage.parallel && Array.isArray(stage.parallel)) {
        const erroredStage = stage.parallel.find(
          item => isExecutionCompletedWithBadState(item.status) || isExecutionWaiting(item.status)
        )

        /* istanbul ignore else */
        if (erroredStage) {
          return erroredStage.nodeUuid || ''
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

export function getActiveStep(
  graph: ExecutionGraph,
  nodeId?: string,
  layoutNodeMap?: Record<string, GraphLayoutNode>
): string | null {
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
      const step = getActiveStep(graph, childNodeId, layoutNodeMap)

      if (typeof step === 'string') return step
    }
  }

  if (nodeAdjacencyList.nextIds && nodeAdjacencyList.nextIds[0]) {
    const step = getActiveStep(graph, nodeAdjacencyList.nextIds[0], layoutNodeMap)

    if (typeof step === 'string') return step
  }

  if (
    !NonSelectableNodes.includes(node.stepType as NodeType) &&
    currentNodeId !== rootNodeId &&
    !has(layoutNodeMap, node.setupId || '') &&
    (isExecutionRunning(node.status) ||
      isExecutionWaiting(node.status) ||
      isExecutionCompletedWithBadState(node.status))
  ) {
    return currentNodeId
  }

  return null
}

export function getIconFromStageModule(stageModule: 'cd' | 'ci' | string | undefined, stageType?: string): IconName {
  if (stageType) {
    const icon = stagesCollection.getStageAttributes(stageType, (key: string) => key)?.icon
    if (icon) {
      return icon
    }
  }
  switch (stageModule) {
    case 'cd':
      return 'pipeline-deploy'
    case 'ci':
      return 'pipeline-build'
    default:
      return 'pipeline-deploy'
  }
}

export function getIconStylesFromCollection(stageType?: string): React.CSSProperties {
  if (stageType) {
    const iconColor = stagesCollection.getStageAttributes(stageType, key => key)?.iconColor

    if (iconColor) {
      return { color: iconColor }
    }
  }

  return {}
}

const addDependencyToArray = (service: ServiceDependency, arr: ExecutionPipelineNode<ExecutionNode>[]): void => {
  const stepItem: ExecutionPipelineItem<ExecutionNode> = {
    identifier: service.identifier as string,
    name: service.name as string,
    type: ExecutionPipelineNodeType.NORMAL,
    status: service.status as ExecutionStatus,
    icon: 'dependency-step',
    data: service as ExecutionNode,
    itemType: 'service-dependency'
  }

  // add step node
  const stepNode: ExecutionPipelineNode<ExecutionNode> = { item: stepItem }
  arr.push(stepNode)
}

const addDependencies = (
  dependencies: ServiceDependency[],
  stepsPipelineNodes: ExecutionPipelineNode<ExecutionNode>[]
): void => {
  if (dependencies && dependencies.length > 0) {
    const items: ExecutionPipelineNode<ExecutionNode>[] = []

    dependencies.forEach(_service => addDependencyToArray(_service, items))

    const dependenciesGroup: ExecutionPipelineGroupInfo<ExecutionNode> = {
      identifier: STATIC_SERVICE_GROUP_NAME,
      name: 'Dependencies', // TODO: use getString('execution.dependencyGroupName'),
      status: dependencies[0].status as ExecutionStatus, // use status of first service
      data: {},
      icon: 'step-group',
      verticalStepGroup: true,
      isOpen: true,
      items: [{ parallel: items }]
    }

    // dependency goes at the beginning
    stepsPipelineNodes.unshift({ group: dependenciesGroup })
  }
}

const processLiteEngineTask = (
  nodeData: ExecutionNode | undefined,
  rootNodes: ExecutionPipelineNode<ExecutionNode>[],
  parentNode?: ExecutionNode
): void => {
  // NOTE: liteEngineTask contains information about dependencies
  const serviceDependencyList: ServiceDependency[] =
    // Array check is required for legacy support
    (Array.isArray(nodeData?.outcomes)
      ? nodeData?.outcomes?.find((_item: any) => !!_item.serviceDependencyList)?.serviceDependencyList
      : nodeData?.outcomes?.dependencies?.serviceDependencyList) || []

  // 1. Add dependency services
  addDependencies(serviceDependencyList, rootNodes)

  // 2. Exclude Initialize duration from the parent
  if (nodeData && parentNode) {
    const taskDuration = nodeData.endTs! - nodeData.startTs!
    parentNode.startTs = Math.min(parentNode.startTs! + taskDuration, parentNode.endTs!)
  }

  // 3. Add Initialize step ( at the first place in array )
  const stepItem: ExecutionPipelineItem<ExecutionNode> = {
    identifier: nodeData?.uuid as string,
    name: 'Initialize',
    type: getExecutionPipelineNodeType(nodeData?.stepType),
    status: nodeData?.status as ExecutionStatus,
    icon: 'initialize-step',
    data: nodeData as ExecutionNode,
    itemType: 'service-dependency'
  }
  const stepNode: ExecutionPipelineNode<ExecutionNode> = { item: stepItem }
  rootNodes.unshift(stepNode)
}

const processNodeData = (
  children: string[],
  nodeMap: ExecutionGraph['nodeMap'],
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap'],
  rootNodes: Array<ExecutionPipelineNode<ExecutionNode>>
): Array<ExecutionPipelineNode<ExecutionNode>> => {
  const items: Array<ExecutionPipelineNode<ExecutionNode>> = []
  children?.forEach(item => {
    const nodeData = nodeMap?.[item]
    const isRollback = nodeData?.name?.endsWith(StepGroupRollbackIdentifier) ?? false
    if (nodeData?.stepType === NodeType.FORK) {
      items.push({
        parallel: processNodeData(
          nodeAdjacencyListMap?.[item].children || /* istanbul ignore next */ [],
          nodeMap,
          nodeAdjacencyListMap,
          rootNodes
        )
      })
    } else if (
      nodeData?.stepType === NodeType.STEP_GROUP ||
      nodeData?.stepType === NodeType.NG_SECTION ||
      (nodeData && isRollback)
    ) {
      items.push({
        group: {
          name: nodeData.name || /* istanbul ignore next */ '',
          identifier: item,
          data: nodeData,
          containerCss: {
            ...(isRollback ? RollbackContainerCss : {})
          },
          status: nodeData.status as ExecutionStatus,
          isOpen: true,
          skipCondition: nodeData.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
          when: nodeData.nodeRunInfo,
          ...getIconDataBasedOnType(nodeData),
          items: processNodeData(
            nodeAdjacencyListMap?.[item].children || /* istanbul ignore next */ [],
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes
          )
        }
      })
    } else {
      if (nodeData?.stepType === LITE_ENGINE_TASK) {
        const parentNodeId =
          Object.entries(nodeAdjacencyListMap || {}).find(([_, val]) => {
            return (val?.children?.indexOf(nodeData.uuid!) ?? -1) >= 0
          })?.[0] || ''
        processLiteEngineTask(nodeData, rootNodes, nodeMap?.[parentNodeId])
      } else {
        items.push({
          item: {
            name: nodeData?.name || /* istanbul ignore next */ '',
            ...getIconDataBasedOnType(nodeData),
            identifier: item,
            skipCondition: nodeData?.skipInfo?.evaluatedCondition ? nodeData?.skipInfo.skipCondition : undefined,
            when: nodeData?.nodeRunInfo,
            status: nodeData?.status as ExecutionStatus,
            type: getExecutionPipelineNodeType(nodeData?.stepType),
            data: nodeData
          }
        })
      }
    }
    const nextIds = nodeAdjacencyListMap?.[item].nextIds || /* istanbul ignore next */ []
    nextIds.forEach(id => {
      const nodeDataNext = nodeMap?.[id]
      const isRollbackNext = nodeDataNext?.name?.endsWith(StepGroupRollbackIdentifier) ?? false
      if (nodeDataNext?.stepType === NodeType.FORK) {
        items.push({
          parallel: processNodeData(
            nodeAdjacencyListMap?.[id].children || /* istanbul ignore next */ [],
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes
          )
        })
      } else if (nodeDataNext?.stepType === NodeType.STEP_GROUP || (isRollbackNext && nodeDataNext)) {
        items.push({
          group: {
            name: nodeDataNext.name || /* istanbul ignore next */ '',
            identifier: id,
            data: nodeDataNext,
            containerCss: {
              ...(isRollbackNext ? RollbackContainerCss : {})
            },
            skipCondition: nodeDataNext.skipInfo?.evaluatedCondition ? nodeDataNext.skipInfo.skipCondition : undefined,
            when: nodeDataNext.nodeRunInfo,
            status: nodeDataNext.status as ExecutionStatus,
            isOpen: true,
            ...getIconDataBasedOnType(nodeDataNext),
            items: processNodeData(
              nodeAdjacencyListMap?.[id].children || /* istanbul ignore next */ [],
              nodeMap,
              nodeAdjacencyListMap,
              rootNodes
            )
          }
        })
      } else {
        items.push({
          item: {
            name: nodeDataNext?.name || /* istanbul ignore next */ '',
            ...getIconDataBasedOnType(nodeDataNext),
            identifier: id,
            skipCondition: nodeDataNext?.skipInfo?.evaluatedCondition ? nodeDataNext.skipInfo.skipCondition : undefined,
            when: nodeDataNext?.nodeRunInfo,
            status: nodeDataNext?.status as ExecutionStatus,
            type: getExecutionPipelineNodeType(nodeDataNext?.stepType),
            data: nodeDataNext
          }
        })
      }
      const nextLevels = nodeAdjacencyListMap?.[id].nextIds
      if (nextLevels) {
        items.push(...processNodeData(nextLevels, nodeMap, nodeAdjacencyListMap, rootNodes))
      }
    })
  })
  return items
}

const hasOnlyLiteEngineTask = (children?: string[], graph?: ExecutionGraph): boolean => {
  return (
    !!children &&
    children.length === 1 &&
    graph?.nodeMap?.[children[0]]?.stepType === LITE_ENGINE_TASK &&
    graph?.nodeAdjacencyListMap?.[children[0]]?.nextIds?.length === 0
  )
}

export const processExecutionData = (graph?: ExecutionGraph): Array<ExecutionPipelineNode<ExecutionNode>> => {
  const items: Array<ExecutionPipelineNode<ExecutionNode>> = []

  /* istanbul ignore else */
  if (graph?.nodeAdjacencyListMap && graph?.rootNodeId) {
    const nodeAdjacencyListMap = graph.nodeAdjacencyListMap
    const rootNode = graph.rootNodeId
    // Ignore the graph when its fqn is pipeline, as this doesn't render pipeline graph
    if (graph?.nodeMap?.[rootNode].baseFqn === 'pipeline') {
      return items
    }
    let nodeId = nodeAdjacencyListMap[rootNode].children?.[0]
    while (nodeId && nodeAdjacencyListMap[nodeId]) {
      const nodeData = graph?.nodeMap?.[nodeId]
      /* istanbul ignore else */
      if (nodeData) {
        const isRollback = nodeData.name?.endsWith(StepGroupRollbackIdentifier) ?? false
        if (nodeData.stepType && (TopLevelNodes.indexOf(nodeData.stepType as NodeType) > -1 || isRollback)) {
          // NOTE: exception if we have only lite task engine in Execution group
          if (hasOnlyLiteEngineTask(nodeAdjacencyListMap[nodeId].children, graph)) {
            const liteTaskEngineId = nodeAdjacencyListMap?.[nodeId]?.children?.[0] || ''
            processLiteEngineTask(graph?.nodeMap?.[liteTaskEngineId], items, nodeData)
          } else if (!isEmpty(nodeAdjacencyListMap[nodeId].children)) {
            if (nodeData.identifier === 'execution') {
              items.push(
                ...processNodeData(
                  nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
                  graph?.nodeMap,
                  graph?.nodeAdjacencyListMap,
                  items
                )
              )
            } else {
              items.push({
                group: {
                  name: nodeData.name || /* istanbul ignore next */ '',
                  identifier: nodeId,
                  data: nodeData,
                  skipCondition: nodeData.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
                  when: nodeData.nodeRunInfo,
                  containerCss: {
                    ...(RollbackIdentifier === nodeData.identifier || isRollback ? RollbackContainerCss : {})
                  },
                  status: nodeData.status as ExecutionStatus,
                  isOpen: true,
                  ...getIconDataBasedOnType(nodeData),
                  items: processNodeData(
                    nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
                    graph?.nodeMap,
                    graph?.nodeAdjacencyListMap,
                    items
                  )
                }
              })
            }
          }
        } else if (nodeData.stepType === NodeType.FORK) {
          items.push({
            parallel: processNodeData(
              nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
              graph?.nodeMap,
              graph?.nodeAdjacencyListMap,
              items
            )
          })
        } else {
          items.push({
            item: {
              name: nodeData.name || /* istanbul ignore next */ '',
              skipCondition: nodeData.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
              when: nodeData.nodeRunInfo,
              ...getIconDataBasedOnType(nodeData),
              showInLabel: nodeData.stepType === NodeType.SERVICE || nodeData.stepType === NodeType.INFRASTRUCTURE,
              identifier: nodeId,
              status: nodeData.status as ExecutionStatus,
              type: getExecutionPipelineNodeType(nodeData?.stepType),
              data: nodeData
            }
          })
        }
      }
      nodeId = nodeAdjacencyListMap[nodeId].nextIds?.[0]
    }
  }
  return items
}

export function getStageType(node?: GraphLayoutNode): 'ci' | 'cd' | 'unknown' {
  if (node?.module?.toLowerCase?.() === 'ci' || !isEmpty(node?.moduleInfo?.ci)) {
    return 'ci'
  } else if (node?.module?.toLowerCase?.() === 'cd' || !isEmpty(node?.moduleInfo?.cd)) {
    return 'cd'
  }
  return 'unknown'
}

export function getExecutionPipelineNodeType(stepType?: string): ExecutionPipelineNodeType {
  if (stepType === StepType.Barrier || stepType === StepType.ResourceConstraint) {
    return ExecutionPipelineNodeType.ICON
  }
  if (isApprovalStep(stepType)) {
    return ExecutionPipelineNodeType.DIAMOND
  }

  return ExecutionPipelineNodeType.NORMAL
}

export function getIconDataBasedOnType(nodeData?: ExecutionNode): {
  icon: IconName
  iconSize: number
  iconStyle?: { marginBottom: string }
} {
  if (nodeData) {
    if (nodeData.stepType === StepType.Barrier) {
      return nodeData.status === 'Success'
        ? { icon: 'barrier-close', iconSize: 57 }
        : { icon: 'barrier-open', iconSize: 70, iconStyle: { marginBottom: '38px' } }
    }
    if (nodeData.stepType === StepType.ResourceConstraint) {
      return { icon: 'traffic-lights', iconSize: 40 }
    }
    const icon = StepTypeIconsMap[nodeData?.stepType as NodeType] || factory.getStepIcon(nodeData?.stepType || '')
    return {
      icon,
      iconSize: 20
    }
  }
  return {
    icon: 'cross',
    iconSize: 20
  }
}

/** Add dependency services to nodeMap */
export const addServiceDependenciesFromLiteTaskEngine = (
  nodeMap: { [key: string]: ExecutionNode },
  adjacencyMap?: { [key: string]: ExecutionNodeAdjacencyList }
): void => {
  const liteEngineTask = Object.values(nodeMap).find(item => item.stepType === LITE_ENGINE_TASK)
  if (liteEngineTask) {
    const parentNodeId =
      Object.entries(adjacencyMap || {}).find(([_, val]) => {
        return (val?.children?.indexOf(liteEngineTask.uuid!) ?? -1) >= 0
      })?.[0] || ''
    const parentNode: ExecutionNode | undefined = nodeMap[parentNodeId]

    // NOTE: liteEngineTask contains information about dependency services
    const serviceDependencyList: ExecutionNode[] =
      // Array check is required for legacy support
      (Array.isArray(liteEngineTask.outcomes)
        ? liteEngineTask.outcomes.find((_item: any) => !!_item.serviceDependencyList)?.serviceDependencyList
        : liteEngineTask.outcomes?.dependencies?.serviceDependencyList) || []

    // 1. add service dependencies to nodeMap
    serviceDependencyList.forEach(service => {
      if (service?.identifier) {
        service.stepType = 'dependency-service'
        service.executableResponses = [
          {
            task: {
              logKeys: (service as any).logKeys
            } as any
          }
        ]
        if (parentNode && isExecutionRunning(parentNode.status)) {
          // If execution is still running, we should be getting logs as stream, not blob
          service.status = ExecutionStatusEnum.Running
        }
        nodeMap[service.identifier] = service
      }
    })

    // 2. add Initialize (Initialize step is liteEngineTask step)
    // override step name
    if (liteEngineTask.uuid) {
      liteEngineTask.name = 'Initialize'
      nodeMap[liteEngineTask.uuid] = liteEngineTask
    }
  }
}
