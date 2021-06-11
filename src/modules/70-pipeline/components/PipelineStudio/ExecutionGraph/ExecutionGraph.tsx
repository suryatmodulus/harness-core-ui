import React, { useEffect } from 'react'
import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import { Button, Layout, Text } from '@wings-software/uicore'
import type { StageElementWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { useToaster } from '@common/exports'
import type { ExecutionWrapper } from 'services/cd-ng'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { ExecutionStepModel, GridStyleInterface } from './ExecutionStepModel'
import { StepType as PipelineStepType } from '../../PipelineSteps/PipelineStepInterface'
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
  getDefaultDependencyServiceState,
  updateStepsState,
  updateDependenciesState
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
  labels: {
    addStep: string
    addStepGroup: string
  }
  onPopoverSelection?: (isStepGroup: boolean, isParallelNodeClicked: boolean, event?: DefaultNodeEvent) => void
}

const renderPopover = ({
  onPopoverSelection,
  isParallelNodeClicked = false,
  event,
  labels
}: PopoverData): JSX.Element => {
  return (
    <>
      <Layout.Vertical spacing="small" padding="small">
        <Button
          minimal
          icon="Edit"
          text={labels.addStep}
          onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event)}
          withoutBoxShadow
        />
        <Button
          minimal
          icon="step-group"
          text={labels.addStepGroup}
          onClick={() => onPopoverSelection?.(true, isParallelNodeClicked, event)}
          withoutBoxShadow
        />
      </Layout.Vertical>
    </>
  )
}

export interface ExecutionGraphAddStepEvent {
  entity: DefaultNodeModel<DefaultNodeModelGenerics> //NOTE: this is a graph element
  isParallel: boolean
  stepsMap: Map<string, StepState>
  isRollback: boolean
  parentIdentifier?: string
}

export interface ExecutionGraphEditStepEvent {
  /** step or dependency model */
  node: ExecutionWrapper | DependenciesWrapper
  isStepGroup: boolean
  stepsMap: Map<string, StepState>
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
  isReadonly: boolean
  stepsFactory: AbstractStepFactory // REQUIRED (pass to addUpdateGraph)
  stage: StageElementWrapper
  originalStage?: StageElementWrapper
  updateStage: (stage: StageElementWrapper) => void
  onAddStep: (event: ExecutionGraphAddStepEvent) => void
  onEditStep: (event: ExecutionGraphEditStepEvent) => void
  selectedStepId?: string
  onSelectStep?: (stepId: string) => void
  gridStyle?: GridStyleInterface
  rollBackPropsStyle?: React.CSSProperties
  rollBackBannerStyle?: React.CSSProperties
  canvasButtonsLayout?: 'horizontal' | 'vertical'
  canvasButtonsTooltipPosition?: 'top' | 'left'
  pathToStage: string
}

function ExecutionGraphRef(props: ExecutionGraphProp, ref: ExecutionGraphForwardRef): JSX.Element {
  const {
    allowAddGroup = true,
    hasDependencies = false,
    hasRollback = true,
    stepsFactory,
    stage,
    originalStage,
    updateStage,
    onAddStep,
    isReadonly,
    onEditStep,
    onSelectStep,
    selectedStepId,
    gridStyle = {},
    rollBackPropsStyle = {},
    rollBackBannerStyle = {},
    canvasButtonsLayout,
    canvasButtonsTooltipPosition,
    pathToStage
  } = props

  const { getString } = useStrings()
  const { errorMap } = useValidationErrors()

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
  model.setGridStyle(gridStyle)

  const onPopoverSelection = (isStepGroup: boolean, isParallelNodeClicked: boolean, event?: DefaultNodeEvent): void => {
    if (!isStepGroup && event) {
      addStep({
        entity: event.entity,
        isRollback: state.isRollback,
        stepsMap: state.states,
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
        stepsMap: state.states,
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
          onPopoverSelection,
          labels: {
            addStep: getString('addStep'),
            addStepGroup: getString('addStepGroup')
          }
        },
        { useArrows: true, darkMode: true, fixedPosition: false },
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
        const drop = getStepFromNode(state.stepsData, dropEntity, true)
        const dropNode = drop.node
        const current = getStepFromNode(state.stepsData, eventTemp.entity, true, true)
        const skipFlattenIfSameParallel = drop.parent === current.node?.parallel
        // Check Drop Node and Current node should not be same
        if (event.node.identifier !== eventTemp.entity.getIdentifier() && dropNode) {
          if (dropNode?.stepGroup && eventTemp.entity.getParent() instanceof StepGroupNodeLayerModel) {
            showError(getString('stepGroupInAnotherStepGroup'))
          } else {
            const isRemove = removeStepOrGroup(state, dropEntity, skipFlattenIfSameParallel)
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
            stepsMap: state.states,
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
            stepsMap: state.states,
            addOrEdit: 'edit',
            stepType: stepState?.stepType
          })

          onSelectStep?.(node.identifier)
        }
      }
    },
    [Event.RemoveNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      dynamicPopoverHandler?.hide()
      const isRemoved = removeStepOrGroup(state, eventTemp.entity)
      if (isRemoved) {
        const newStateMap = new Map<string, StepState>([...state.states])
        newStateMap.delete(eventTemp.entity?.getIdentifier())
        setState(prevState => ({
          ...prevState,
          states: newStateMap
        }))
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
            stepsMap: state.states,
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
      if (
        sourceLayer instanceof StepGroupNodeLayerModel &&
        targetLayer instanceof StepGroupNodeLayerModel &&
        sourceLayer === targetLayer
      ) {
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
            showError(getString('stepGroupInAnotherStepGroup'))
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
          stepsMap: state.states,
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
  model.setSelectedNodeId(selectedStepId)
  model.addUpdateGraph({
    stepsData: state.isRollback ? state.stepsData.rollbackSteps || [] : state.stepsData.steps || [],
    stepStates: state.states,
    hasDependencies,
    servicesData: state.dependenciesData,
    factory: stepsFactory,
    listeners: {
      nodeListeners,
      linkListeners,
      layerListeners
    },
    isRollback: state.isRollback,
    getString,
    isReadonly,
    parentPath: `${pathToStage}.steps`,
    errorMap
  })

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
          if (originalStage?.stage?.spec?.serviceDependencies) {
            updateDependenciesState(originalStage.stage.spec.serviceDependencies, newStateMap)
          }
        }
        if (originalStage?.stage?.spec?.execution) {
          updateStepsState(originalStage.stage.spec.execution, newStateMap)
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
  }, [stage, ref, originalStage])

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
          <Text font={{ size: 'medium' }} className={css.rollbackBanner} style={rollBackBannerStyle}>
            {getString('rollbackLabel')}
          </Text>
        )}
        <CanvasWidget
          engine={engine}
          isRollback={hasRollback}
          rollBackProps={{
            style: { top: 62, ...rollBackPropsStyle },
            active: state.isRollback ? StepsType.Rollback : StepsType.Normal
          }}
        />
        <CanvasButtons
          engine={engine}
          tooltipPosition={canvasButtonsTooltipPosition}
          layout={canvasButtonsLayout}
          className={css.canvasButtons}
        />
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
