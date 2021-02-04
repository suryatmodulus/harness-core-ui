import React, { useEffect } from 'react'
import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import { Button, Layout, Text } from '@wings-software/uicore'
import type { StageElementWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import type { AbstractStepFactory } from '@pipeline/exports'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { useToaster } from '@common/exports'
import type { ExecutionWrapper } from 'services/cd-ng'
import { ExecutionStepModel } from './ExecutionStepModel'
import { StepType as PipelineStepType } from '../../PipelineSteps/PipelineStepInterface'
import i18n from './ExecutionGraph.i18n'
import {
  addStepOrGroup,
  ExecutionGraphState,
  StepState,
  getStepsState,
  removeStepOrGroup,
  isLinkUnderStepGroup,
  getStepFromNode,
  generateRandomString,
  getDependenciesState,
  StepType,
  getDependencyFromNode,
  DependenciesWrapper,
  getDefaultStepState,
  getDefaultStepGroupState,
  getDefaultDependencyServiceState
} from './ExecutionGraphUtil'
import { EmptyStageName } from '../PipelineConstants'
import {
  CanvasWidget,
  createEngine,
  DefaultLinkEvent,
  DefaultNodeEvent,
  DefaultNodeModel,
  DefaultNodeModelGenerics,
  DiagramType,
  Event,
  StepGroupNodeLayerModel,
  StepGroupNodeLayerOptions,
  StepsType
} from '../../Diagram'
import { CanvasButtons } from '../../CanvasButtons/CanvasButtons'
import css from './ExecutionGraph.module.scss'
export interface ExecutionGraphRefObj {
  stepGroupUpdated: (stepOrGroup: ExecutionWrapper) => void
}

export type ExecutionGraphForwardRef =
  | ((instance: ExecutionGraphRefObj | null) => void)
  | React.MutableRefObject<ExecutionGraphRefObj | null>
  | null

interface PopoverData {
  event?: DefaultNodeEvent
  isParallelNodeClicked?: boolean
  onPopoverSelection?: (isStepGroup: boolean, isParallelNodeClicked: boolean, event?: DefaultNodeEvent) => void
}

const renderPopover = ({ onPopoverSelection, isParallelNodeClicked = false, event }: PopoverData): JSX.Element => {
  return (
    <>
      <Layout.Vertical spacing="small" padding="small">
        <Button
          minimal
          icon="Edit"
          text={i18n.addStep}
          onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event)}
        />
        <Button
          minimal
          icon="step-group"
          text={i18n.addStepGroup}
          onClick={() => onPopoverSelection?.(true, isParallelNodeClicked, event)}
        />
      </Layout.Vertical>
    </>
  )
}

export interface ExecutionGraphAddStepEvent {
  entity: DefaultNodeModel<DefaultNodeModelGenerics> //NOTE: this is a graph element
  isParallel: boolean
  isRollback: boolean
  parentIdentifier?: string
}

export interface ExecutionGraphEditStepEvent {
  /** step or dependency model */
  node: ExecutionWrapper | DependenciesWrapper
  isStepGroup: boolean
  isUnderStepGroup?: boolean
  addOrEdit: 'add' | 'edit'
  stepType: StepType | undefined
}

export interface ExecutionGraphProp {
  /*Allow adding group*/
  allowAddGroup?: boolean
  /*Hide or show rollback button*/
  hasRollback?: boolean
  /*Set to true if  model has spec.serviceDependencies array */
  hasDependencies?: boolean
  stepsFactory: AbstractStepFactory // REQUIRED (pass to addUpdateGraph)
  stage: StageElementWrapper
  updateStage: (stage: StageElementWrapper) => void
  onAddStep: (event: ExecutionGraphAddStepEvent) => void
  onEditStep: (event: ExecutionGraphEditStepEvent) => void
}

