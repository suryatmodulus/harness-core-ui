import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener, BaseModel } from '@projectstorm/react-canvas-core'
import { v4 as nameSpace, v5 as uuid, version } from 'uuid'
import type { ExecutionWrapper, ExecutionElement } from 'services/cd-ng'
import { IconNodeModel } from '@pipeline/components/Diagram/node/IconNode/IconNodeModel'
import { EmptyNodeSeparator } from '../StageBuilder/StageBuilderUtil'
import {
  CreateNewModel,
  DefaultLinkModel,
  DefaultNodeModel,
  StepGroupNodeLayerModel,
  StepGroupNodeLayerOptions,
  StepsType,
  DiamondNodeModel
} from '../../Diagram'

// TODO: have to be auto generated from swagger/API
export interface DependenciesWrapper {
  [key: string]: any
}

export interface ExecutionGraphState {
  isRollback: boolean
  states: StepStateMap
  stepsData: Required<ExecutionElement>
  dependenciesData: Required<DependenciesWrapper[]>
}

export type ExecutionParallelWrapper = ExecutionWrapper & {
  parallel: ExecutionWrapper[]
}

export interface Listeners {
  nodeListeners: NodeModelListener
  linkListeners: LinkModelListener
  layerListeners: BaseModelListener
}

export const generateRandomString = (name: string): string => uuid(name, nameSpace())

export const isCustomGeneratedString = (name: string): boolean => {
  try {
    return version(name) === 5
  } catch (_e) {
    return false
  }
}

export enum StepType {
  STEP = 'STEP',
  STEP_GROUP = 'STEP_GROUP',
  SERVICE = 'SERVICE',
  SERVICE_GROUP = 'SERVICE_GROUP'
}
export interface StepState {
  stepType: StepType
  isRollback?: boolean
  isStepGroupRollback?: boolean
  isStepGroupCollapsed?: boolean
  isStepGroup?: boolean
  isSaved: boolean
  inheritedSG?: number
}

export const getDefaultStepGroupState = (): StepState => ({
  isSaved: false,
  isStepGroupCollapsed: false,
  isStepGroupRollback: false,
  isStepGroup: true,
  isRollback: false,
  stepType: StepType.STEP_GROUP
})

export const getDefaultStepState = (): StepState => ({ isSaved: false, isStepGroup: false, stepType: StepType.STEP })

export const getDefaultDependencyServiceState = (): StepState => ({
  isSaved: false,
  isStepGroup: false,
  stepType: StepType.SERVICE
})

export type StepStateMap = Map<string, StepState>

export const calculateDepthPS = (
  node: ExecutionWrapper,
  stepStates: StepStateMap,
  spaceAfterGroup: number,
  SPACE_AFTER_GROUP: number
): number => {
  const depth = 1
  let groupMaxDepth = 0
  if (node.stepGroup) {
    const stepState = stepStates.get(node.stepGroup.identifier)
    // collapsed group
    if (stepState && stepState.isStepGroupCollapsed) {
      return 1
    }
    // expanded group
    if (node.stepGroup.steps?.length > 0) {
      groupMaxDepth = 0
      node.stepGroup.steps.forEach((nodeG: ExecutionWrapper) => {
        let depthInner = 0
        if (nodeG?.parallel) {
          // parallel
          nodeG?.parallel.forEach((nodeP: ExecutionWrapper) => {
            depthInner += calculateDepthPS(nodeP, stepStates, SPACE_AFTER_GROUP, SPACE_AFTER_GROUP)
          })
        } else {
          // step
          depthInner = 1
        }
        groupMaxDepth = Math.max(groupMaxDepth, depthInner)
      })
    }
    groupMaxDepth += spaceAfterGroup
  }

  return Math.max(groupMaxDepth, depth)
}

export const getDependencyFromNode = (
  servicesData: Required<DependenciesWrapper[]> | undefined,
  node: DefaultNodeModel
): { node: DependenciesWrapper | undefined; parent: DependenciesWrapper[] } => {
  const _service = servicesData?.find((service: DependenciesWrapper) => node.getIdentifier() === service.identifier)
  return { node: _service, parent: servicesData as DependenciesWrapper[] }
}

export const getStepFromNode = (
  stepData: Required<ExecutionElement> | undefined,
  node: DefaultNodeModel,
  isComplete = false,
  isFindParallelNode = false
): { node: ExecutionWrapper | undefined; parent: ExecutionWrapper[] } => {
  let data = stepData
  const layer = node.getParent()
  if (layer instanceof StepGroupNodeLayerModel) {
    const group = getStepFromId(data, layer.getIdentifier() || '', false).node
    if (group) {
      data = group as Required<ExecutionElement>
    }
  }
  return getStepFromId(data, node.getIdentifier(), isComplete, isFindParallelNode)
}

