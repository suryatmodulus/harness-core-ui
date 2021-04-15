import { delay } from 'lodash-es'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Color, IconName } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import {
  ExecutionPipelineItemStatus,
  ExecutionPipeline,
  ExecutionPipelineItem,
  ExecutionPipelineNode
} from './ExecutionPipelineModel'
import * as Diagram from '../Diagram'
import type { DefaultNodeModel } from '../Diagram'
import { ExecutionPipelineNodeType } from './ExecutionPipelineModel'
import css from './ExecutionStageDiagram.module.scss'

export const containGroup = <T>(nodes: Array<ExecutionPipelineNode<T>>): boolean => {
  let contain = false
  nodes.forEach(node => {
    if (node.group) contain = true
    else if (node.parallel) contain = contain || containGroup(node.parallel)
  })
  return contain
}

export const calculateDepth = <T>(
  node: ExecutionPipelineNode<T>,
  groupStatesMap: Map<string, GroupState<T>>,
  spaceAfterGroup: number,
  SPACE_AFTER_GROUP: number
): number => {
  const depth = 1
  let groupMaxDepth = 0
  if (node?.group) {
    const stepState = groupStatesMap.get(node.group.identifier)
    // collapsed group
    if (stepState?.collapsed) {
      return 1
    }
    // expanded group
    if (node.group.items?.length > 0) {
      groupMaxDepth = 0
      node.group.items.forEach(nodeG => {
        let depthInner = 0
        if (nodeG?.group) {
          // group
          depthInner = calculateDepth(nodeG, groupStatesMap, SPACE_AFTER_GROUP, SPACE_AFTER_GROUP) + SPACE_AFTER_GROUP
        } else if (nodeG?.parallel) {
          // parallel
          nodeG?.parallel.forEach(nodeP => {
            depthInner += calculateDepth(nodeP, groupStatesMap, SPACE_AFTER_GROUP, SPACE_AFTER_GROUP)
          })
          // NOTE: adjustment for parallel stage
          depthInner += nodeG?.parallel?.find(item => item.group) ? SPACE_AFTER_GROUP : 0
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

export const calculateGroupHeaderDepth = <T>(items: Array<ExecutionPipelineNode<T>>, HEADER_DEPTH: number): number => {
  let maxNum = 0

  items.forEach(node => {
    let num = 0
    if (node.group) {
      num = HEADER_DEPTH
      num += calculateGroupHeaderDepth(node.group.items, HEADER_DEPTH)
      maxNum = Math.max(maxNum, num)
    } else if (node.parallel && node.parallel[0]?.group) {
      num = HEADER_DEPTH
      num += calculateGroupHeaderDepth(node.parallel[0].group.items, HEADER_DEPTH)
      maxNum = Math.max(maxNum, num)
    }
  })

  return maxNum
}

export const getNodeStyles = (isSelected: boolean, status: ExecutionPipelineItemStatus): React.CSSProperties => {
  const style = {} as React.CSSProperties

  style.borderColor = 'var(--execution-pipeline-color-grey)'
  style.borderWidth = '2px'
  style.borderStyle = 'solid'

  /* istanbul ignore else */ if (status) {
    switch (status) {
      case ExecutionPipelineItemStatus.SUCCESS:
      case ExecutionPipelineItemStatus.SUCCEEDED:
        style.borderColor = 'var(--execution-pipeline-color-blue)'
        style.backgroundColor = isSelected ? 'var(--execution-pipeline-color-blue)' : 'var(--white)'
        break
      case ExecutionPipelineItemStatus.RUNNING:
        style.borderColor = 'var(--execution-pipeline-color-blue)'
        style.backgroundColor = isSelected ? 'var(--blue-600)' : 'var(--white)'
        break
      case ExecutionPipelineItemStatus.PAUSED:
      case ExecutionPipelineItemStatus.ROLLBACK:
        style.borderColor = 'var(--execution-pipeline-color-orange)'
        style.backgroundColor = isSelected ? 'var(--execution-pipeline-color-orange)' : 'var(--white)'
        break
      case ExecutionPipelineItemStatus.WAITING:
        style.backgroundColor = isSelected
          ? 'var(--execution-pipeline-color-blue)'
          : 'var(--execution-pipeline-color-orange)'
        break
      case ExecutionPipelineItemStatus.NOT_STARTED:
        style.borderColor = 'var(--execution-pipeline-color-dark-grey)'
        style.backgroundColor = 'var(--white)'
        break
      case ExecutionPipelineItemStatus.ABORTED:
        style.borderColor = 'var(--execution-pipeline-color-dark-grey2)'
        style.backgroundColor = isSelected ? 'var(--execution-pipeline-color-dark-grey2)' : 'var(--white)'
        break
      case ExecutionPipelineItemStatus.ERROR:
      case ExecutionPipelineItemStatus.FAILED:
        style.borderColor = 'var(--execution-pipeline-color-dark-red)'
        style.backgroundColor = isSelected ? 'var(--execution-pipeline-color-red)' : 'var(--white)'
        break
      default:
        break
    }
  }

  return style
}

export const getArrowsColor = (status: ExecutionPipelineItemStatus, isParallel = false, hideLines = false): string => {
  if (hideLines) {
    return 'var(--pipeline-transparent-border)'
  } else if (status === ExecutionPipelineItemStatus.NOT_STARTED) {
    return 'var(--execution-pipeline-color-arrow-not-started)'
  } else if (isParallel && status === ExecutionPipelineItemStatus.RUNNING) {
    return 'var(--execution-pipeline-color-arrow-not-started)'
  } else {
    return 'var(--execution-pipeline-color-arrow-complete)'
  }
}

export const getStatusProps = (
  status: ExecutionPipelineItemStatus,
  stepType: ExecutionPipelineNodeType
): {
  secondaryIcon?: IconName
  secondaryIconProps: Omit<IconProps, 'name'>
  secondaryIconStyle: React.CSSProperties
} => {
  const secondaryIconStyle: React.CSSProperties =
    stepType === ExecutionPipelineNodeType.DIAMOND ? {} : { top: -7, right: -7 }
  let secondaryIcon: IconName | undefined = undefined
  const secondaryIconProps: Omit<IconProps, 'name'> = { size: 16 }
  /* istanbul ignore else */ if (status) {
    switch (status) {
      case ExecutionPipelineItemStatus.FAILED:
      case ExecutionPipelineItemStatus.ERROR:
        secondaryIcon = 'execution-warning'
        secondaryIconProps.size = 20
        secondaryIconStyle.color = 'var(--execution-pipeline-color-dark-red)'
        secondaryIconStyle.animation = `${css.fadeIn} 1s`
        break
      case ExecutionPipelineItemStatus.WAITING:
        secondaryIcon = 'execution-warning'
        secondaryIconProps.size = 20
        secondaryIconStyle.color = 'var(--execution-pipeline-color-orange)'
        secondaryIconStyle.animation = `${css.fadeIn} 1s`
        break
      case ExecutionPipelineItemStatus.SUCCESS:
      case ExecutionPipelineItemStatus.SUCCEEDED:
        secondaryIcon = 'execution-success'
        secondaryIconProps.color = Color.GREEN_450
        secondaryIconStyle.animation = `${css.fadeIn} 1s`
        break
      case ExecutionPipelineItemStatus.RUNNING:
        secondaryIconProps.color = Color.WHITE
        break
      case ExecutionPipelineItemStatus.ABORTED:
      case ExecutionPipelineItemStatus.EXPIRED:
        secondaryIcon = 'execution-abort'
        secondaryIconStyle.animation = `${css.fadeIn} 1s`
        secondaryIconStyle.color = 'var(--execution-pipeline-color-dark-grey2)'
        break
      case ExecutionPipelineItemStatus.PAUSED:
      case ExecutionPipelineItemStatus.PAUSING:
        secondaryIcon = 'execution-input'
        secondaryIconStyle.animation = `${css.fadeIn} 1s`
        secondaryIconStyle.color = 'var(--execution-pipeline-color-orange)'
        break
      case ExecutionPipelineItemStatus.ROLLBACK:
        secondaryIcon = 'execution-rollback'
        secondaryIconProps.size = 20
        secondaryIconStyle.animation = `${css.fadeIn} 1s`
        secondaryIconStyle.color = 'var(--execution-pipeline-color-orange)'
        break
      default:
        break
    }
  }
  return { secondaryIconStyle, secondaryIcon: secondaryIcon, secondaryIconProps }
}

export const getIconStyleBasedOnStatus = (
  status: ExecutionPipelineItemStatus,
  isSelected: boolean
): React.CSSProperties => {
  let toReturn: React.CSSProperties = {}
  if (isSelected && status !== ExecutionPipelineItemStatus.NOT_STARTED) {
    toReturn = { color: 'var(--white)' }
  }
  if (status === ExecutionPipelineItemStatus.SKIPPED || status === ExecutionPipelineItemStatus.EXPIRED) {
    toReturn = { color: 'var(--grey-500)' }
  }
  return toReturn
}

export const getStageFromExecutionPipeline = <T>(
  data: ExecutionPipeline<T>,
  identifier = '-1'
): ExecutionPipelineItem<T> | undefined => {
  let stage: ExecutionPipelineItem<T> | undefined = undefined
  data.items?.forEach(node => {
    if (!stage) {
      if (node?.item?.identifier === identifier) {
        stage = node?.item
      } else if (node?.parallel) {
        stage = getStageFromExecutionPipeline({ items: node.parallel, identifier: '', allNodes: [] }, identifier)
      } else if (node?.group) {
        stage = getStageFromExecutionPipeline({ items: node.group.items, identifier: '', allNodes: [] }, identifier)
      }
    }
  })

  return stage
}

export interface GroupState<T> {
  data?: T
  collapsed: boolean
  name: string
  showInLabel: boolean
  status: ExecutionPipelineItemStatus
  identifier: string
}

export const getGroupsFromData = <T>(items: Array<ExecutionPipelineNode<T>>): Map<string, GroupState<T>> => {
  let groupState = new Map<string, GroupState<T>>()
  items.forEach(node => {
    if (node.parallel) {
      const itemsGroupState = getGroupsFromData(node.parallel)
      groupState = new Map([...groupState, ...itemsGroupState])
    } else if (node.group) {
      groupState.set(node.group.identifier, {
        collapsed: false,
        name: node.group.name,
        status: node.group.status,
        identifier: node.group.identifier,
        showInLabel: node.group.showInLabel ?? true,
        data: node.group.data
      })
      if (node.group.items.length > 0) {
        const itemsGroupState = getGroupsFromData(node.group.items)
        groupState = new Map([...groupState, ...itemsGroupState])
      }
    } else if (node.item?.showInLabel) {
      groupState.set(node.item.identifier, {
        collapsed: false,
        name: node.item.name,
        status: node.item.status,
        showInLabel: node.item.showInLabel,
        identifier: node.item.identifier,
        data: node.item.data
      })
    }
  })
  return groupState
}

export const moveStageToFocusDelayed = (
  engine: DiagramEngine,
  identifier: string,
  focusOnVisibility?: boolean,
  resetZoom?: boolean
): void => {
  delay(() => moveStageToFocus(engine, identifier, focusOnVisibility, resetZoom), 1)
}

export const moveStageToFocus = (
  engine: DiagramEngine,
  identifier: string,
  focusOnVisibility?: boolean,
  resetZoom?: boolean
): void => {
  const model = engine.getModel() as Diagram.DiagramModel
  const layer = model.getGroupLayer(identifier) || model.getNodeFromId(identifier)
  const canvas = engine.getCanvas()
  /* istanbul ignore else */ if (layer && canvas) {
    const rect = canvas.getBoundingClientRect()
    const zoom = engine.getModel().getZoomLevel()
    const s = (num: number) => num * (1 / (100 / zoom))
    const offsetX = engine.getModel().getOffsetX()
    const offsetY = engine.getModel().getOffsetY()
    let newOffsetX = engine.getModel().getOffsetX()
    let newOffsetY = engine.getModel().getOffsetY()

    const node = (engine.getModel() as Diagram.DiagramModel).getNodeFromId(identifier)

    if (focusOnVisibility && node && rect.width < offsetX + s(node.getPosition().x) + s(node.width) + s(40)) {
      newOffsetX = (rect.width - s(node.width)) * 0.8 - s(node.getPosition().x)
    } else if (!focusOnVisibility) {
      if (layer instanceof Diagram.StepGroupNodeLayerModel) {
        newOffsetX = rect.width * 0.2 - s(layer.startNode.getPosition().x)
      } else {
        newOffsetX = rect.width * 0.2 - s(layer.getPosition().x)
      }
    }

    if (node && rect.height < offsetY + s(node.getPosition().y) + s(node.height) + s(40)) {
      newOffsetY = (rect.height - s(node.height)) * 0.7 - s(node.getPosition().y)
    }

    engine.getModel().setOffset(newOffsetX, newOffsetY)
    engine.getModel().setZoomLevel(resetZoom ? 100 : zoom)
    engine.repaintCanvas()
  }
}

export const getStageFromDiagramEvent = <T>(
  event: Diagram.DefaultNodeEvent,
  data: ExecutionPipeline<T>
): ExecutionPipelineItem<T> | undefined => {
  const entity = event.entity as DefaultNodeModel
  const id = entity.getOptions().identifier
  const stage = getStageFromExecutionPipeline(data, id)
  return stage
}

export const getRunningNode = <T>(data: ExecutionPipeline<T>): ExecutionPipelineItem<T> | undefined => {
  let stage: ExecutionPipelineItem<T> | undefined = undefined
  data.items?.forEach(node => {
    if (!stage) {
      if (node?.item?.status === 'Running') {
        stage = node?.item
      } else if (node?.parallel) {
        stage = getRunningNode({ items: node.parallel, identifier: '', allNodes: [] })
      } else if (node?.group) {
        stage = getRunningNode({ items: node.group.items, identifier: '', allNodes: [] })
      }
    }
  })
  return stage
}

export const focusRunningNode = <T>(engine: DiagramEngine, data: ExecutionPipeline<T>): void => {
  const runningStage = getRunningNode(data)
  /* istanbul ignore else */ if (runningStage) {
    const node = (engine.getModel() as Diagram.DiagramModel).getNodeFromId(runningStage.identifier)
    const canvas = engine.getCanvas()
    if (canvas && node) {
      const rect = canvas.getBoundingClientRect()
      const nodePosition = node.getPosition()
      const nodeWidth = node.width
      /* istanbul ignore else */ if (rect.width < nodePosition.x + nodeWidth + 40) {
        const newOffsetX = (rect.width - node.width) * 0.8 - nodePosition.x
        const offsetY = engine.getModel().getOffsetY()
        engine.getModel().setOffset(newOffsetX, offsetY)
        engine.getModel().setZoomLevel(100)
        engine.repaintCanvas()
      }
    }
  }
}

export const getTertiaryIconProps = <T>(stage: ExecutionPipelineItem<T>): { tertiaryIcon?: IconName } => {
  const tertiaryIconProps: { tertiaryIcon?: IconName } = {}
  if (stage?.barrierFound) {
    tertiaryIconProps.tertiaryIcon = 'barrier-open-with-links'
  }
  return tertiaryIconProps
}
