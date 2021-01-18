import type { LinkModelListener, NodeModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import cx from 'classnames'
import { last, isEmpty } from 'lodash-es'
import {
  ExecutionPipeline,
  ExecutionPipelineItemStatus,
  ExecutionPipelineNode,
  ExecutionPipelineNodeType
} from './ExecutionPipelineModel'
import {
  getNodeStyles,
  getStatusProps,
  getArrowsColor,
  GroupState,
  calculateDepthCount
} from './ExecutionStageDiagramUtils'
import * as Diagram from '../Diagram'
import css from './ExecutionStageDiagram.module.scss'

export interface NodeStyleInterface {
  width: number
  height: number
}

export interface GridStyleInterface {
  gridSize?: number
  startX?: number
  startY?: number
  gap?: number
}

export interface Listeners {
  nodeListeners: NodeModelListener
  linkListeners: LinkModelListener
  layerListeners: BaseModelListener
}

export const EmptyNodeSeparator = '$node$'

export class ExecutionStageDiagramModel extends Diagram.DiagramModel {
  nodeStyle: NodeStyleInterface = { width: 200, height: 200 }

  constructor() {
    super({
      gridSize: 100,
      startX: 70,
      startY: 50,
      gap: 200
    })
  }

  setGridStyle(style: GridStyleInterface): void {
    Object.assign(this, style)
  }

  setDefaultNodeStyle(style: NodeStyleInterface): void {
    this.nodeStyle = style
  }

  renderGraphNodes<T>(
    node: ExecutionPipelineNode<T>,
    startX: number,
    startY: number,
    selectedStageId?: string,
    diagramContainerHeight?: number,
    prevNodes?: Diagram.DefaultNodeModel[],
    showEndNode?: boolean,
    groupStage?: Map<string, GroupState<T>>,
    verticalStepGroup = false
  ): { startX: number; startY: number; prevNodes?: Diagram.DefaultNodeModel[] } {
    const { nodeStyle } = this
    if (!node) {
      return { startX, startY, prevNodes: [] }
    }
    if (node.item && !node.parallel) {
      const { item: stage } = node
      const { type } = stage
      startX += this.gap
      const isSelected = selectedStageId === stage.identifier
      const statusProps = getStatusProps(stage.status)
      let nodeRender = this.getNodeFromId(stage.identifier)
      const commonOption: Diagram.DiamondNodeModelOptions = {
        customNodeStyle: getNodeStyles(isSelected, stage.status),
        canDelete: false,
        ...statusProps,
        nodeClassName: cx(
          { [css.runningNode]: stage.status === ExecutionPipelineItemStatus.RUNNING },
          { [css.selected]: stage.status === ExecutionPipelineItemStatus.RUNNING && isSelected }
        ),
        width: nodeStyle.width,
        height: nodeStyle.height,
        iconStyle: {
          color: isSelected && stage.status !== ExecutionPipelineItemStatus.NOT_STARTED ? 'var(--white)' : undefined
        },
        icon: stage.icon,
        skipCondition: stage?.skipCondition,
        status: stage.status
      }

      if (!nodeRender) {
        nodeRender =
          type === ExecutionPipelineNodeType.DIAMOND
            ? /* istanbul ignore next */ new Diagram.DiamondNodeModel({
                identifier: stage.identifier,
                id: stage.identifier,
                ...commonOption,
                customNodeStyle: {
                  // Without this doesn't look straight
                  marginTop: '2.5px',
                  ...commonOption.customNodeStyle
                },
                name: stage.name
              })
            : new Diagram.DefaultNodeModel({
                identifier: stage.identifier,
                id: stage.identifier,
                name: stage.name,
                ...commonOption,
                showPorts: !verticalStepGroup
              })

        this.addNode(nodeRender)
      } else {
        nodeRender.setOptions({
          ...nodeRender.getOptions(),
          ...commonOption
        })
      }
      nodeRender.setPosition(startX, startY)

      /* istanbul ignore else */ if (!isEmpty(prevNodes) && prevNodes) {
        prevNodes.forEach((prevNode: Diagram.DefaultNodeModel) => {
          this.connectedParentToNode(
            nodeRender as Diagram.DefaultNodeModel<Diagram.DefaultNodeModelGenerics>,
            prevNode,
            false,
            0,
            getArrowsColor(stage.status, undefined, verticalStepGroup)
          )
        })
      }
      return { startX, startY, prevNodes: [nodeRender] }
    } else if (node.parallel && prevNodes) {
      const { parallel } = node
      /* istanbul ignore else */ if (parallel.length > 1) {
        let newX = startX
        let newY = startY
        /* istanbul ignore else */ if (!isEmpty(prevNodes)) {
          const emptyNodeStart =
            this.getNodeFromId(`${EmptyNodeSeparator}-${EmptyNodeSeparator}${parallel[0].item?.identifier}-Start`) ||
            new Diagram.EmptyNodeModel({
              id: `${EmptyNodeSeparator}-${EmptyNodeSeparator}${parallel[0].item?.identifier}-Start`,
              name: 'Empty',
              showPorts: !verticalStepGroup
            })
          this.addNode(emptyNodeStart)
          newX += verticalStepGroup ? this.gap / 2 : this.gap
          emptyNodeStart.setPosition(newX, newY)
          prevNodes.forEach((prevNode: Diagram.DefaultNodeModel) => {
            this.connectedParentToNode(
              emptyNodeStart,
              prevNode,
              false,
              0,
              getArrowsColor(
                parallel[0].item?.status || /* istanbul ignore next */ ExecutionPipelineItemStatus.NOT_STARTED,
                undefined,
                verticalStepGroup
              )
            )
          })
          prevNodes = [emptyNodeStart]
          newX = newX - this.gap / 2 - 20
        }
        const prevNodesAr: Diagram.DefaultNodeModel[] = []
        parallel.forEach(nodeP => {
          const resp = this.renderGraphNodes(
            nodeP,
            newX,
            newY,
            selectedStageId,
            diagramContainerHeight,
            prevNodes,
            showEndNode,
            groupStage,
            verticalStepGroup
          )
          startX = resp.startX
          newY = resp.startY + this.gap / 2 + (nodeStyle.height - 64)
          /* istanbul ignore else */ if (resp.prevNodes) {
            prevNodesAr.push(...resp.prevNodes)
          }
        })
        /* istanbul ignore else */ if (!isEmpty(prevNodesAr)) {
          const emptyNodeEnd =
            this.getNodeFromId(`${EmptyNodeSeparator}${parallel[0].item?.identifier}${EmptyNodeSeparator}-End`) ||
            new Diagram.EmptyNodeModel({
              id: `${EmptyNodeSeparator}${parallel[0].item?.identifier}${EmptyNodeSeparator}-End`,
              name: 'Empty',
              showPorts: !verticalStepGroup
            })
          this.addNode(emptyNodeEnd)
          startX += verticalStepGroup ? this.gap / 2 : this.gap
          emptyNodeEnd.setPosition(startX, startY)
          prevNodesAr.forEach((prevNode: Diagram.DefaultNodeModel) => {
            this.connectedParentToNode(
              emptyNodeEnd,
              prevNode,
              false,
              0,
              getArrowsColor(
                parallel[0].item?.status || /* istanbul ignore next */ ExecutionPipelineItemStatus.NOT_STARTED,
                true,
                verticalStepGroup
              )
            )
          })
          prevNodes = [emptyNodeEnd]
          startX = startX - this.gap / 2 - 20
        }
      } else {
        return this.renderGraphNodes(
          parallel[0],
          startX,
          startY,
          selectedStageId,
          diagramContainerHeight,
          prevNodes,
          showEndNode,
          groupStage,
          verticalStepGroup
        )
      }
      return { startX, startY, prevNodes }
    } /* istanbul ignore else */ else if (node.group) {
      /* istanbul ignore else */ if (!groupStage?.get(node.group.identifier)?.collapsed) {
        this.clearAllLinksForNodeAndNode(node.group.identifier)
        const stepGroupLayer =
          this.getGroupLayer(node.group.identifier) ||
          new Diagram.StepGroupNodeLayerModel({
            identifier: node.group.identifier,
            id: node.group.identifier,
            depth: calculateDepthCount(node.group.items),
            label: node.group.name,
            showRollback: false
          })
        /* istanbul ignore else */ if (prevNodes && prevNodes.length > 0) {
          startX += this.gap
          stepGroupLayer.startNode.setPosition(startX, startY)
          prevNodes.forEach((prevNode: Diagram.DefaultNodeModel) => {
            this.connectedParentToNode(
              stepGroupLayer.startNode,
              prevNode,
              false,
              0,
              getArrowsColor(node.group?.status || /* istanbul ignore next */ ExecutionPipelineItemStatus.NOT_STARTED)
            )
          })
          prevNodes = [stepGroupLayer.startNode]
          startX = startX - this.gap / 2 - 20
        }
        this.useStepGroupLayer(stepGroupLayer)

        // Check if step group has nodes
        /* istanbul ignore else */ if (node.group.items?.length > 0) {
          node.group.items.forEach(step => {
            const resp = this.renderGraphNodes(
              step,
              startX,
              startY,
              selectedStageId,
              diagramContainerHeight,
              prevNodes,
              showEndNode,
              groupStage,
              node.group?.verticalStepGroup
            )
            startX = resp.startX
            startY = resp.startY
            /* istanbul ignore else */ if (resp.prevNodes) {
              prevNodes = resp.prevNodes
            }
          })
        }
        /* istanbul ignore else */ if (prevNodes && prevNodes.length > 0) {
          startX += this.gap
          stepGroupLayer.endNode.setPosition(startX, startY)
          showEndNode &&
            prevNodes.forEach((prevNode: Diagram.DefaultNodeModel) => {
              this.connectedParentToNode(
                stepGroupLayer.endNode,
                prevNode,
                false,
                0,
                getArrowsColor(
                  node.group?.status || /* istanbul ignore next */ ExecutionPipelineItemStatus.NOT_STARTED,
                  true,
                  node.group?.verticalStepGroup
                )
              )
            })
          prevNodes = [stepGroupLayer.endNode]
          startX = startX - this.gap / 2 - 20
        }
        this.useNormalLayer()
        return { startX, startY, prevNodes: prevNodes }
      } else {
        this.clearAllStageGroups(node)
        startX += this.gap
        const nodeRender =
          this.getNodeFromId(node.group.identifier) ||
          new Diagram.DefaultNodeModel({
            identifier: node.group.identifier,
            id: node.group.identifier,
            name: node.group.name,
            canDelete: false,
            icon: node.group.icon,
            secondaryIcon: 'plus',
            customNodeStyle: node.group.cssProps
          })
        this.addNode(nodeRender)
        nodeRender.setPosition(startX, startY)
        if (!isEmpty(prevNodes) && prevNodes) {
          prevNodes.forEach((prevNode: Diagram.DefaultNodeModel) => {
            this.connectedParentToNode(
              nodeRender,
              prevNode,
              false,
              0,
              getArrowsColor(node.group?.status || ExecutionPipelineItemStatus.NOT_STARTED)
            )
          })
        }
        return { startX, startY, prevNodes: [nodeRender] }
      }
    }
    return { startX, startY }
  }

  clearAllStageGroups<T>(node: ExecutionPipelineNode<T>): void {
    if (node.group) {
      this.clearAllLinksForGroupLayer(node.group.identifier)
      const items = node.group.items
      if (items.length > 0) {
        items.forEach(item => {
          if (item.group) {
            this.clearAllStageGroups(item)
          }
        })
      }
    }
  }

  addUpdateGraph<T>(
    pipeline: ExecutionPipeline<T>,
    listeners: Listeners,
    selectedId?: string,
    diagramContainerHeight?: number,
    showStartEndNode?: boolean,
    showEndNode?: boolean,
    groupStage?: Map<string, GroupState<T>>
  ): void {
    const { gap } = this
    let { startX, startY } = this

    /* istanbul ignore if */ if (pipeline.items.length === 0) {
      return
    }
    // Unlock Graph
    this.setLocked(false)
    this.clearAllListeners()
    let prevNodes: Diagram.DefaultNodeModel[] = []

    /* istanbul ignore else */ if (showStartEndNode) {
      //Start Node
      const startNode = this.getNodeFromId('start-new') || new Diagram.NodeStartModel({ id: 'start-new' })
      startNode.setPosition(startX, startY)
      // this.clearAllLinksForNode('start-new')
      this.addNode(startNode)
      startX -= gap / 2
      prevNodes = [startNode]
    } else {
      startX -= gap
    }

    pipeline.items?.forEach(node => {
      const resp = this.renderGraphNodes(
        node,
        startX,
        startY,
        selectedId,
        diagramContainerHeight,
        prevNodes,
        showEndNode,
        groupStage
      )
      startX = resp.startX
      startY = resp.startY
      /* istanbul ignore else */ if (resp.prevNodes) {
        prevNodes = resp.prevNodes
      }
    })

    /* istanbul ignore else */ if (showStartEndNode && showEndNode) {
      // Stop Node
      const stopNode =
        this.getNodeFromId('stop-node') || new Diagram.NodeStartModel({ id: 'stop-node', icon: 'stop', isStart: false })
      // this.clearAllLinksForNode('stop-node')
      stopNode.setPosition(startX + gap, startY)
      const lastNode = last(prevNodes)
      /* istanbul ignore else */ if (lastNode) {
        this.connectedParentToNode(
          stopNode,
          lastNode,
          false,
          0,
          getArrowsColor(pipeline.status || /* istanbul ignore next */ ExecutionPipelineItemStatus.NOT_STARTED)
        )
      }
      this.addNode(stopNode)
    }

    const nodes = this.getActiveNodeLayer().getNodes()
    for (const key in nodes) {
      const node = nodes[key]
      node.registerListener(listeners.nodeListeners)
    }
    const links = this.getActiveLinkLayer().getLinks()
    for (const key in links) {
      const link = links[key]
      link.registerListener(listeners.linkListeners)
    }

    this.stepGroupLayers.forEach(layer => {
      layer.registerListener(listeners.layerListeners)
      const nodesInLayer = layer.getNodes()
      for (const key in nodesInLayer) {
        const node = nodesInLayer[key]
        node.registerListener(listeners.nodeListeners)
      }
    })
    // Lock the graph back
    this.setLocked(true)
  }
}