const getStepFromId = (
  stageData: Required<ExecutionElement> | undefined,
  id: string,
  isComplete = false,
  isFindParallelNode = false
): {
  node: ExecutionWrapper | undefined
  parent: ExecutionWrapper[]
  parallelParent?: ExecutionWrapper
  parallelParentIdx?: number
  parallelParentParent?: ExecutionWrapper[]
} => {
  let returnObj = getStepFromIdInternal(stageData?.steps, id, isComplete, isFindParallelNode)
  if (!returnObj.node) {
    returnObj = getStepFromIdInternal(stageData?.rollbackSteps, id, isComplete, isFindParallelNode)
  }
  return returnObj
}

const getStepFromIdInternal = (
  stepData: ExecutionWrapper[] | undefined,
  id: string,
  isComplete = false,
  isFindParallelNode = false,
  _parallelParent: ExecutionWrapper | undefined = undefined,
  _parallelParentIdx: number | undefined = undefined,
  _parallelParentParent: ExecutionWrapper[] | undefined = undefined
): {
  node: ExecutionWrapper | undefined
  parent: ExecutionWrapper[]
  parallelParent?: ExecutionWrapper
  parallelParentIdx?: number
  parallelParentParent?: ExecutionWrapper[]
} => {
  let stepResp: ExecutionWrapper | undefined = undefined
  let parent: ExecutionWrapper[] | ExecutionParallelWrapper = []
  let parallelParent: ExecutionWrapper | undefined = undefined
  let parallelParentIdx: number | undefined
  let parallelParentParent: ExecutionWrapper[] | undefined = undefined
  stepData?.every((node, idx) => {
    if (node.step && node.step.identifier === id) {
      if (isComplete) {
        stepResp = node
      } else {
        stepResp = node.step
      }
      parallelParent = _parallelParent
      parallelParentParent = _parallelParentParent
      parallelParentIdx = _parallelParentIdx
      parent = stepData
      return false
    } else if (node.parallel) {
      if (isFindParallelNode) {
        node.parallel?.every((nodeP: ExecutionWrapper) => {
          if (nodeP.step && nodeP.step.identifier === id) {
            if (isComplete) {
              stepResp = node
            } else {
              stepResp = node.parallel
            }
            parent = stepData
            return false
          } else if (nodeP.stepGroup) {
            if (nodeP.stepGroup?.identifier === id) {
              if (isComplete) {
                stepResp = node
              } else {
                stepResp = node.parallel
              }
              parent = stepData
              return false
            } else {
              const response = getStepFromId(nodeP.stepGroup, id, isComplete, isFindParallelNode)
              if (response.node) {
                parent = response.parent
                stepResp = response.node
                return false
              }
            }
          }
          return true
        })
        if (stepResp) {
          return false
        }
      } else {
        const response = getStepFromIdInternal(node.parallel, id, isComplete, false, node, idx, stepData)
        if (response.node) {
          stepResp = response.node
          parent = response.parent
          parallelParent = response.parallelParent
          parallelParentIdx = response.parallelParentIdx
          parallelParentParent = response.parallelParentParent
          return false
        }
      }
    } else if (node.stepGroup) {
      if (node.stepGroup?.identifier === id) {
        if (isComplete) {
          stepResp = node
        } else {
          stepResp = node.stepGroup
        }
        parent = stepData
        return false
      } else {
        const response = getStepFromId(node.stepGroup, id, isComplete, isFindParallelNode)
        if (response.node) {
          parent = response.parent
          stepResp = response.node
          return false
        }
      }
    }
    return true
  })
  return { parent, node: stepResp, parallelParent, parallelParentIdx, parallelParentParent }
}

// identifier for Dependencies/Services group that is always present
export const STATIC_SERVICE_GROUP_NAME = 'static_service_group'

export const getDependenciesState = (services: DependenciesWrapper[], mapState: StepStateMap): void => {
  // we have one service group
  mapState.set(STATIC_SERVICE_GROUP_NAME, {
    isSaved: false,
    isStepGroupCollapsed: false,
    isStepGroupRollback: false,
    isStepGroup: true,
    isRollback: false,
    stepType: StepType.SERVICE_GROUP
  })

  services.forEach((service: DependenciesWrapper) => {
    mapState.set(service.identifier, getDefaultDependencyServiceState())
  })
}

