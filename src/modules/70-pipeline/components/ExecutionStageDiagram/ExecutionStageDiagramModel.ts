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
  getIconStyleBasedOnStatus,
  getTertiaryIconProps,
  calculateGroupHeaderDepth,
  calculateDepth,
  containGroup
} from './ExecutionStageDiagramUtils'
import * as Diagram from '../Diagram'
import css from './ExecutionStageDiagram.module.scss'

const SPACE_AFTER_GROUP = 0.2
const GROUP_HEADER_DEPTH = 0.3

const LINE_SEGMENT_LENGTH = 50

export interface NodeStyleInterface {
  width: number
  height: number
}

export interface GridStyleInterface {
  gridSize?: number
  startX?: number
  startY?: number
  gapX?: number
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
      gapX: 200,
      gapY: 140
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
    groupStage: Map<string, GroupState<T>> = new Map(),
    verticalStepGroup = false,
    isRootGroup = true
  ): { startX: number; startY: number; prevNodes?: Diagram.DefaultNodeModel[] } {
    const { nodeStyle } = this
    if (!node) {
      return { startX, startY, prevNodes: [] }
    }
    if (node.item && !node.parallel) {
      const { item: stage } = node
      const { type } = stage
      startX += this.gapX
      const isSelected = selectedStageId === stage.identifier
      const statusProps = getStatusProps(stage.status, type)
      const tertiaryIconProps = getTertiaryIconProps(stage)
      let nodeRender = this.getNodeFromId(stage.identifier)
      const commonOption: Diagram.DiamondNodeModelOptions = {
        customNodeStyle: getNodeStyles(isSelected, stage.status),
        canDelete: false,
        ...statusProps,
        ...tertiaryIconProps,
        nodeClassName: cx(
          { [css.runningNode]: stage.status === ExecutionPipelineItemStatus.RUNNING },
          { [css.selected]: stage.status === ExecutionPipelineItemStatus.RUNNING && isSelected }
        ),
        iconStyle: getIconStyleBasedOnStatus(stage.status, isSelected),
        icon: stage.icon,
        skipCondition: stage?.skipCondition
      }

      if (!nodeRender) {
        nodeRender =
          type === ExecutionPipelineNodeType.ICON
            ? /* istanbul ignore next */ new Diagram.IconNodeModel({
                identifier: stage.identifier,
                id: stage.identifier,
                ...commonOption,
                customNodeStyle: {
                  // Without this doesn't look straight
                  marginTop: '2.5px',
                  ...commonOption.customNodeStyle,
                  border: 'none'
                },
                width: nodeStyle.width,
                height: nodeStyle.height,
                name: stage.name,
                icon: stage.icon,
                iconSize: stage.iconSize,
                iconStyle: {
                  marginBottom: '38px'
                }
              })
            : type === ExecutionPipelineNodeType.DIAMOND
            ? /* istanbul ignore next */ new Diagram.DiamondNodeModel({
                identifier: stage.identifier,
                id: stage.identifier,
                ...commonOption,
                width: 64,
                height: 64,
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
                width: nodeStyle.width,
                height: nodeStyle.height,
                showPorts: !verticalStepGroup
              })

        this.addNode(nodeRender)
      } else {
        nodeRender.setOptions({
          ...nodeRender.getOptions(),
          ...commonOption,
          iconStyle: {
            ...commonOption.iconStyle,
            ...stage?.iconStyle
          }
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
            getArrowsColor(stage.status, undefined, verticalStepGroup),
            { type: 'in', size: LINE_SEGMENT_LENGTH }
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
            this.getNodeFromId(
              `${EmptyNodeSeparator}-${EmptyNodeSeparator}${
                parallel[0].item?.identifier || parallel[0].group?.identifier
              }-Start`
            ) ||
            new Diagram.EmptyNodeModel({
              id: `${EmptyNodeSeparator}-${EmptyNodeSeparator}${
                parallel[0].item?.identifier || parallel[0].group?.identifier
              }-Start`,
              name: 'Empty',
              showPorts: !verticalStepGroup
            })
          this.addNode(emptyNodeStart)
          newX += verticalStepGroup ? this.gapX / 2 : this.gapX
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
          newX = newX - this.gapX / 2 - 20
        }
        const prevNodesAr: Diagram.DefaultNodeModel[] = []
        parallel.forEach((nodeP, pIdx) => {
          const resp = this.renderGraphNodes(
            nodeP,
            newX,
            newY,
            selectedStageId,
            diagramContainerHeight,
            prevNodes,
            showEndNode,
            groupStage,
            verticalStepGroup,
            isRootGroup && pIdx == 0
          )

          startX = Math.max(startX, resp.startX)

          const depthYParallel = calculateDepth(nodeP, groupStage, SPACE_AFTER_GROUP, SPACE_AFTER_GROUP)
          newY = resp.startY + this.gapY * depthYParallel
          /* istanbul ignore else */ if (resp.prevNodes) {
            prevNodesAr.push(...resp.prevNodes)
          }
        })
        /* istanbul ignore else */ if (!isEmpty(prevNodesAr)) {
          const emptyNodeEnd =
            this.getNodeFromId(
              `${EmptyNodeSeparator}${
                parallel[0].item?.identifier || parallel[0].group?.identifier
              }${EmptyNodeSeparator}-End`
            ) ||
            new Diagram.EmptyNodeModel({
              id: `${EmptyNodeSeparator}${
                parallel[0].item?.identifier || parallel[0].group?.identifier
              }${EmptyNodeSeparator}-End`,
              name: 'Empty',
              showPorts: !verticalStepGroup
            })
          this.addNode(emptyNodeEnd)
          startX += verticalStepGroup ? this.gapX / 2 : this.gapX
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
              ),
              { type: 'out', size: LINE_SEGMENT_LENGTH }
            )
          })
          prevNodes = [emptyNodeEnd]
          startX = startX - this.gapX / 2 - 20
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
          verticalStepGroup,
          isRootGroup
        )
      }
      return { startX, startY, prevNodes }
    } /* istanbul ignore else */ else if (node.group) {
      /* istanbul ignore else */ if (!groupStage.get(node.group.identifier)?.collapsed) {
        this.clearAllLinksForNodeAndNode(node.group.identifier)
        this.activeNodeLayer.removeModel(node.group.identifier)
        let depthY = calculateDepth(node, groupStage, 0, SPACE_AFTER_GROUP)
        const headerDepth = calculateGroupHeaderDepth(node.group.items, GROUP_HEADER_DEPTH)
        //NOTE: decrease depth if its a  (1)root group that (3)has group (2)group is not at first level
        if (isRootGroup && headerDepth === 0 && containGroup(node.group.items)) {
          depthY -= GROUP_HEADER_DEPTH
        }

        const stepGroupLayer =
          this.getGroupLayer(node.group.identifier) ||
          new Diagram.StepGroupNodeLayerModel({
            identifier: node.group.identifier,
            id: node.group.identifier
          })
        stepGroupLayer.setOptions({
          childrenDistance: this.gapY,
          depth: depthY,
          headerDepth: headerDepth + GROUP_HEADER_DEPTH,
          label: node.group.name,
          containerCss: node.group.containerCss,
          textCss: node.group.textCss,
          skipCondition: node.group.skipCondition,
          showRollback: false
        })

        /* istanbul ignore else */ if (prevNodes && prevNodes.length > 0) {
          startX += this.gapX
          stepGroupLayer.startNode.setPosition(startX, startY)
          prevNodes.forEach((prevNode: Diagram.DefaultNodeModel) => {
            this.connectedParentToNode(
              stepGroupLayer.startNode,
              prevNode,
              false,
              0,
              getArrowsColor(node.group?.status || /* istanbul ignore next */ ExecutionPipelineItemStatus.NOT_STARTED),
              { type: 'in', size: LINE_SEGMENT_LENGTH }
            )
          })
          prevNodes = [stepGroupLayer.startNode]
          startX = startX - this.gapX / 2 - 20
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
              node.group?.verticalStepGroup,
              false
            )
            startX = resp.startX
            startY = resp.startY
            /* istanbul ignore else */ if (resp.prevNodes) {
              prevNodes = resp.prevNodes
            }
          })
        }
        /* istanbul ignore else */ if (prevNodes && prevNodes.length > 0) {
          startX += this.gapX
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
          startX = startX - this.gapX / 2 - 20
        }
        this.useNormalLayer()
        return { startX, startY, prevNodes: prevNodes }
      } else {
        this.clearAllStageGroups(node)

        startX += this.gapX
        const nodeRender =
          this.getNodeFromId(node.group.identifier) ||
          new Diagram.DefaultNodeModel({
            identifier: node.group.identifier,
            id: node.group.identifier,
            name: node.group.name,
            canDelete: false,
            icon: node.group.icon,
            secondaryIcon: 'plus',
            skipCondition: node.group.skipCondition,
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
    if (node.group && this.getGroupLayer(node.group.identifier)) {
      const layer = this.getGroupLayer(node.group.identifier)
      this.clearAllLinksForGroupLayer(node.group.identifier)
      const items = node.group.items
      if (items.length > 0) {
        items.forEach(item => {
          if (item.item) {
            this.clearAllLinksForNodeAndNode(item.item.identifier)
            layer?.removeModel(item.item.identifier)
          } else if (item.group) {
            this.clearAllStageGroups(item)
            layer?.removeModel(item.group.identifier)
          } else if (item.parallel && item.parallel.length > 0) {
            item.parallel.forEach(nodeP => {
              this.clearAllStageGroups(nodeP)
              layer?.removeModel(nodeP.group?.identifier || '')
            })

            // NOTE: clear end node for parallel
            this.clearAllLinksForNodeAndNode(
              `${EmptyNodeSeparator}${
                item.parallel[0].item?.identifier || item.parallel[0].group?.identifier
              }${EmptyNodeSeparator}-End`
            )
            layer?.removeModel(
              `${EmptyNodeSeparator}${
                item.parallel[0].item?.identifier || item.parallel[0].group?.identifier
              }${EmptyNodeSeparator}-End`
            )
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
    const { gapX } = this
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
      startX -= gapX / 2
      prevNodes = [startNode]
    } else {
      startX -= gapX
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
      stopNode.setPosition(startX + gapX, startY)
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
      if (
        pipeline.allNodes.indexOf(node.getID()) === -1 &&
        !(node instanceof Diagram.NodeStartModel) &&
        !(node instanceof Diagram.EmptyNodeModel)
      ) {
        node.remove()
        this.activeNodeLayer.removeModel(node.getID())
      } else {
        node.registerListener(listeners.nodeListeners)
      }
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
        if (
          pipeline.allNodes.indexOf(node.getID()) === -1 &&
          !(node instanceof Diagram.NodeStartModel) &&
          !(node instanceof Diagram.EmptyNodeModel)
        ) {
          node.remove()
          layer.removeModel(node.getID())
        } else {
          node.registerListener(listeners.nodeListeners)
        }
      }
    })
    // Lock the graph back
    this.setLocked(true)
  }
}
