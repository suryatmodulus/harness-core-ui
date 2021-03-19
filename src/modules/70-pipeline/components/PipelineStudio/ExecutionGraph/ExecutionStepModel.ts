import { isEmpty } from 'lodash-es'
import type { ExecutionWrapper, ExecutionElement } from 'services/cd-ng'

import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import {
  DiagramModel,
  CreateNewModel,
  DefaultNodeModel,
  DiamondNodeModel,
  EmptyNodeModel,
  NodeStartModel,
  StepGroupNodeLayerModel,
  StepsType
} from '../../Diagram'
import {
  Listeners,
  calculateDepthCount,
  StepStateMap,
  isCustomGeneratedString,
  STATIC_SERVICE_GROUP_NAME,
  DependenciesWrapper
} from './ExecutionGraphUtil'
import { EmptyNodeSeparator } from '../StageBuilder/StageBuilderUtil'
import type { AbstractStepFactory } from '../../AbstractSteps/AbstractStepFactory'
import i18n from './ExecutionGraph.i18n'

const LINE_SEGMENT_LENGTH = 50
export class ExecutionStepModel extends DiagramModel {
  constructor() {
    super({
      gridSize: 100,
      startX: -100,
      startY: 100,
      gap: 200
    })
  }

  renderGraphServiceNodes(
    services: DependenciesWrapper[],
    startX: number,
    startY: number,
    factory: AbstractStepFactory,
    stepStates: StepStateMap,
    prevNodes?: DefaultNodeModel[],
    getString?: (key: string, vars?: Record<string, any>) => string
  ): { startX: number; startY: number; prevNodes?: DefaultNodeModel[] } {
    const serviceState = stepStates.get(STATIC_SERVICE_GROUP_NAME)
    if (serviceState && serviceState.isStepGroupCollapsed) {
      startX += this.gap
      const nodeRender = new DefaultNodeModel({
        identifier: STATIC_SERVICE_GROUP_NAME,
        name: getString?.('pipelines-studio.dependenciesGroupTitle') as string,
        icon: factory.getStepIcon('StepGroup'),
        secondaryIcon: 'plus',
        draggable: false,
        allowAdd: false,
        canDelete: false,
        customNodeStyle: { borderColor: 'var(--pipeline-grey-border)', backgroundColor: '#55b8ec' }
      })

      this.addNode(nodeRender)
      nodeRender.setPosition(startX, startY)
      if (!isEmpty(prevNodes) && prevNodes) {
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(nodeRender, prevNode, true, 0)
        })
      }
      return { startX, startY, prevNodes: [nodeRender] }
    } else {
      const stepGroupLayer = new StepGroupNodeLayerModel({
        identifier: STATIC_SERVICE_GROUP_NAME,
        label: i18n.dependencies,
        depth: 1,
        allowAdd: false,
        showRollback: false
      })
      if (prevNodes && prevNodes.length > 0) {
        startX += this.gap
        stepGroupLayer.startNode.setPosition(startX, startY)
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(stepGroupLayer.startNode, prevNode, true)
        })
        prevNodes = [stepGroupLayer.startNode]
        startX = startX - this.gap / 2 - 20
      }
      this.useStepGroupLayer(stepGroupLayer)

      let newX = startX
      let newY = startY
      newX += this.gap * 0.75

      const createNode = new CreateNewModel({
        name: getString?.('pipelines-studio.addDependency') as string,
        customNodeStyle: {
          borderColor: 'var(--pipeline-grey-border)'
        },
        showPorts: false
      })
      this.addNode(createNode)
      createNode.setPosition(newX, newY)
      if (prevNodes && prevNodes.length > 0) {
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(createNode, prevNode, false, 0, 'var(--pipeline-transparent-border)')
        })
      }
      prevNodes = [createNode]

      newY += this.gap * 0.5
      services.forEach((service: DependenciesWrapper) => {
        const nodeRender = new DefaultNodeModel({
          identifier: service.identifier,
          name: service.name,
          icon: factory.getStepIcon(service.type),
          allowAdd: false,
          isInComplete: isCustomGeneratedString(service.identifier),
          draggable: true,
          customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' },
          showPorts: false
        })

        this.addNode(nodeRender)
        nodeRender.setPosition(newX, newY)
        if (!isEmpty(prevNodes) && prevNodes) {
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(nodeRender, prevNode, false, 0, 'var(--pipeline-transparent-border)')
          })
        }
        prevNodes = [nodeRender]
        newY += this.gap * 0.5
      })

      startX += this.gap / 2

      if (prevNodes && prevNodes.length > 0) {
        startX = startX + this.gap
        stepGroupLayer.endNode.setPosition(startX, startY)
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(stepGroupLayer.endNode, prevNode, false, 0, 'var(--pipeline-transparent-border)')
        })
        prevNodes = [stepGroupLayer.endNode]
        startX = startX - this.gap / 2 - 20
      }
      this.useNormalLayer()

      return { startX, startY, prevNodes: prevNodes }
    }
  }

  renderGraphStepNodes(
    node: ExecutionWrapper,
    startX: number,
    startY: number,
    factory: AbstractStepFactory,
    stepStates: StepStateMap,
    isRollback = false,
    prevNodes?: DefaultNodeModel[],
    allowAdd?: boolean,
    isParallelNode = false,
    isStepGroupNode = false,
    getString?: (key: string, vars?: Record<string, any>) => string
  ): { startX: number; startY: number; prevNodes?: DefaultNodeModel[] } {
    if (node.step) {
      const type = node?.step?.type || ExecutionPipelineNodeType.NORMAL
      startX += this.gap
      const nodeRender =
        type === ExecutionPipelineNodeType.DIAMOND
          ? new DiamondNodeModel({
              identifier: node.step.identifier,
              name: node.step.name,
              icon: 'command-approval',
              draggable: true,
              isInComplete: isCustomGeneratedString(node.step.identifier),
              skipCondition: node.step.skipCondition,
              customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' }
            })
          : new DefaultNodeModel({
              identifier: node.step.identifier,
              name: node.step.name,
              icon: factory.getStepIcon(type),
              allowAdd: allowAdd === true,
              isInComplete: isCustomGeneratedString(node.step.identifier),
              skipCondition: node.step.skipCondition,
              draggable: true,
              customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' }
            })

      this.addNode(nodeRender)
      nodeRender.setPosition(startX, startY)
      if (!isEmpty(prevNodes) && prevNodes) {
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(
            nodeRender,
            prevNode,
            !isParallelNode,
            isStepGroupNode ? 4 : 0,
            isStepGroupNode ? 'var(--pipeline-grey-border)' : 'var(--diagram-link)',
            { type: 'in', size: LINE_SEGMENT_LENGTH }
          )
        })
      }
      return { startX, startY, prevNodes: [nodeRender] }
    } else if (node.parallel && prevNodes) {
      if (node.parallel.length > 1) {
        let newX = startX
        let newY = startY
        if (prevNodes && node.parallel.length > 1) {
          const emptyNode = new EmptyNodeModel({
            identifier: node.parallel[0].step
              ? `${EmptyNodeSeparator}-${EmptyNodeSeparator}${node.parallel[0].step.identifier}${EmptyNodeSeparator}`
              : `${EmptyNodeSeparator}-${EmptyNodeSeparator}${node.parallel[0].stepGroup.identifier}${EmptyNodeSeparator}`,
            name: 'Empty'
          })
          this.addNode(emptyNode)
          newX += this.gap
          emptyNode.setPosition(newX, newY)
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(
              emptyNode,
              prevNode,
              true,
              isStepGroupNode ? 4 : 0,
              isStepGroupNode ? 'var(--pipeline-grey-border)' : 'var(--diagram-link)'
            )
          })
          prevNodes = [emptyNode]
          newX = newX - this.gap / 2 - 20
        }
        const prevNodesAr: DefaultNodeModel[] = []

        node.parallel.forEach((nodeP: ExecutionWrapper, index: number) => {
          const isLastNode = node.parallel.length === index + 1
          const resp = this.renderGraphStepNodes(
            nodeP,
            newX,
            newY,
            factory,
            stepStates,
            isRollback,
            prevNodes,
            isLastNode,
            true,
            isStepGroupNode
          )
          if (resp.startX > startX) {
            startX = resp.startX
          }
          newY = resp.startY + this.gap * calculateDepthCount(nodeP, stepStates)
          if (resp.prevNodes) {
            prevNodesAr.push(...resp.prevNodes)
          }
        })
        if (prevNodes && node.parallel.length > 1) {
          const emptyNodeEnd = new EmptyNodeModel({
            identifier: node.parallel[0].step
              ? `${EmptyNodeSeparator}${node.parallel[0].step.identifier}${EmptyNodeSeparator}`
              : `${EmptyNodeSeparator}${node.parallel[0].stepGroup.identifier}${EmptyNodeSeparator}`,
            name: 'Empty'
          })
          this.addNode(emptyNodeEnd)
          startX += this.gap
          emptyNodeEnd.setPosition(startX, startY)

          prevNodesAr.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(
              emptyNodeEnd,
              prevNode,
              false,
              isStepGroupNode ? 4 : 0,
              isStepGroupNode ? 'var(--pipeline-grey-border)' : 'var(--diagram-link)',
              { type: 'out', size: LINE_SEGMENT_LENGTH }
            )
          })
          prevNodes = [emptyNodeEnd]
          startX = startX - this.gap / 2 - 20
        }

        return { startX, startY, prevNodes }
      } else if (node.parallel.length === 1) {
        return this.renderGraphStepNodes(
          node.parallel[0],
          startX,
          startY,
          factory,
          stepStates,
          isRollback,
          prevNodes,
          true,
          true,
          isStepGroupNode
        )
      }
    } else if (node.stepGroup) {
      const stepState = stepStates.get(node.stepGroup.identifier)
      if (stepState && stepState.isStepGroupCollapsed) {
        startX += this.gap
        const nodeRender = new DefaultNodeModel({
          identifier: node.stepGroup.identifier,
          name: node.stepGroup.name,
          icon: factory.getStepIcon('StepGroup'),
          secondaryIcon: 'plus',
          draggable: true,
          skipCondition: node.stepGroup.skipCondition,
          allowAdd: allowAdd === true,
          customNodeStyle: { borderColor: 'var(--pipeline-grey-border)', backgroundColor: '#55b8ec' }
        })

        this.addNode(nodeRender)
        nodeRender.setPosition(startX, startY)
        if (!isEmpty(prevNodes) && prevNodes) {
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(nodeRender, prevNode, !isParallelNode, 0, undefined, {
              type: 'in',
              size: LINE_SEGMENT_LENGTH
            })
          })
        }
        return { startX, startY, prevNodes: [nodeRender] }
      } else {
        const stepGroupLayer = new StepGroupNodeLayerModel({
          identifier: node.stepGroup.identifier,
          label: node.stepGroup.name,
          skipCondition: node.stepGroup.skipCondition,
          inComplete: isCustomGeneratedString(node.stepGroup.identifier),
          depth: stepState?.inheritedSG || 1,
          allowAdd: allowAdd === true,
          showRollback: !isRollback,
          rollBackProps: {
            active: stepState?.isStepGroupRollback ? StepsType.Rollback : StepsType.Normal
          }
        })
        if (prevNodes && prevNodes.length > 0) {
          startX += this.gap
          stepGroupLayer.startNode.setPosition(startX, startY)
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(
              stepGroupLayer.startNode,
              prevNode,
              !isParallelNode,
              isStepGroupNode ? 4 : 0,
              isStepGroupNode ? 'var(--pipeline-grey-border)' : 'var(--diagram-link)',
              { type: 'in', size: LINE_SEGMENT_LENGTH }
            )
          })
          prevNodes = [stepGroupLayer.startNode]
          startX = startX - this.gap / 2 - 20
        }
        this.useStepGroupLayer(stepGroupLayer)
        let steps = node.stepGroup.steps
        if (stepState?.isStepGroupRollback) {
          if (!node.stepGroup.rollbackSteps) {
            node.stepGroup.rollbackSteps = []
          }
          steps = node.stepGroup.rollbackSteps
        }
        // Check if step group has nodes
        if (steps?.length > 0) {
          steps.forEach((nodeP: ExecutionElement) => {
            const resp = this.renderGraphStepNodes(
              nodeP,
              startX,
              startY,
              factory,
              stepStates,
              isRollback,
              prevNodes,
              true,
              false,
              true
            )
            startX = resp.startX
            startY = resp.startY
            if (resp.prevNodes) {
              prevNodes = resp.prevNodes
            }
          })
        } else {
          // Else show Create Node
          const createNode = new CreateNewModel({
            name: getString?.('pipelines-studio.addStep'),
            identifier: `${EmptyNodeSeparator}${node.stepGroup.identifier}${EmptyNodeSeparator}`,
            customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' }
          })
          this.addNode(createNode)
          startX += this.gap
          createNode.setPosition(startX, startY)
          this.connectedParentToNode(createNode, stepGroupLayer.startNode, false, 4, 'var(--pipeline-grey-border)')
          prevNodes = [createNode]
        }
        if (prevNodes && prevNodes.length > 0) {
          startX = startX + this.gap
          stepGroupLayer.endNode.setPosition(startX, startY)
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(
              stepGroupLayer.endNode,
              prevNode,
              node.stepGroup.steps?.length > 0,
              4,
              'var(--pipeline-grey-border)'
            )
          })
          prevNodes = [stepGroupLayer.endNode]
          startX = startX - this.gap / 2 - 20
        }
        this.useNormalLayer()
        return { startX, startY, prevNodes: prevNodes }
      }
    }
    return { startX, startY }
  }

  addUpdateGraph(
    stepsData: ExecutionWrapper[],
    stepStates: StepStateMap,
    hasDependencies: boolean,
    servicesData: DependenciesWrapper[],
    factory: AbstractStepFactory,
    { nodeListeners, linkListeners, layerListeners }: Listeners,
    isRollback: boolean,
    getString: (key: string, vars?: Record<string, any>) => string
  ): void {
    let { startX, startY } = this
    this.clearAllNodesAndLinks()
    this.setLocked(false)

    // Start Node
    const startNode = (this.getNode('start-new') as DefaultNodeModel) || new NodeStartModel({ id: 'start-new' })
    startX += this.gap
    startNode.setPosition(startX, startY)
    startX -= this.gap / 2 // Start Node is very small thats why reduce the margin for next
    const tempStartX = startX
    this.addNode(startNode)

    // Stop Node
    const stopNode =
      (this.getNode('stop') as DefaultNodeModel) || new NodeStartModel({ id: 'stop', icon: 'stop', isStart: false })

    // Create Node
    const createNode = new CreateNewModel({
      name: getString('pipelines-studio.addStep'),
      customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' }
    })

    let prevNodes: DefaultNodeModel[] = [startNode]

    if (hasDependencies) {
      const servicesResp = this.renderGraphServiceNodes(
        servicesData,
        startX,
        startY,
        factory,
        stepStates,
        prevNodes,
        getString
      )
      startX = servicesResp.startX
      startY = servicesResp.startY
      if (servicesResp.prevNodes) {
        prevNodes = servicesResp.prevNodes
      }
    }

    stepsData.forEach((node: ExecutionWrapper) => {
      const resp = this.renderGraphStepNodes(
        node,
        startX,
        startY,
        factory,
        stepStates,
        isRollback,
        prevNodes,
        true,
        false,
        false,
        getString
      )
      startX = resp.startX
      startY = resp.startY
      if (resp.prevNodes) {
        prevNodes = resp.prevNodes
      }
    })

    if (tempStartX !== startX || stepsData.length === 0) {
      createNode.setPosition(startX + this.gap, startY)
    }
    prevNodes.forEach((prevNode: DefaultNodeModel) => {
      this.connectedParentToNode(createNode, prevNode, false)
    })
    this.addNode(createNode)

    stopNode.setPosition(startX + 2 * this.gap, startY)
    this.connectedParentToNode(stopNode, createNode, false)
    this.addNode(stopNode)

    const nodes = this.getActiveNodeLayer().getNodes()
    for (const key in nodes) {
      const node = nodes[key]
      node.registerListener(nodeListeners)
    }
    const links = this.getActiveLinkLayer().getLinks()
    for (const key in links) {
      const link = links[key]
      link.registerListener(linkListeners)
    }

    this.stepGroupLayers.forEach(layer => {
      layer.registerListener(layerListeners)
      const nodesInLayer = layer.getNodes()
      for (const key in nodesInLayer) {
        const node = nodesInLayer[key]
        node.registerListener(nodeListeners)
      }
    })

    this.setLocked(true)
  }
}
