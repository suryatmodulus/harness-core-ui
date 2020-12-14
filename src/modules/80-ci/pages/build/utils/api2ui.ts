import type { IconName } from '@blueprintjs/core'
import { first } from 'lodash-es'
import type { GraphVertex, OrchestrationGraphDTO } from 'services/ci'
import {
  ExecutionPipeline,
  ExecutionPipelineNode,
  ExecutionPipelineItem,
  ExecutionPipelineItemStatus,
  ExecutionPipelineNodeType
} from '@pipeline/exports'
import type { ExecutionPipelineGroupInfo } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { STATIC_SERVICE_GROUP_NAME } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import type { ItemData } from '../context/BuildPageContext'
import i18n from './api2ui.i18n'

// TODO: random icons used; replace them with right one
export enum MapStageTypeIconName {
  INTEGRATION_STAGE_STEP = 'integration',
  publishArtifacts = 'publish-step',
  plugin = 'plugin-step',
  run = 'run-step',
  buildAndPushGCR = 'gcr-step',
  buildAndPushECR = 'ecr-step',
  saveCacheGCS = 'save-cache-step',
  restoreCacheGCS = 'restore-cache-step',
  saveCacheS3 = 'save-cache-step',
  restoreCacheS3 = 'restore-cache-step',
  buildAndPushDockerHub = 'docker-hub-step',
  uploadToGCS = 'gcs-step',
  uploadToS3 = 'service-service-s3',
  uploadToArtifactory = 'service-artifactory'
}

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

export interface StatusCounter {
  success: number
  running: number
  failed: number
}

/**
 * Count success/running/failed stages
 */
export const getStagesStatusesCounter = (nodes: ExecutionPipelineNode<ItemData>[]): StatusCounter => {
  let statusCounter = {
    success: 0,
    running: 0,
    failed: 0
  }

  nodes.forEach(node => {
    statusCounter = node.parallel
      ? countStagesStatuses(node.parallel, statusCounter)
      : countStagesStatuses([node], statusCounter)
  })

  return statusCounter
}

const countStagesStatuses = (nodes: ExecutionPipelineNode<ItemData>[], counter: StatusCounter): StatusCounter => {
  const retCounter = { ...counter }
  nodes.forEach(node => {
    const statusType = getGeneralStatusType(node.item?.status)
    retCounter.success += statusType === 'SUCCESS' ? 1 : 0
    retCounter.failed += statusType === 'ERROR' ? 1 : 0
    retCounter.running += statusType === 'RUNNING' ? 1 : 0
  })

  return retCounter
}

const getGeneralStatusType = (
  status: ExecutionPipelineItemStatus | undefined
): 'SUCCESS' | 'ERROR' | 'RUNNING' | 'UNDEFINED' => {
  switch (status) {
    case ExecutionPipelineItemStatus.SUCCESS:
    case ExecutionPipelineItemStatus.SUCCEEDED:
      return 'SUCCESS'
    case ExecutionPipelineItemStatus.FAILED:
    case ExecutionPipelineItemStatus.ABORTED:
    case ExecutionPipelineItemStatus.ERROR:
    case ExecutionPipelineItemStatus.REJECTED:
      return 'ERROR'
    case ExecutionPipelineItemStatus.RUNNING:
    case ExecutionPipelineItemStatus.PAUSED:
    case ExecutionPipelineItemStatus.PAUSING:
    case ExecutionPipelineItemStatus.WAITING:
    case ExecutionPipelineItemStatus.ABORTING:
      return 'RUNNING'
  }

  return 'UNDEFINED'
}

/**
 * Get stage icon depend on stage type
 */
export function stageType2IconName(stageType: string): IconName {
  // TODO: random icons used; replace them with right one
  const defaultIconName = 'star'
  const iconName = MapStageTypeIconName[stageType as keyof typeof MapStageTypeIconName]

  return (iconName ? iconName : defaultIconName) as IconName
}

export function getDefaultSelectionFromExecutionPipeline<T>(pipeline: ExecutionPipeline<T>) {
  // TODO: iterate thoughts parallel stages

  return {
    defaultSelectedStageIdentifier: first(pipeline.items)?.item?.identifier || '-1',
    defaultSelectedStepIdentifier: first(first(pipeline.items)?.item?.pipeline?.items)?.item?.identifier || '-1'
  }
}

export function getFirstItemIdFromExecutionPipeline<T>(pipeline: ExecutionPipeline<T>): string {
  if (pipeline.items[0].parallel) {
    return pipeline.items[0].parallel[0].item?.identifier || '-1'
  } else {
    return pipeline.items[0].item?.identifier || '-1'
  }
}

/**
 * Return empty ExecutionPipeline
 */

export function getEmptyExecutionPipeline(): ExecutionPipeline<ItemData> {
  return { items: [], identifier: '' }
}

/**
 * Create ExecutionPipeline from Graph model (API2UI model)
 */
