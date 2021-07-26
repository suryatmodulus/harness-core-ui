import { isEmpty } from 'lodash-es'

import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { UseStringsReturn } from 'framework/strings'
import type { ExecutionWrapperConfig } from 'services/cd-ng'
import {
  DiagramModel,
  CreateNewModel,
  DefaultNodeModel,
  DiamondNodeModel,
  EmptyNodeModel,
  NodeStartModel,
  StepGroupNodeLayerModel,
  StepsType,
  IconNodeModel
} from '../../Diagram'
import {
  Listeners,
  StepStateMap,
  isCustomGeneratedString,
  STATIC_SERVICE_GROUP_NAME,
  DependenciesWrapper,
  calculateDepthPS
} from './ExecutionGraphUtil'
import { EmptyNodeSeparator } from '../StageBuilder/StageBuilderUtil'
import type { AbstractStepFactory } from '../../AbstractSteps/AbstractStepFactory'

export interface GridStyleInterface {
  gridSize?: number
  startX?: number
  startY?: number
  gapX?: number
  gapY?: number
}

export interface AddUpdateGraphProps {
  stepsData: ExecutionWrapperConfig[]
  stepStates: StepStateMap
  hasDependencies: boolean
  servicesData: DependenciesWrapper[]
  factory: AbstractStepFactory
  listeners: Listeners
  isRollback: boolean
  getString: UseStringsReturn['getString']
  isReadonly: boolean
  parentPath: string
  errorMap: Map<string, string[]>
}

export interface RenderGraphStepNodesProps {
  node: ExecutionWrapperConfig
  startX: number
  startY: number
  factory: AbstractStepFactory
  isReadonly: boolean
  stepStates: StepStateMap
  isRollback?: boolean
  prevNodes?: DefaultNodeModel[]
  allowAdd?: boolean
  isParallelNode?: boolean
  isStepGroupNode?: boolean
  getString?: UseStringsReturn['getString']
  parentPath: string
  errorMap: Map<string, string[]>
}

const SPACE_AFTER_GROUP = 0.3
const GROUP_HEADER_DEPTH = 0.3

const LINE_SEGMENT_LENGTH = 50

export function getExecutionPipelineNodeType(stepType?: string): ExecutionPipelineNodeType {
  if (stepType === StepType.Barrier) {
    return ExecutionPipelineNodeType.ICON
  }
  if (stepType === StepType.HarnessApproval || stepType === StepType.JiraApproval) {
    return ExecutionPipelineNodeType.DIAMOND
  }

  return ExecutionPipelineNodeType.NORMAL
}

export class ExecutionStepModel extends DiagramModel {
  protected selectedNodeId?: string | undefined

  constructor() {
    super({
      gridSize: 100,
      startX: -100,
      startY: 100,
      gapX: 200,
      gapY: 140
    })
  }

  setSelectedNodeId(selectedNodeId?: string): void {
    this.selectedNodeId = selectedNodeId
  }

  setGridStyle(style: GridStyleInterface): void {
    Object.assign(this, style)
  }