export const updateDependenciesState = (services: DependenciesWrapper[], mapState: StepStateMap): void => {
  // we have one service group
  const serviceGroupData = mapState.get(STATIC_SERVICE_GROUP_NAME)
  if (serviceGroupData) {
    mapState.set(STATIC_SERVICE_GROUP_NAME, {
      ...serviceGroupData,
      isSaved: true
    })
  }
  services.forEach((service: DependenciesWrapper) => {
    const serviceData = mapState.get(service.identifier)
    if (serviceData) {
      mapState.set(service.identifier, { ...serviceData, isSaved: true })
    }
  })
}
export const getStepsState = (node: ExecutionWrapper, mapState: StepStateMap): void => {
  if (node.step) {
    mapState.set(node.step.identifier, getDefaultStepState())
  } else if (node.steps) {
    node.steps.forEach((step: ExecutionWrapper) => {
      getStepsState(step, mapState)
    })
    if (node.rollbackSteps) {
      node.rollbackSteps.forEach((step: ExecutionWrapper) => {
        getStepsState(step, mapState)
      })
    }
  } else if (node.rollbackSteps) {
    node.rollbackSteps.forEach((step: ExecutionWrapper) => {
      getStepsState(step, mapState)
    })
  } else if (node.parallel) {
    node.parallel.forEach((step: ExecutionWrapper) => {
      getStepsState(step, mapState)
    })
  } else if (node.stepGroup) {
    node.stepGroup.steps?.forEach?.((step: ExecutionWrapper) => {
      getStepsState(step, mapState)
    })
    node.stepGroup.rollbackSteps?.forEach?.((step: ExecutionWrapper) => {
      getStepsState(step, mapState)
    })
    mapState.set(node.stepGroup.identifier, mapState.get(node.stepGroup.identifier) || getDefaultStepGroupState())
  }
}
export const updateStepsState = (node: ExecutionWrapper, mapState: StepStateMap): void => {
  if (node.step && mapState.get(node.step.identifier)) {
    const data = mapState.get(node.step.identifier)
    if (data) {
      mapState.set(node.step.identifier, { ...data, isSaved: true })
    }
  } else if (node.steps) {
    node.steps.forEach((step: ExecutionWrapper) => {
      updateStepsState(step, mapState)
    })
    if (node.rollbackSteps) {
      node.rollbackSteps.forEach((step: ExecutionWrapper) => {
        updateStepsState(step, mapState)
      })
    }
  } else if (node.rollbackSteps) {
    node.rollbackSteps.forEach((step: ExecutionWrapper) => {
      updateStepsState(step, mapState)
    })
  } else if (node.parallel) {
    node.parallel.forEach((step: ExecutionWrapper) => {
      updateStepsState(step, mapState)
    })
  } else if (node.stepGroup) {
    node.stepGroup.steps?.forEach?.((step: ExecutionWrapper) => {
      updateStepsState(step, mapState)
    })
    node.stepGroup.rollbackSteps?.forEach?.((step: ExecutionWrapper) => {
      updateStepsState(step, mapState)
    })
    const groupData = mapState.get(node.stepGroup.identifier)
    if (groupData) {
      mapState.set(node.stepGroup.identifier, { ...groupData, isSaved: true })
    }
  }
}

export const removeStepOrGroup = (state: ExecutionGraphState, entity: DefaultNodeModel): boolean => {
  // 1. services
  const servicesData = state.dependenciesData
  if (servicesData) {
    let idx
    servicesData.forEach((service, _idx) => {
      if (service.identifier === entity.getOptions().identifier) {
        idx = _idx
      }
    })
    if (idx !== undefined) {
      servicesData.splice(idx, 1)
      return true
    }
  }

  // 2. steps
  let isRemoved = false
  let data = state.stepsData
  const layer = entity.getParent()
  if (layer instanceof StepGroupNodeLayerModel) {
    const node = getStepFromId(data, layer.getIdentifier() || '', false).node
    if (node) {
      data = node as Required<ExecutionElement>
    }
  }
  const response = getStepFromId(data, entity.getIdentifier(), true)
  if (response.node) {
    const index = response.parent.indexOf(response.node)
    if (index > -1) {
      response.parent.splice(index, 1)
      // NOTE: if there is one item in parallel array, we are removing parallel array
      if (response.parallelParent && response.parallelParent.parallel.length === 1) {
        const stepToReAttach = response.parallelParent.parallel[0]
        // reattach step
        if (response.parallelParentParent && response.parallelParentIdx !== undefined) {
          response.parallelParentParent[response.parallelParentIdx] = stepToReAttach
        }
      }
      isRemoved = true
    }
  }
  return isRemoved
}

export const isLinkUnderStepGroup = (link: DefaultLinkModel): boolean => {
  const sourceNode = link.getSourcePort().getNode() as DefaultNodeModel
  const targetNode = link.getTargetPort().getNode() as DefaultNodeModel
  if (
    sourceNode.getParent() instanceof StepGroupNodeLayerModel &&
    targetNode.getParent() instanceof StepGroupNodeLayerModel &&
    sourceNode.getParent() === targetNode.getParent()
  ) {
    return true
  }
  return false
}

