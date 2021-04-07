import { flatMap, findIndex } from 'lodash-es'
import { Color } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import type { NodeModelListener, LinkModelListener, DiagramEngine } from '@projectstorm/react-diagrams-core'
import type { StageElementWrapper, NgPipeline, PageConnectorResponse } from 'services/cd-ng'
import type { Diagram } from '@pipeline/exports'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { EmptyStageName } from '../PipelineConstants'
import type { PipelineContextInterface, StagesMap } from '../PipelineContext/PipelineContext'
import type { StageTypes } from '../Stages/StageTypes'

export interface StageState {
  isConfigured: boolean
  stage: StageElementWrapper
}

export interface PopoverData {
  data?: StageElementWrapper
  isStageView: boolean
  groupStages?: StageElementWrapper[]
  isGroupStage?: boolean
  stagesMap: StagesMap
  groupSelectedStageId?: string
  isParallel?: boolean
  event?: Diagram.DefaultNodeEvent
  addStage?: (
    newStage: StageElementWrapper,
    isParallel?: boolean,
    event?: Diagram.DefaultNodeEvent,
    insertAt?: number,
    openSetupAfterAdd?: boolean
  ) => void
  onSubmitPrimaryData?: (values: StageElementWrapper, identifier: string) => void
  onClickGroupStage?: (stageId: string, type: StageTypes) => void
  renderPipelineStage: PipelineContextInterface['renderPipelineStage']
}

export const getStageIndexByIdentifier = (pipeline: NgPipeline, identifier: string) => {
  const stageDetails = { stageIndex: -1, parallelStageIndex: -1 }
  if (pipeline?.stages) {
    for (const [index, stage] of pipeline.stages.entries()) {
      if (stage?.stage?.identifier === identifier) {
        stageDetails.stageIndex = index
        break
      }
      if (stage?.parallel) {
        const targetStageIndex = stage.parallel.findIndex((pstage: any) => pstage.stage.identifier === identifier)
        if (targetStageIndex > -1) {
          stageDetails.stageIndex = index
          stageDetails.parallelStageIndex = targetStageIndex
          break
        }
      }
    }
  }
  return stageDetails
}

export const getNewStageFromType = (type: string, clearDefaultValues = false): StageElementWrapper => {
  // TODO: replace string with type
  if (type === 'ci') {
    return {
      stage: {
        name: clearDefaultValues ? '' : EmptyStageName,
        identifier: clearDefaultValues ? '' : uuid(),
        description: '',
        type: type,
        spec: {
          serviceDependencies: [],
          execution: {}
        }
      }
    }
  }

  return {
    stage: {
      name: clearDefaultValues ? '' : EmptyStageName,
      identifier: clearDefaultValues ? '' : uuid(),
      description: '',
      type: type,
      spec: {}
    }
  }
}

export interface Listeners {
  nodeListeners: NodeModelListener
  linkListeners: LinkModelListener
}

export const EmptyNodeSeparator = '$node$'

export const getCommonStyles = (isSelected: boolean): React.CSSProperties => ({
  background: isSelected ? 'var(--pipeline-selected-node)' : 'var(--white)',
  borderColor: isSelected ? 'var(--diagram-selected)' : 'var(--pipeline-grey-border)',
  borderWidth: isSelected ? '2px' : '1px'
})

export const getStatus = (
  connectorRef: string,
  fetchedConnectorResponse: PageConnectorResponse | undefined,
  accountId: string
): { status?: string; color: string } => {
  if (!connectorRef || !fetchedConnectorResponse) {
    return { status: '', color: '' }
  }

  const connectorScope = getScopeFromValue(connectorRef)
  const connector = getIdentifierFromValue(connectorRef)
  const filteredConnector = fetchedConnectorResponse?.content?.find(item => item.connector?.identifier === connector)
  const scope = getScopeFromDTO({
    accountIdentifier: accountId,
    orgIdentifier: filteredConnector?.connector?.orgIdentifier,
    projectIdentifier: filteredConnector?.connector?.projectIdentifier
  })

  const status = scope === connectorScope ? filteredConnector?.status?.status : ''
  const color = status && status === 'FAILURE' ? Color.RED_500 : status ? Color.GREEN_500 : ''
  return { status, color }
}

export const getStageIndexFromPipeline = (data: StageElementWrapper, identifier: string): { index: number } => {
  let _index = 0

  const { stages } = getFlattenedStages(data)

  _index = findIndex(stages, o => o.stage.identifier === identifier)
  return { index: _index }
}

export const getFlattenedStages = (
  data: StageElementWrapper
): {
  stages: StageElementWrapper[]
} => {
  let stages = []
  stages = flatMap(data.stages, (n: StageElementWrapper) => {
    const k = []
    if (n.parallel) {
      k.push(...n['parallel'])
    } else {
      k.push(n)
    }
    return k
  })
  return { stages }
}

export const removeNodeFromPipeline = (
  nodeResponse: { stage?: StageElementWrapper; parent?: StageElementWrapper },
  data: NgPipeline | StageElementWrapper,
  stageMap: Map<string, StageState>,
  updateStateMap = true
): boolean => {
  const { stage: node, parent } = nodeResponse
  if (node && data.stages) {
    const index = data.stages.indexOf(node)
    if (index > -1) {
      data?.stages?.splice(index, 1)
      if (updateStateMap) {
        stageMap.delete(node.stage.identifier)

        data.stages?.map((currentStage: StageState) => {
          if (currentStage.stage?.spec?.serviceConfig?.useFromStage?.stage === node?.stage?.identifier) {
            currentStage.stage.spec.serviceConfig = {}
          }
        })
      }
      return true
    } else if (parent?.parallel) {
      const parallelIndex = parent.parallel?.indexOf(node)
      if (parallelIndex > -1) {
        parent.parallel.splice(parallelIndex, 1)
        if (parent.parallel.length === 0) {
          const emptyParallel = data?.stages?.indexOf(parent)
          if (emptyParallel !== undefined && emptyParallel > -1) {
            data?.stages?.splice(emptyParallel, 1)
          }
        } else if (parent.parallel.length === 1) {
          const oneStageParallel = data?.stages?.indexOf(parent)
          if (oneStageParallel !== undefined && oneStageParallel > -1) {
            data?.stages?.splice(oneStageParallel, 1, parent.parallel[0])
          }
        }
        updateStateMap && stageMap.delete(node.stage.identifier)
        return true
      }
    }
  }
  return false
}
export const getDependantStages = (pipeline: NgPipeline | StageElementWrapper, node: StageElementWrapper): string[] => {
  const dependantStages: string[] = []
  pipeline.stages?.map((currentStage: StageState) => {
    if (currentStage.stage?.spec?.serviceConfig?.useFromStage?.stage === node?.stage?.identifier) {
      dependantStages.push(currentStage.stage.name)
    }
  })
  return dependantStages
}
export const resetDiagram = (engine: DiagramEngine): void => {
  engine.getModel().setZoomLevel(100)
  engine.getModel().setOffset(0, 0)
  engine.repaintCanvas()
}

export const isDuplicateStageId = (id: string, stages: StageElementWrapper[]): boolean => {
  return getFlattenedStages({ stages }).stages?.some(({ stage }) => stage.identifier === id)
}