export function graph2ExecutionPipeline(graph: OrchestrationGraphDTO | undefined): ExecutionPipeline<ItemData> {
  const pipeline: ExecutionPipeline<ItemData> = {
    items: [],
    identifier: ''
  }

  // TODO: might be case that graph?.rootNodeIds contains ids for parallel stages
  const rootNodeId: string | undefined = first(graph?.rootNodeIds)
  if (!rootNodeId) {
    return pipeline
  }

  pipeline.identifier = rootNodeId

  const adjacencyMap = graph?.adjacencyList?.adjacencyMap || {}
  const graphVertexMap = graph?.adjacencyList?.graphVertexMap || {}

  // first level
  const rootEdgeList = adjacencyMap[rootNodeId]

  rootEdgeList?.edges?.forEach((edgeId: string) => {
    // second level
    const stagesRootEdgeList = adjacencyMap[edgeId]

    stagesRootEdgeList?.edges?.forEach((stageEdgeId: string) => {
      const vertex = graphVertexMap[stageEdgeId]

      const stageItem: ExecutionPipelineItem<ItemData> = {
        identifier: vertex.uuid as string,
        name: vertex.name as string,
        type: ExecutionPipelineNodeType.NORMAL,
        status: ExecutionPipelineItemStatus[vertex.status as keyof typeof ExecutionPipelineItemStatus],
        icon: stageType2IconName(vertex.stepType as string),
        data: { step: vertex }
      }

      // add stage node
      const stageNode: ExecutionPipelineNode<ItemData> = { item: stageItem }
      pipeline.items.push(stageNode)

      // add steps pipeline
      const stepsPipeline: ExecutionPipeline<ItemData> = {
        items: [],
        identifier: ''
      }

      // get first step
      const stepsRootId = first(adjacencyMap[stageEdgeId]?.edges) as string
      const nextId = first(adjacencyMap[stepsRootId]?.edges) as string
      let next = graphVertexMap[nextId]

      while (next) {
        if (next.stepType === 'LITE_ENGINE_TASK') {
          // NOTE: LITE_ENGINE_TASK contains information about dependencies
          const serviceDependencyList: ServiceDependency[] = (next.outcomes as any)?.find(
            (item: any) => !!item.serviceDependencyList
          )?.serviceDependencyList

          addDependencies(serviceDependencyList, stepsPipeline)
        } else {
          //parallel steps
          if (next.stepType === 'FORK') {
            const parallelStepsNode: ExecutionPipelineNode<ItemData> = {
              parallel: []
            }
            stepsPipeline.items.push(parallelStepsNode)

            // populate parallel steps
            const nextIds = adjacencyMap[next.uuid as string]?.edges as string[]
            nextIds.forEach(parallelId => {
              const parallelVertex = graphVertexMap[parallelId]
              addStepToArray(parallelVertex, parallelStepsNode.parallel as ExecutionPipelineNode<ItemData>[])
            })
          } else {
            addStepToArray(next, stepsPipeline.items)
          }
        }

        // set next
        const _nextId = first(adjacencyMap[next.uuid as string]?.nextIds) as string
        next = graphVertexMap[_nextId]
      }

      if (stageNode.item) {
        stageNode.item.pipeline = stepsPipeline
      }
    })
  })

  return pipeline
}

function addStepToArray(vertex: GraphVertex, arr: ExecutionPipelineNode<ItemData>[]): void {
  const stepItem: ExecutionPipelineItem<ItemData> = {
    identifier: vertex.identifier as string,
    name: vertex.name as string,
    type: ExecutionPipelineNodeType.NORMAL,
    status: ExecutionPipelineItemStatus[vertex.status as keyof typeof ExecutionPipelineItemStatus],
    icon: stageType2IconName(vertex?.stepParameters?.type as string),
    data: { step: vertex }
  }

  // add step node
  const stepNode: ExecutionPipelineNode<ItemData> = { item: stepItem }
  arr.push(stepNode)
}

function addServiceToArray(service: ServiceDependency, arr: ExecutionPipelineNode<ItemData>[]): void {
  const stepItem: ExecutionPipelineItem<ItemData> = {
    identifier: service.identifier as string,
    name: service.name as string,
    type: ExecutionPipelineNodeType.NORMAL,
    status: ExecutionPipelineItemStatus[service.status as keyof typeof ExecutionPipelineItemStatus],
    icon: 'dependency-step',
    data: { service: service }
  }

  // add step node
  const stepNode: ExecutionPipelineNode<ItemData> = { item: stepItem }
  arr.push(stepNode)
}

function addDependencies(dependencies: ServiceDependency[], stepsPipeline: ExecutionPipeline<ItemData>) {
  if (dependencies && dependencies.length > 0) {
    const items: ExecutionPipelineNode<ItemData>[] = []

    dependencies.forEach(_service => addServiceToArray(_service, items))

    const dependenciesGroup: ExecutionPipelineGroupInfo<ItemData> = {
      identifier: STATIC_SERVICE_GROUP_NAME,
      name: i18n.dependencies,
      status: '' as ExecutionPipelineItemStatus,
      data: {},
      icon: 'step-group',
      showLines: false,
      isOpen: true,
      items: [{ parallel: items }]
    }

    // dependency goes at the begining
    stepsPipeline.items.unshift({ group: dependenciesGroup })
  }
}