function ExecutionGraphRef(props: ExecutionGraphProp, ref: ExecutionGraphForwardRef): JSX.Element {
  const {
    allowAddGroup = true,
    hasDependencies = false,
    hasRollback = true,
    stepsFactory,
    stage,
    updateStage,
    onAddStep,
    onEditStep
  } = props

  const { getString } = useStrings()

  const addStep = (event: ExecutionGraphAddStepEvent): void => {
    onAddStep(event)
    model.clearSelection()
  }

  const editStep = (event: ExecutionGraphEditStepEvent): void => {
    onEditStep(event)
    model.clearSelection()
  }

  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const [state, setState] = React.useState<ExecutionGraphState>({
    states: new Map<string, StepState>(),
    stepsData: { steps: [], rollbackSteps: [], metadata: '' },
    dependenciesData: [],
    isRollback: false
  })

  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<PopoverData> | undefined
  >()

  const { showError } = useToaster()

  //1) setup the diagram engine
  const engine = React.useMemo(() => createEngine(), [])

  //2) setup the diagram model
  const model = React.useMemo(() => new ExecutionStepModel(), [])

  const onPopoverSelection = (isStepGroup: boolean, isParallelNodeClicked: boolean, event?: DefaultNodeEvent): void => {
    if (!isStepGroup && event) {
      addStep({
        entity: event.entity,
        isRollback: state.isRollback,
        isParallel: isParallelNodeClicked
      })
    } else if (event?.entity) {
      const node = {
        name: EmptyStageName,
        identifier: generateRandomString(EmptyStageName),
        steps: []
      }
      addStepOrGroup(
        event.entity,
        state.stepsData,
        {
          stepGroup: node
        },
        isParallelNodeClicked,
        state.isRollback
      )
      editStep({
        node,
        isStepGroup: true,
        addOrEdit: 'edit',
        stepType: StepType.STEP
      })
      updateStage(stage)
    }
    dynamicPopoverHandler?.hide()
  }

  const handleAdd = (
    isParallel: boolean,
    el: Element,
    event?: DefaultNodeEvent | undefined,
    onHide?: () => void | undefined
  ): void => {
    // add step instantly when allowAddGroup is false
    if (!allowAddGroup) {
      onPopoverSelection(false, true, event)
    } else {
      dynamicPopoverHandler?.show(
        el,
        {
          event,
          isParallelNodeClicked: isParallel,
          onPopoverSelection
        },
        { useArrows: true, darkMode: true },
        onHide
      )
    }
  }

  const dropNodeListener = (event: any): void => {
    const eventTemp = event as DefaultNodeEvent
    eventTemp.stopPropagation()
    if (event.node?.identifier) {
      const dropEntity = model.getNodeFromId(event.node.id)
      if (dropEntity) {
        const dropNode = getStepFromNode(state.stepsData, dropEntity, true).node
        const current = getStepFromNode(state.stepsData, eventTemp.entity, true, true)
        // Check Drop Node and Current node should not be same
        if (event.node.identifier !== eventTemp.entity.getIdentifier() && dropNode) {
          if (dropNode?.stepGroup && eventTemp.entity.getParent() instanceof StepGroupNodeLayerModel) {
            showError(i18n.stepGroupInAnotherStepGroup)
          } else {
            const isRemove = removeStepOrGroup(state, dropEntity)
            if (isRemove) {
              if (current.node) {
                if (current.parent && (current.node.step || current.node.stepGroup)) {
                  const index = current.parent?.indexOf(current.node) ?? -1
                  if (index > -1) {
                    // Remove current Stage also and make it parallel
                    current.parent?.splice(index, 1, { parallel: [current.node, dropNode] })
                    updateStage(stage)
                  }
                } else if (current.node.parallel && current.node.parallel.length > 0) {
                  current.node.parallel.push(dropNode)
                  updateStage(stage)
                }
              } else {
                addStepOrGroup(eventTemp.entity, state.stepsData, dropNode, false, state.isRollback)
                updateStage(stage)
              }
            }
          }
        }
      }
    }
  }

  const nodeListeners: NodeModelListener = {
    [Event.ClickNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      const stepState = state.states.get(event.entity.getIdentifier())
      dynamicPopoverHandler?.hide()
      const nodeRender = document.querySelector(`[data-nodeid="${eventTemp.entity.getID()}"]`)
      const layer = eventTemp.entity.getParent()
      if (eventTemp.entity.getType() === DiagramType.CreateNew && nodeRender) {
        // if Node is in Step Group then do not show addstep/addgroup popover
        if (layer instanceof StepGroupNodeLayerModel) {
          addStep({
            entity: event.entity,
            isRollback: state.isRollback,
            isParallel: false,
            parentIdentifier: (event.entity.getParent().getOptions() as StepGroupNodeLayerOptions).identifier
          })
        } else {
          handleAdd(false, nodeRender, event)
        }
      } else if (stepState && stepState.isStepGroupCollapsed) {
        const stepStates = state.states.set(event.entity.getIdentifier(), {
          ...stepState,
          isStepGroupCollapsed: !stepState.isStepGroupCollapsed
        })
        setState(prev => ({ ...prev, states: stepStates }))
      } else {
        let node
        if (stepState?.stepType === StepType.STEP) {
          node = getStepFromNode(state.stepsData, eventTemp.entity).node
        } else if (stepState?.stepType === StepType.SERVICE) {
          node = getDependencyFromNode(state.dependenciesData, eventTemp.entity).node
        }
        /* istanbul ignore else */ if (node) {
          editStep({
            node: node,
            isUnderStepGroup: eventTemp.entity.getParent() instanceof StepGroupNodeLayerModel,
            isStepGroup: false,
            addOrEdit: 'edit',
            stepType: stepState?.stepType
          })
        }
      }
    },
    [Event.RemoveNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      dynamicPopoverHandler?.hide()
      const isRemoved = removeStepOrGroup(state, eventTemp.entity)
      if (isRemoved) {
        updateStage(stage)
      }
    },
    [Event.AddParallelNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      const layer = eventTemp.entity.getParent()
      if (layer instanceof StepGroupNodeLayerModel) {
        const node = getStepFromNode(state.stepsData, eventTemp.entity).node
        if (node) {
          addStep({
            entity: eventTemp.entity,
            isRollback: state.isRollback,
            isParallel: true
          })
        }
      } else {
        /* istanbul ignore else */ if (eventTemp.target) {
          handleAdd(true, eventTemp.target, event, eventTemp.callback)
        }
      }
    },
    [Event.DropLinkEvent]: dropNodeListener
  }

  const linkListeners: LinkModelListener = {
    [Event.AddLinkClicked]: (event: any) => {
      const eventTemp = event as DefaultLinkEvent
      eventTemp.stopPropagation()
      dynamicPopoverHandler?.hide()
      const linkRender = document.querySelector(`[data-linkid="${eventTemp.entity.getID()}"] circle`)
      const sourceLayer = eventTemp.entity.getSourcePort().getNode().getParent()
      const targetLayer = eventTemp.entity.getTargetPort().getNode().getParent()
      // check if the link is under step group then directly show add Step
      if (sourceLayer instanceof StepGroupNodeLayerModel && targetLayer instanceof StepGroupNodeLayerModel) {
        onPopoverSelection(false, false, event)
      } else if (linkRender) {
        handleAdd(false, linkRender, event)
      }
    },
    [Event.DropLinkEvent]: (event: any) => {
      const eventTemp = event as DefaultLinkEvent
      eventTemp.stopPropagation()
      if (event.node?.identifier && event.node?.id) {
        const dropEntity = model.getNodeFromId(event.node.id)
        if (dropEntity) {
          const dropNode = getStepFromNode(state.stepsData, dropEntity, true).node
          if (dropNode?.stepGroup && isLinkUnderStepGroup(eventTemp.entity)) {
            showError(i18n.stepGroupInAnotherStepGroup)
          } else {
            const isRemove = removeStepOrGroup(state, dropEntity)
            if (isRemove && dropNode) {
              addStepOrGroup(eventTemp.entity, state.stepsData, dropNode, false, state.isRollback)
              updateStage(stage)
            }
          }
        }
      }
    }
  }

  const layerListeners: BaseModelListener = {
    [Event.StepGroupCollapsed]: (event: any) => {
      const stepState = state.states.get(event.entity.getIdentifier())
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (stepState) {
        const stepStates = state.states.set(event.entity.getIdentifier(), {
          ...stepState,
          isStepGroupCollapsed: !stepState.isStepGroupCollapsed
        })
        setState(prev => ({ ...prev, states: stepStates }))
      }
    },
    [Event.StepGroupClicked]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      const node = getStepFromNode(state.stepsData, eventTemp.entity).node
      if (node) {
        editStep({
          node: node,
          isStepGroup: true,
          addOrEdit: 'edit',
          stepType: StepType.STEP
        })
      }
    },
    [Event.RollbackClicked]: (event: any) => {
      const stepState = state.states.get(event.entity.getIdentifier())
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (stepState) {
        const stepStates = state.states.set(event.entity.getIdentifier(), {
          ...stepState,
          isStepGroupRollback: !stepState.isStepGroupRollback
        })
        setState(prev => ({ ...prev, states: stepStates }))
      }
    },
    [Event.AddParallelNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (eventTemp.target) {
        handleAdd(true, eventTemp.target, event, eventTemp.callback)
      }
    },
    [Event.DropLinkEvent]: dropNodeListener
  }

  useEffect(() => {
    engine.registerListener({
      [Event.RollbackClicked]: (event: any): void => {
        const type = event.type as StepsType
        setState(prev => ({ ...prev, isRollback: type === StepsType.Rollback }))
      }
    })
  }, [engine])

  // renderParallelNodes(model)
  model.addUpdateGraph(
    state.isRollback ? state.stepsData.rollbackSteps || [] : state.stepsData.steps || [],
    state.states,
    hasDependencies,
    state.dependenciesData,
    stepsFactory,
    { nodeListeners, linkListeners, layerListeners },
    state.isRollback,
    getString
  )

  // load model into engine
  engine.setModel(model)

  useEffect(() => {
    if (stage) {
      const data = stage

      if (data?.stage?.spec?.execution) {
        const newStateMap = new Map<string, StepState>()
        getStepsState(data.stage.spec.execution, newStateMap)
        if (hasDependencies && data?.stage?.spec?.serviceDependencies) {
          getDependenciesState(data.stage.spec.serviceDependencies, newStateMap)
        }

        setState(prevState => ({
          ...prevState,
          states: newStateMap,
          stepsData: data.stage.spec.execution,
          dependenciesData: data.stage.spec.serviceDependencies
        }))
      } else {
        // there is a bag
        data.stage.spec = {
          ...data.stage.spec
        }
        updateStage(stage)
      }
    }
  }, [stage, ref])

  const stepGroupUpdated = React.useCallback(
    stepOrGroup => {
      if (stepOrGroup.identifier) {
        const newStateMap = new Map<string, StepState>([...state.states])
        if (stepOrGroup.steps) {
          newStateMap.set(stepOrGroup.identifier, getDefaultStepGroupState())
        } else {
          newStateMap.set(
            stepOrGroup.identifier,
            stepOrGroup.type === PipelineStepType.Dependency
              ? getDefaultDependencyServiceState()
              : getDefaultStepState()
          )
        }
        setState(prev => ({ ...prev, states: newStateMap }))
      }
    },
    [state.states]
  )

  useEffect(() => {
    if (!ref) return

    if (typeof ref === 'function') {
      return
    }

    ref.current = {
      stepGroupUpdated
    }
  }, [ref, stepGroupUpdated])

  return (
    <div
      className={css.container}
      onClick={e => {
        const div = e.target as HTMLDivElement
        if (div === canvasRef.current?.children[0]) {
          dynamicPopoverHandler?.hide()
        }
      }}
      // onDragOver={event => {
      //   const position = engine.getRelativeMousePoint(event)
      //   model.highlightNodesAndLink(position)
      //   event.preventDefault()
      // }}
      // onDrop={event => {
      //   const position = engine.getRelativeMousePoint(event)
      //   const nodeLink = model.getNodeLinkAtPosition(position)
      //   const dropData: CommandData = JSON.parse(event.dataTransfer.getData('storm-diagram-node'))
      //   if (nodeLink instanceof DefaultNodeModel) {
      //     const dataClone: ExecutionWrapper[] = cloneDeep(state.data)
      //     const stepIndex = dataClone.findIndex(item => item.step?.identifier === nodeLink.getIdentifier())
      //     const removed = dataClone.splice(stepIndex, 1)
      //     removed.push({
      //       step: {
      //         type: dropData.value,
      //         name: dropData.text,
      //         identifier: uuid(),
      //         spec: {}
      //       }
      //     })
      //     dataClone.splice(stepIndex, 0, {
      //       parallel: removed
      //     })
      //     setState(prevState => ({
      //       ...prevState,
      //       isDrawerOpen: false,
      //       data: dataClone,
      //       isAddStepOverride: false,
      //       isParallelNodeClicked: false
      //     }))
      //   } else if (nodeLink instanceof DefaultLinkModel) {
      //     const dataClone: ExecutionWrapper[] = cloneDeep(state.data)
      //     const stepIndex = dataClone.findIndex(
      //       item =>
      //         item.step?.identifier === (nodeLink.getSourcePort().getNode() as DefaultNodeModel).getIdentifier()
      //     )
      //     dataClone.splice(stepIndex + 1, 0, {
      //       step: {
      //         type: dropData.value,
      //         name: dropData.text,
      //         identifier: uuid(),
      //         spec: {}
      //       }
      //     })
      //     setState(prevState => ({
      //       ...prevState,
      //       isDrawerOpen: false,
      //       data: dataClone,
      //       isAddStepOverride: false,
      //       isParallelNodeClicked: false
      //     }))
      //   }
      // }}
    >
      <div className={css.canvas} ref={canvasRef}>
        {state.isRollback && (
          <Text font={{ size: 'medium' }} className={css.rollbackBanner}>
            {i18n.rollback}
          </Text>
        )}
        <CanvasWidget
          engine={engine}
          isRollback={hasRollback}
          rollBackProps={{
            style: { top: 62 },
            active: state.isRollback ? StepsType.Rollback : StepsType.Normal
          }}
        />
        <CanvasButtons engine={engine} tooltipPosition="left" />
        <DynamicPopover
          className={css.addStepPopover}
          darkMode={true}
          render={renderPopover}
          bind={setDynamicPopoverHandler}
        />
      </div>
    </div>
  )
}
const ExecutionGraph = React.forwardRef(ExecutionGraphRef)
export default ExecutionGraph
