import type { IconName } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import type { NgPipeline, StageElementWrapper } from 'services/cd-ng'
import type { UseStringsReturn } from 'framework/exports'
import { EmptyStageName } from '../PipelineConstants'
import type { StagesMap } from '../PipelineContext/PipelineContext'
import { getCommonStyles, EmptyNodeSeparator, Listeners } from './StageBuilderUtil'
import {
  CreateNewModel,
  DefaultNodeModel,
  DiagramModel,
  DiamondNodeModel,
  EmptyNodeModel,
  GroupNodeModel,
  NodeStartModel
} from '../../Diagram'

export class StageBuilderModel extends DiagramModel {
  constructor() {
    super({
      gridSize: 100,
      startX: 50,
      startY: 60,
      gapX: 200,
      gapY: 100
    })
  }

  renderGraphNodes(
    node: StageElementWrapper,
    startX: number,
    startY: number,
    stagesMap: StagesMap,
    isReadonly: boolean,
    selectedStageId?: string,
    splitPaneSize?: number,
    prevNodes?: DefaultNodeModel[],
    allowAdd?: boolean,
    isParallelNodes = false
  ): { startX: number; startY: number; prevNodes?: DefaultNodeModel[] } {
    if (node && node.stage) {
      const type = stagesMap[node.stage.type]
      startX += this.gapX
      const isSelected = selectedStageId === node.stage.identifier
      const nodeRender = type?.isApproval
        ? new DiamondNodeModel({
            identifier: node.stage.identifier,
            id: node.stage.identifier,
            customNodeStyle: {
              // Without this doesn't look straight
              marginTop: '2.5px',
              ...getCommonStyles(isSelected)
            },
            name: node.stage.name,
            width: 57,
            isInComplete: node.stage.name === EmptyStageName,
            canDelete: selectedStageId === node.stage.identifier || isReadonly ? false : true,
            draggable: !isReadonly,
            height: 57,
            skipCondition: node.stage.skipCondition,
            iconStyle: { color: isSelected ? 'var(--white)' : type.iconColor },
            icon: type.icon
          })
        : new DefaultNodeModel({
            identifier: node.stage.identifier,
            id: node.stage.identifier,
            customNodeStyle: getCommonStyles(isSelected),
            name: node.stage.name,
            isInComplete: node.stage.name === EmptyStageName,
            width: 114,
            draggable: !isReadonly,
            canDelete: selectedStageId === node.stage.identifier || isReadonly ? false : true,
            skipCondition: node.stage.skipCondition,
            allowAdd: allowAdd === true && !isReadonly,
            height: 50,
            iconStyle: { color: isSelected ? 'var(--white)' : type?.iconColor },
            icon: type.icon
          })

      this.addNode(nodeRender)
      nodeRender.setPosition(startX, startY)
      /* istanbul ignore else */ if (!isEmpty(prevNodes) && prevNodes) {
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(nodeRender, prevNode, !isParallelNodes && !isReadonly)
        })
      }
      return { startX, startY, prevNodes: [nodeRender] }
    } /* istanbul ignore else */ else if (node?.parallel && prevNodes) {
      /* istanbul ignore else */ if (node.parallel.length > 1) {
        if (selectedStageId && (splitPaneSize || 0) < this.gapY * node.parallel.length + 40) {
          const parallelStageNames: Array<string> = []
          let isSelected = false
          const icons: Array<IconName> = []
          node.parallel.forEach((nodeP: StageElementWrapper) => {
            const type = stagesMap[nodeP.stage.type]
            if (nodeP.stage.identifier === selectedStageId) {
              parallelStageNames.unshift(nodeP.stage.name)
              icons.unshift(type.icon)
              isSelected = true
            } else {
              parallelStageNames.push(nodeP.stage.name)
              icons.push(type.icon)
            }
          })
          const groupedNode = new GroupNodeModel({
            customNodeStyle: getCommonStyles(isSelected),
            identifier: isSelected ? selectedStageId : node.parallel[0].stage.identifier,
            id: isSelected ? selectedStageId : node.parallel[0].stage.identifier,
            name:
              parallelStageNames.length > 2
                ? `${parallelStageNames[0]}, ${parallelStageNames[1]}, +${parallelStageNames.length - 2}`
                : parallelStageNames.join(', '),
            width: 114,
            height: 50,
            icons
          })
          startX += this.gapX
          this.addNode(groupedNode)
          groupedNode.setPosition(startX, startY)
          if (!isEmpty(prevNodes) && prevNodes) {
            prevNodes.forEach((prevNode: DefaultNodeModel) => {
              this.connectedParentToNode(groupedNode, prevNode, !isParallelNodes)
            })
          }
          prevNodes = [groupedNode]
        } else {
          let newX = startX
          let newY = startY
          /* istanbul ignore else */ if (!isEmpty(prevNodes)) {
            const emptyNodeStart = new EmptyNodeModel({
              identifier: `${EmptyNodeSeparator}-${EmptyNodeSeparator}${node.parallel[0].stage.identifier}${EmptyNodeSeparator}`,
              name: 'Empty'
            })
            this.addNode(emptyNodeStart)
            newX += this.gapX
            emptyNodeStart.setPosition(newX, newY)
            prevNodes.forEach((prevNode: DefaultNodeModel) => {
              this.connectedParentToNode(emptyNodeStart, prevNode, true)
            })
            prevNodes = [emptyNodeStart]
            newX = newX - this.gapX / 2 - 20
          }
          const prevNodesAr: DefaultNodeModel[] = []
          node.parallel.forEach((nodeP: StageElementWrapper, index: number) => {
            const isLastNode = node.parallel.length === index + 1
            const resp = this.renderGraphNodes(
              nodeP,
              newX,
              newY,
              stagesMap,
              isReadonly,
              selectedStageId,
              splitPaneSize,
              prevNodes,
              isLastNode,
              true
            )
            startX = resp.startX
            newY = resp.startY + this.gapY
            /* istanbul ignore else */ if (resp.prevNodes) {
              prevNodesAr.push(...resp.prevNodes)
            }
          })
          /* istanbul ignore else */ if (!isEmpty(prevNodesAr)) {
            const emptyNodeEnd = new EmptyNodeModel({
              identifier: `${EmptyNodeSeparator}${node.parallel[0].stage.identifier}${EmptyNodeSeparator}`,
              name: 'Empty'
            })
            this.addNode(emptyNodeEnd)
            startX += this.gapX
            emptyNodeEnd.setPosition(startX, startY)
            prevNodesAr.forEach((prevNode: DefaultNodeModel) => {
              this.connectedParentToNode(emptyNodeEnd, prevNode, false)
            })
            prevNodes = [emptyNodeEnd]
            startX = startX - this.gapX / 2 - 20
          }
        }
      } else {
        return this.renderGraphNodes(
          node.parallel[0],
          startX,
          startY,
          stagesMap,
          isReadonly,
          selectedStageId,
          splitPaneSize,
          prevNodes,
          true,
          false
        )
      }
      return { startX, startY, prevNodes }
    }
    return { startX, startY }
  }

  addUpdateGraph(
    data: NgPipeline,
    listeners: Listeners,
    stagesMap: StagesMap,
    getString: UseStringsReturn['getString'],
    isReadonly: boolean,
    selectedStageId?: string,
    splitPaneSize?: number
  ): void {
    let { startX, startY } = this
    this.clearAllNodesAndLinks() // TODO: Improve this

    // Unlock Graph
    this.setLocked(false)

    //Start Node
    const startNode = new NodeStartModel({ id: 'start-new' })
    startNode.setPosition(startX, startY)
    this.addNode(startNode)

    // Stop Node
    const stopNode = new NodeStartModel({ id: 'stop', icon: 'stop', isStart: false })

    // Create Node
    const createNode = new CreateNewModel({
      id: 'create-node',
      width: 114,
      height: 50,
      name: getString('addStage'),
      customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' }
    })

    startX -= this.gapX / 2

    let prevNodes: DefaultNodeModel[] = [startNode]
    data?.stages?.forEach((node: StageElementWrapper) => {
      const resp = this.renderGraphNodes(
        node,
        startX,
        startY,
        stagesMap,
        isReadonly,
        selectedStageId,
        splitPaneSize,
        prevNodes,
        true
      )
      startX = resp.startX
      startY = resp.startY
      /* istanbul ignore else */ if (resp.prevNodes) {
        prevNodes = resp.prevNodes
      }
    })
    if (isReadonly) {
      stopNode.setPosition(startX + this.gapX, startY)
      prevNodes.forEach((prevNode: DefaultNodeModel) => {
        this.connectedParentToNode(stopNode, prevNode, false)
      })
      this.addNode(stopNode)
    } else {
      createNode.setPosition(startX + this.gapX, startY)
      stopNode.setPosition(startX + 2 * this.gapX, startY)
      prevNodes.forEach((prevNode: DefaultNodeModel) => {
        this.connectedParentToNode(createNode, prevNode, false)
      })
      this.connectedParentToNode(stopNode, createNode, false)
      this.addNode(stopNode)
      this.addNode(createNode)
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
    // Lock the graph back
    this.setLocked(true)
  }
}