  renderGraphServiceNodes(
    services: DependenciesWrapper[],
    startX: number,
    startY: number,
    factory: AbstractStepFactory,
    stepStates: StepStateMap,
    isReadonly: boolean,
    prevNodes?: DefaultNodeModel[],
    getString?: UseStringsReturn['getString']
  ): { startX: number; startY: number; prevNodes?: DefaultNodeModel[] } {
    const serviceState = stepStates.get(STATIC_SERVICE_GROUP_NAME)
    if (serviceState && serviceState.isStepGroupCollapsed) {
      startX += this.gapX
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
          this.connectedParentToNode(nodeRender, prevNode, !isReadonly, 0)
        })
      }
      return { startX, startY, prevNodes: [nodeRender] }
    } else {
      const stepGroupLayer = new StepGroupNodeLayerModel({
        identifier: STATIC_SERVICE_GROUP_NAME,
        childrenDistance: this.gapY,
        label: getString?.('pipelines-studio.dependenciesGroupTitle') as string,
        depth: services.length + 1,
        headerDepth: GROUP_HEADER_DEPTH,
        allowAdd: false,
        showRollback: false
      })
      if (prevNodes && prevNodes.length > 0) {
        startX += this.gapX
        stepGroupLayer.startNode.setPosition(startX, startY)
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(stepGroupLayer.startNode, prevNode, !isReadonly)
        })
        prevNodes = [stepGroupLayer.startNode]
        startX = startX - this.gapX / 2 - 20
      }
      this.useStepGroupLayer(stepGroupLayer)

      let newX = startX
      let newY = startY
      newX += this.gapX * 0.75

      const createNode = new CreateNewModel({
        name: getString?.('pipelines-studio.addDependency') as string,
        customNodeStyle: {
          borderColor: 'var(--pipeline-grey-border)'
        },
        showPorts: false,
        disabled: isReadonly
      })
      this.addNode(createNode)
      createNode.setPosition(newX, newY)
      if (prevNodes && prevNodes.length > 0) {
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(createNode, prevNode, false, 0, 'var(--pipeline-transparent-border)')
        })
      }
      prevNodes = [createNode]

      newY += this.gapY
      services.forEach((service: DependenciesWrapper) => {
        const nodeRender = new DefaultNodeModel({
          identifier: service.identifier,
          name: service.name,
          icon: factory.getStepIcon(service.type),
          allowAdd: false,
          isInComplete: isCustomGeneratedString(service.identifier),
          draggable: true,
          customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' },
          showPorts: false,
          selected: this.selectedNodeId === service.identifier
        })

        this.addNode(nodeRender)
        nodeRender.setPosition(newX, newY)
        if (!isEmpty(prevNodes) && prevNodes) {
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(nodeRender, prevNode, false, 0, 'var(--pipeline-transparent-border)')
          })
        }
        prevNodes = [nodeRender]
        newY += this.gapY
      })

      startX += this.gapX / 2

      if (prevNodes && prevNodes.length > 0) {
        startX = startX + this.gapX
        stepGroupLayer.endNode.setPosition(startX, startY)
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(stepGroupLayer.endNode, prevNode, false, 0, 'var(--pipeline-transparent-border)')
        })
        prevNodes = [stepGroupLayer.endNode]
        startX = startX - this.gapX / 2 - 20
      }
      this.useNormalLayer()

      return { startX, startY, prevNodes: prevNodes }
    }
  }

  renderGraphStepNodes(props: RenderGraphStepNodesProps): {
    startX: number
    startY: number
    prevNodes?: DefaultNodeModel[]
  } {
    const {
      node,
      factory,
      isReadonly,
      stepStates,
      isRollback = false,
      allowAdd,
      isParallelNode = false,
      isStepGroupNode = false,
      getString,
      parentPath,
      errorMap
    } = props
    let { startX, startY, prevNodes } = props
    if (node.step) {
      const stepType = node?.step?.type
      const nodeType = getExecutionPipelineNodeType(node?.step?.type) || ExecutionPipelineNodeType.NORMAL
      const hasErrors = errorMap && [...errorMap.keys()].some(key => parentPath && key.startsWith(parentPath))
      startX += this.gapX
      const nodeRender =
        nodeType === ExecutionPipelineNodeType.DIAMOND
          ? new DiamondNodeModel({
              identifier: node.step.identifier,
              name: node.step.name,
              icon: factory.getStepIcon(stepType),
              allowAdd: !isReadonly,
              canDelete: !isReadonly,
              draggable: !isReadonly,
              isInComplete: isCustomGeneratedString(node.step.identifier) || hasErrors,
              conditionalExecutionEnabled: node.step.when
                ? node.step.when?.stageStatus !== 'Success' || !!node.step.when?.condition?.trim()
                : false,
              customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' },
              iconStyle: { color: 'var(--primary-brand)' },
              selected: this.selectedNodeId === node.step.identifier
            })
          : nodeType === ExecutionPipelineNodeType.ICON
          ? new IconNodeModel({
              identifier: node.step.identifier,
              name: node.step.name,
              icon: factory.getStepIcon(stepType),
              allowAdd: allowAdd === true && !isReadonly,
              canDelete: !isReadonly,
              isInComplete: isCustomGeneratedString(node.step.identifier) || hasErrors,
              conditionalExecutionEnabled: node.step.when
                ? node.step.when?.stageStatus !== 'Success' || !!node.step.when?.condition?.trim()
                : false,
              draggable: !isReadonly,
              customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' },
              iconSize: 70,
              iconStyle: {
                marginBottom: '38px'
              },
              selected: this.selectedNodeId === node.step.identifier
            })
          : new DefaultNodeModel({
              identifier: node.step.identifier,
              name: node.step.name,
              icon: factory.getStepIcon(stepType),
              allowAdd: allowAdd === true && !isReadonly,
              isInComplete: isCustomGeneratedString(node.step.identifier) || hasErrors,
              conditionalExecutionEnabled: node.step.when
                ? node.step.when?.stageStatus !== 'Success' || !!node.step.when?.condition?.trim()
                : false,
              draggable: !isReadonly,
              canDelete: !isReadonly,
              customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' },
              selected: this.selectedNodeId === node.step.identifier
            })

      this.addNode(nodeRender)
      nodeRender.setPosition(startX, startY)
      if (!isEmpty(prevNodes) && prevNodes) {
        prevNodes.forEach((prevNode: DefaultNodeModel) => {
          this.connectedParentToNode(
            nodeRender,
            prevNode,
            !isParallelNode && !isReadonly,
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
              : `${EmptyNodeSeparator}-${EmptyNodeSeparator}${node.parallel[0].stepGroup?.identifier}${EmptyNodeSeparator}`,
            name: 'Empty',
            hideOutPort: true
          })
          this.addNode(emptyNode)
          newX += this.gapX
          emptyNode.setPosition(newX, newY)
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(
              emptyNode,
              prevNode,
              !isReadonly,
              isStepGroupNode ? 4 : 0,
              isStepGroupNode ? 'var(--pipeline-grey-border)' : 'var(--diagram-link)'
            )
          })
          prevNodes = [emptyNode]
          newX = newX - this.gapX / 2 - 20
        }
        const prevNodesAr: DefaultNodeModel[] = []

        node.parallel.forEach((nodeP, index: number) => {
          const isLastNode = node.parallel?.length === index + 1
          const resp = this.renderGraphStepNodes({
            node: nodeP,
            startX: newX,
            startY: newY,
            factory,
            isReadonly,
            stepStates,
            isRollback,
            prevNodes,
            allowAdd: isLastNode,
            isParallelNode: true,
            isStepGroupNode,
            parentPath: `${parentPath}.parallel.${index}`,
            errorMap
          })
          if (resp.startX > startX) {
            startX = resp.startX
          }
          const depthYParallel = calculateDepthPS(nodeP, stepStates, SPACE_AFTER_GROUP, SPACE_AFTER_GROUP)
          newY = resp.startY + 140 * depthYParallel
          if (resp.prevNodes) {
            prevNodesAr.push(...resp.prevNodes)
          }
        })
        if (prevNodes && node.parallel.length > 1) {
          const emptyNodeEnd = new EmptyNodeModel({
            identifier: node.parallel[0].step
              ? `${EmptyNodeSeparator}${node.parallel[0].step.identifier}${EmptyNodeSeparator}`
              : `${EmptyNodeSeparator}${node.parallel[0].stepGroup?.identifier}${EmptyNodeSeparator}`,
            name: 'Empty',
            hideInPort: true
          })
          this.addNode(emptyNodeEnd)
          startX += this.gapX
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
          startX = startX - this.gapX / 2 - 20
        }

        return { startX, startY, prevNodes }
      } else if (node.parallel.length === 1) {
        return this.renderGraphStepNodes({
          node: node.parallel[0],
          startX,
          startY,
          factory,
          isReadonly,
          stepStates,
          isRollback,
          prevNodes,
          allowAdd: true,
          isParallelNode: true,
          isStepGroupNode,
          parentPath: `${parentPath}.parallel.${0}`,
          errorMap
        })
      }
    } else if (node.stepGroup) {
      const stepState = stepStates.get(node.stepGroup.identifier)
      if (stepState && stepState.isStepGroupCollapsed) {
        startX += this.gapX
        const nodeRender = new DefaultNodeModel({
          identifier: node.stepGroup.identifier,
          name: node.stepGroup.name || '',
          icon: factory.getStepIcon('StepGroup'),
          secondaryIcon: 'plus',
          draggable: !isReadonly,
          canDelete: !isReadonly,
          conditionalExecutionEnabled: node.stepGroup.when
            ? node.stepGroup.when?.stageStatus !== 'Success' || !!node.stepGroup.when?.condition?.trim()
            : false,
          allowAdd: allowAdd === true && !isReadonly,
          customNodeStyle: { borderColor: 'var(--pipeline-grey-border)', backgroundColor: '#55b8ec' }
        })

        this.addNode(nodeRender)
        nodeRender.setPosition(startX, startY)
        if (!isEmpty(prevNodes) && prevNodes) {
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(nodeRender, prevNode, !isParallelNode && !isReadonly, 0, undefined, {
              type: 'in',
              size: LINE_SEGMENT_LENGTH
            })
          })
        }
        return { startX, startY, prevNodes: [nodeRender] }
      } else {
        const depthY = calculateDepthPS(node, stepStates, 0, SPACE_AFTER_GROUP)

        const stepGroupLayer = new StepGroupNodeLayerModel({
          identifier: node.stepGroup.identifier,
          childrenDistance: this.gapY,
          label: node.stepGroup.name,
          conditionalExecutionEnabled: node.stepGroup.when
            ? node.stepGroup.when?.stageStatus !== 'Success' || !!node.stepGroup.when?.condition?.trim()
            : false,
          inComplete: isCustomGeneratedString(node.stepGroup.identifier),
          depth: depthY,
          headerDepth: GROUP_HEADER_DEPTH,
          allowAdd: allowAdd === true && !isReadonly,
          showRollback: !isRollback,
          rollBackProps: {
            active: stepState?.isStepGroupRollback ? StepsType.Rollback : StepsType.Normal
          }
        })
        if (prevNodes && prevNodes.length > 0) {
          startX += this.gapX
          stepGroupLayer.startNode.setPosition(startX, startY)
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(
              stepGroupLayer.startNode,
              prevNode,
              !isParallelNode && !isReadonly,
              isStepGroupNode ? 4 : 0,
              isStepGroupNode ? 'var(--pipeline-grey-border)' : 'var(--diagram-link)',
              { type: 'in', size: LINE_SEGMENT_LENGTH }
            )
          })
          prevNodes = [stepGroupLayer.startNode]
          startX = startX - this.gapX / 2 - 20
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
          steps.forEach((nodeP, index: number) => {
            const resp = this.renderGraphStepNodes({
              node: nodeP,
              startX,
              startY,
              factory,
              isReadonly,
              stepStates,
              isRollback,
              prevNodes,
              allowAdd: true,
              isParallelNode: false,
              isStepGroupNode: true,
              parentPath: `${parentPath}.stepGroup.steps.${index}`,
              errorMap
            })
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
            customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' },
            disabled: isReadonly
          })
          this.addNode(createNode)
          startX += this.gapX
          createNode.setPosition(startX, startY)
          this.connectedParentToNode(createNode, stepGroupLayer.startNode, false, 4, 'var(--pipeline-grey-border)')
          prevNodes = [createNode]
        }
        if (prevNodes && prevNodes.length > 0) {
          startX = startX + this.gapX
          stepGroupLayer.endNode.setPosition(startX, startY)
          prevNodes.forEach((prevNode: DefaultNodeModel) => {
            this.connectedParentToNode(
              stepGroupLayer.endNode,
              prevNode,
              (node.stepGroup?.steps?.length || 0) > 0 && !isReadonly,
              4,
              'var(--pipeline-grey-border)'
            )
          })
          prevNodes = [stepGroupLayer.endNode]
          startX = startX - this.gapX / 2 - 20
        }
        this.useNormalLayer()
        return { startX, startY, prevNodes: prevNodes }
      }
    }
    return { startX, startY }
  }

  addUpdateGraph(props: AddUpdateGraphProps): void {
    const {
      stepsData,
      stepStates,
      hasDependencies,
      servicesData,
      factory,
      listeners: { nodeListeners, linkListeners, layerListeners },
      isRollback,
      getString,
      isReadonly,
      parentPath,
      errorMap
    } = props
    let { startX, startY } = this
    this.clearAllNodesAndLinks()
    this.setLocked(false)

    // Start Node
    const startNode = (this.getNode('start-new') as DefaultNodeModel) || new NodeStartModel({ id: 'start-new' })
    startX += this.gapX
    startNode.setPosition(startX, startY)
    startX -= this.gapX / 2 // Start Node is very small that is why reduce the margin for next
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
        isReadonly,
        prevNodes,
        getString
      )
      startX = servicesResp.startX
      startY = servicesResp.startY
      if (servicesResp.prevNodes) {
        prevNodes = servicesResp.prevNodes
      }
    }

    stepsData.forEach((node, index: number) => {
      const resp = this.renderGraphStepNodes({
        node,
        startX,
        startY,
        factory,
        isReadonly,
        stepStates,
        isRollback,
        prevNodes,
        allowAdd: true,
        isParallelNode: false,
        isStepGroupNode: false,
        getString,
        parentPath: `${parentPath}.${index}`,
        errorMap
      })
      startX = resp.startX
      startY = resp.startY
      if (resp.prevNodes) {
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
      if (tempStartX !== startX || stepsData.length === 0) {
        createNode.setPosition(startX + this.gapX, startY)
      }
      prevNodes.forEach((prevNode: DefaultNodeModel) => {
        this.connectedParentToNode(createNode, prevNode, false)
      })
      this.addNode(createNode)

      stopNode.setPosition(startX + 2 * this.gapX, startY)
      this.connectedParentToNode(stopNode, createNode, false)
      this.addNode(stopNode)
    }

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