export const addService = (data: Required<ExecutionWrapper[]>, service: ExecutionWrapper): void => {
  data.push(service)
}

export const addStepOrGroup = (
  entity: BaseModel,
  data: Required<ExecutionElement>,
  step: ExecutionWrapper,
  isParallel: boolean,
  isRollback: boolean
): void => {
  if (entity instanceof DefaultLinkModel) {
    const sourceNode = entity.getSourcePort().getNode() as DefaultNodeModel
    const targetNode = entity.getTargetPort().getNode() as DefaultNodeModel
    if (isLinkUnderStepGroup(entity)) {
      const layer = sourceNode.getParent()
      if (layer instanceof StepGroupNodeLayerModel) {
        const node = getStepFromId(data, layer.getIdentifier() || '', false).node
        if (node) {
          data = node as Required<ExecutionElement>
        }
      }
    }
    let response = getStepFromId(data, sourceNode.getIdentifier(), true)
    let next = 1
    if (!response.node) {
      response = getStepFromId(data, targetNode.getIdentifier(), true)
      next = 0
    }
    if (response.node) {
      const index = response.parent.indexOf(response.node)
      if (index > -1) {
        response.parent.splice(index + next, 0, step)
      }
    } else {
      // parallel next parallel case
      let nodeId = sourceNode.getIdentifier().split(EmptyNodeSeparator)[1]
      response = getStepFromId(data, nodeId, true, true)
      next = 1
      if (!response.node) {
        nodeId = targetNode.getIdentifier().split(EmptyNodeSeparator)[2]
        response = getStepFromId(data, nodeId, true, true)
        next = 0
      }
      if (response.node) {
        const index = response.parent.indexOf(response.node)
        if (index > -1) {
          response.parent.splice(index + next, 0, step)
        }
      }
    }
  } else if (entity instanceof CreateNewModel) {
    // Steps if you are under step group
    const groupId = entity.getIdentifier().split(EmptyNodeSeparator)[1]
    const node = getStepFromId(data, groupId).node
    const layer = entity.getParent()
    if (layer instanceof StepGroupNodeLayerModel) {
      const options = layer.getOptions() as StepGroupNodeLayerOptions
      const isRollbackGroup = options.rollBackProps?.active === StepsType.Rollback
      if (!isRollbackGroup && node?.steps) {
        node.steps.push(step)
      } else if (isRollbackGroup && node?.rollbackSteps) {
        node.rollbackSteps.push(step)
      }
    } else {
      if (isRollback) {
        data.rollbackSteps.push(step)
      } else {
        data.steps.push(step)
      }
    }
  } else if (entity instanceof DefaultNodeModel) {
    if (isParallel) {
      const response = getStepFromId(data, entity.getIdentifier(), true, true)
      if (response.node) {
        if (response.node.parallel && response.node.parallel.length > 0) {
          response.node.parallel.push(step)
        } else {
          const index = response.parent.indexOf(response.node)
          if (index > -1) {
            response.parent.splice(index, 1, { parallel: [response.node, step] })
          }
        }
      }
    } else {
      if (isRollback) {
        data.rollbackSteps.push(step)
      } else {
        data.steps.push(step)
      }
    }
  } else if (entity instanceof StepGroupNodeLayerModel) {
    if (isParallel) {
      const response = getStepFromId(data, entity.getIdentifier() || '', true, true)
      if (response.node) {
        if (response.node.parallel && response.node.parallel.length > 0) {
          response.node.parallel.push(step)
        } else {
          const index = response.parent.indexOf(response.node)
          if (index > -1) {
            response.parent.splice(index, 1, { parallel: [response.node, step] })
          }
        }
      }
    }
  }
}

export const StepToNodeModelDataMap: { [key: string]: { model: any; defaultProps: {} } } = {
  APPROVAL: {
    model: DiamondNodeModel,
    defaultProps: {
      icon: 'command-approval'
    }
  },
  Barrier: {
    model: IconNodeModel,
    defaultProps: {
      icon: 'barrier-open'
    }
  },
  ResourceConstraint: {
    model: IconNodeModel,
    defaultProps: {
      icon: 'traffic-lights'
    }
  },
  Default: {
    model: DefaultNodeModel,
    defaultProps: {}
  }
}

export const getModelByStepType = (type: string, props: any) => {
  let StepModel = StepToNodeModelDataMap[type]?.model
  let defaultProps = StepToNodeModelDataMap[type]?.defaultProps
  if (!StepModel) {
    StepModel = StepToNodeModelDataMap['Default'].model
    defaultProps = StepToNodeModelDataMap['Default'].defaultProps
    return new StepModel({ ...props, ...defaultProps, allowAdd: true })
  }
  return new StepModel({ ...props, ...defaultProps })
}
