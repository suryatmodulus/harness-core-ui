/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { cloneDeep, set, isEmpty } from 'lodash-es'
import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import { Button, ButtonVariation, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { useToaster } from '@common/exports'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StepActions } from '@common/constants/TrackingConstants'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { PipelineOrStageStatus } from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import ConditionalExecutionTooltip from '@pipeline/components/ConditionalExecutionToolTip/ConditionalExecutionTooltip'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type {
  ExecutionElementConfig,
  ExecutionWrapperConfig,
  StageElementConfig,
  StepElementConfig
} from 'services/cd-ng'
import type { DependencyElement } from 'services/ci'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
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
  updateDependenciesState,
  applyExistingStates,
  ExecutionWrapper,
  STATIC_SERVICE_GROUP_NAME
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

interface Labels {
  addStep?: string
  addStepGroup?: string
  useTemplate?: string
}

interface PopoverData {
  event?: DefaultNodeEvent
  isParallelNodeClicked?: boolean
  labels?: Labels
  onPopoverSelection?: (
    isStepGroup: boolean,
    isParallelNodeClicked: boolean,
    event?: DefaultNodeEvent,
    isTemplate?: boolean
  ) => void
  isHoverView?: boolean
  data?: ExecutionWrapper
}

const renderPopover = ({
  onPopoverSelection,
  isParallelNodeClicked = false,
  event,
  labels,
  isHoverView,
  data
}: PopoverData): JSX.Element => {
  if (isHoverView && !!(data as StepElementConfig)?.when) {
    return (
      <HoverCard>
        <ConditionalExecutionTooltip
          status={(data as StepElementConfig)?.when?.stageStatus}
          condition={(data as StepElementConfig)?.when?.condition}
          mode={Modes.STEP}
        />
      </HoverCard>
    )
  } else if (labels) {
    return (
      <>
        <Layout.Vertical className={css.addPopover} spacing="small" padding="small">
          {labels.addStep && (
            <Button
              minimal
              variation={ButtonVariation.PRIMARY}
              icon="Edit"
              text={labels.addStep}
              onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event)}
            />
          )}
          {labels.addStepGroup && (
            <Button
              minimal
              variation={ButtonVariation.PRIMARY}
              icon="step-group"
              text={labels.addStepGroup}
              onClick={() => onPopoverSelection?.(true, isParallelNodeClicked, event)}
            />
          )}
          {labels.useTemplate && (
            <Button
              minimal
              variation={ButtonVariation.PRIMARY}
              icon="template-library"
              text={labels.useTemplate}
              onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event, true)}
            />
          )}
        </Layout.Vertical>
      </>
    )
  } else {
    return <></>
  }
}

export interface ExecutionGraphAddStepEvent {
  entity: DefaultNodeModel<DefaultNodeModelGenerics> //NOTE: this is a graph element
  isParallel: boolean
  stepsMap: Map<string, StepState>
  isRollback: boolean
  parentIdentifier?: string
  isTemplate?: boolean
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

export interface ExecutionGraphProp<T extends StageElementConfig> {
  /*Allow adding group*/
  allowAddGroup?: boolean
  /*Hide or show rollback button*/
  hasRollback?: boolean
  /*Set to true if  model has spec.serviceDependencies array */
  hasDependencies?: boolean
  isReadonly: boolean
  stepsFactory: AbstractStepFactory // REQUIRED (pass to addUpdateGraph)
  stage: StageElementWrapper<T>
  originalStage?: StageElementWrapper<T>
  updateStage: (stage: StageElementWrapper<T>) => void
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
  templateTypes: { [key: string]: string }
}

function ExecutionGraphRef<T extends StageElementConfig>(
  props: ExecutionGraphProp<T>,
  ref: ExecutionGraphForwardRef
): JSX.Element {
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
    pathToStage,
    templateTypes
  } = props

  const templatesEnabled: boolean = useFeatureFlag(FeatureFlag.NG_TEMPLATES)

  // NOTE: we are using ref as DynamicPopover use memo
  const stageCloneRef = React.useRef<StageElementWrapper<T>>({})
  stageCloneRef.current = cloneDeep(stage)
  const { trackEvent } = useTelemetry()

  const updateStageWithNewData = (stateToApply: ExecutionGraphState): void => {
    set(stageCloneRef.current, 'stage.spec.execution', stateToApply.stepsData)
    set(stageCloneRef.current, 'stage.spec.serviceDependencies', stateToApply.dependenciesData)
    updateStage(stageCloneRef.current)
  }

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
    stepsData: { steps: [], rollbackSteps: [] },
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

  const onPopoverSelection = (
    isStepGroup: boolean,
    isParallelNodeClicked: boolean,
    event?: DefaultNodeEvent,
    isTemplate = false
  ): void => {
    if (!isStepGroup && event) {
      addStep({
        entity: event.entity,
        isRollback: state.isRollback,
        stepsMap: state.states,
        isParallel: isParallelNodeClicked,
        isTemplate: isTemplate
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
      stepGroupUpdated(node)
      updateStageWithNewData(state)
    }
    dynamicPopoverHandler?.hide()
  }

  const handleAdd = (
    isParallel: boolean,
    el: Element,
    showStepGroup: boolean,
    event?: DefaultNodeEvent | undefined,
    onHide?: () => void | undefined
  ): void => {
    const options: Labels = { addStep: getString('addStep') }
    if (allowAddGroup && showStepGroup) {
      options.addStepGroup = getString('addStepGroup')
    }
    if (templatesEnabled) {
      options.useTemplate = getString('common.useTemplate')
    }
    if (Object.keys(options).length === 1 && options.addStep) {
      onPopoverSelection(false, isParallel, event)
    } else {
      dynamicPopoverHandler?.show(
        el,
        {
          event,
          isParallelNodeClicked: isParallel,
          onPopoverSelection,
          labels: options
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
        const dropNode = drop.node as ExecutionWrapperConfig
        const current = getStepFromNode(state.stepsData, eventTemp.entity, true, true) as {
          node: ExecutionWrapperConfig
          parent?: ExecutionWrapperConfig[]
        }
        const skipFlattenIfSameParallel = drop.parent === current.node?.parallel
        // Check Drop Node and Current node should not be same
        if (event.node.identifier !== eventTemp.entity.getIdentifier() && dropNode) {
          if (dropNode?.stepGroup && eventTemp.entity.getParent() instanceof StepGroupNodeLayerModel) {
            showError(getString('stepGroupInAnotherStepGroup'), undefined, 'pipeline.setgroup.error')
          } else {
            const isRemove = removeStepOrGroup(state, dropEntity, skipFlattenIfSameParallel)
            if (isRemove) {
              if (current.node) {
                if (current.parent && (current.node.step || current.node.stepGroup)) {
                  const index = current.parent?.indexOf(current.node) ?? -1
                  if (index > -1) {
                    // Remove current Stage also and make it parallel
                    current.parent?.splice(index, 1, { parallel: [current.node, dropNode] })
                    updateStageWithNewData(state)
                  }
                } else if (current.node.parallel && (current.node.parallel?.length || 0) > 0) {
                  current.node.parallel?.push?.(dropNode)
                  updateStageWithNewData(state)
                }
              } else {
                addStepOrGroup(eventTemp.entity, state.stepsData, dropNode, false, state.isRollback)
                updateStageWithNewData(state)
              }
            }
          }
        }
      }
    }
  }

  const mouseEnterNodeListener = (event: any) => {
    const eventTemp = event as DefaultNodeEvent
    eventTemp.stopPropagation()
    dynamicPopoverHandler?.hide()
    const node = getStepFromNode(state.stepsData, eventTemp.entity).node as StepElementConfig
    if (node?.when) {
      const { stageStatus, condition } = node.when
      if (stageStatus === PipelineOrStageStatus.SUCCESS && isEmpty(condition)) {
        return
      }
      dynamicPopoverHandler?.show(
        eventTemp.target,
        {
          event: eventTemp,
          isHoverView: true,
          data: node
        },
        { useArrows: true, darkMode: false, fixedPosition: false, placement: 'top' }
      )
    }
  }

  const mouseLeaveNodeListener = (event: any) => {
    const eventTemp = event as DefaultNodeEvent
    eventTemp.stopPropagation()
  }

  const nodeListeners: NodeModelListener = {
    [Event.ClickNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      const stepState = state.states.get(event.entity.getIdentifier())
      dynamicPopoverHandler?.hide()
      const nodeRender = document.querySelector(`[data-nodeid="${eventTemp.entity.getID()}"]`)
      const layer = eventTemp.entity.getParent()
      const parentIdentifier = (event.entity.getParent().getOptions() as StepGroupNodeLayerOptions).identifier
      if (eventTemp.entity.getType() === DiagramType.CreateNew && nodeRender) {
        if (parentIdentifier === STATIC_SERVICE_GROUP_NAME) {
          addStep({
            entity: event.entity,
            isRollback: state.isRollback,
            isParallel: false,
            stepsMap: state.states,
            parentIdentifier: (event.entity.getParent().getOptions() as StepGroupNodeLayerOptions).identifier
          })
        } else {
          handleAdd(false, nodeRender, !(layer instanceof StepGroupNodeLayerModel), event)
        }
      } else if (stepState && stepState.isStepGroupCollapsed) {
        const stepStates = state.states.set(event.entity.getIdentifier(), {
          ...stepState,
          isStepGroupCollapsed: !stepState.isStepGroupCollapsed
        })
        setState(prev => ({ ...prev, states: stepStates }))
      } else {
        let node: ExecutionWrapper | DependencyElement | undefined
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

          onSelectStep?.((node as DependencyElement).identifier)
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
        updateStageWithNewData(state)
        trackEvent(StepActions.DeleteStep, { type: eventTemp.entity.getType() || '' })
      }
    },
    [Event.AddParallelNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      const layer = eventTemp.entity.getParent()
      if (layer instanceof StepGroupNodeLayerModel) {
        const node = getStepFromNode(state.stepsData, eventTemp.entity).node
        if (node) {
          handleAdd(true, eventTemp.target, false, event, eventTemp.callback)
        }
      } else {
        /* istanbul ignore else */ if (eventTemp.target) {
          handleAdd(true, eventTemp.target, true, event, eventTemp.callback)
        }
      }
    },
    [Event.DropLinkEvent]: dropNodeListener,
    [Event.MouseEnterNode]: mouseEnterNodeListener,
    [Event.MouseLeaveNode]: mouseLeaveNodeListener
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
        sourceLayer === targetLayer &&
        linkRender
      ) {
        handleAdd(false, linkRender, false, event)
      } else if (linkRender) {
        handleAdd(false, linkRender, true, event)
      }
    },
    [Event.DropLinkEvent]: (event: any) => {
      const eventTemp = event as DefaultLinkEvent
      eventTemp.stopPropagation()
      if (event.node?.identifier && event.node?.id) {
        const dropEntity = model.getNodeFromId(event.node.id)
        if (dropEntity) {
          const dropNode = getStepFromNode(state.stepsData, dropEntity, true).node as ExecutionWrapperConfig
          if (dropNode?.stepGroup && isLinkUnderStepGroup(eventTemp.entity)) {
            showError(getString('stepGroupInAnotherStepGroup'), undefined, 'pipeline.setgroup.error')
          } else {
            const isRemove = removeStepOrGroup(state, dropEntity)
            if (isRemove && dropNode) {
              addStepOrGroup(eventTemp.entity, state.stepsData, dropNode, false, state.isRollback)
              updateStageWithNewData(state)
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
        handleAdd(true, eventTemp.target, true, event, eventTemp.callback)
      }
    },
    [Event.DropLinkEvent]: dropNodeListener,
    [Event.MouseEnterNode]: mouseEnterNodeListener,
    [Event.MouseLeaveNode]: mouseLeaveNodeListener
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
    servicesData: state.dependenciesData || [],
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
    errorMap,
    templateTypes
  })

  // load model into engine
  engine.setModel(model)

  useEffect(() => {
    if (stageCloneRef.current?.stage?.spec?.execution) {
      const newStateMap = new Map<string, StepState>()
      getStepsState(stageCloneRef.current.stage.spec.execution, newStateMap)
      applyExistingStates(newStateMap, state.states)
      if (hasDependencies && (stageCloneRef.current?.stage as BuildStageElementConfig)?.spec?.serviceDependencies) {
        getDependenciesState(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (stageCloneRef.current.stage as BuildStageElementConfig).spec!.serviceDependencies!,
          newStateMap
        )
        applyExistingStates(newStateMap, state.states)
        if ((originalStage?.stage as BuildStageElementConfig)?.spec?.serviceDependencies) {
          updateDependenciesState(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (originalStage!.stage as BuildStageElementConfig)!.spec!.serviceDependencies!,
            newStateMap
          )
        }
      }
      if (originalStage?.stage?.spec?.execution) {
        updateStepsState(originalStage.stage.spec.execution, newStateMap)
      }

      setState(prevState => ({
        ...prevState,
        states: newStateMap
      }))
    }
  }, [originalStage, stage, ref])

  useEffect(() => {
    if (stageCloneRef.current?.stage?.spec?.execution) {
      setState(prevState => ({
        ...prevState,
        stepsData: (stageCloneRef.current.stage as BuildStageElementConfig).spec?.execution as ExecutionElementConfig,
        dependenciesData: (stageCloneRef.current.stage as BuildStageElementConfig).spec?.serviceDependencies || []
      }))
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

/**
 * As per https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref/58473012
 * Forward Ref components do not support generic out of the box
 */
const ExecutionGraph = React.forwardRef(ExecutionGraphRef) as <T extends StageElementConfig>(
  props: ExecutionGraphProp<T> & { ref?: ExecutionGraphForwardRef }
) => React.ReactElement
export default ExecutionGraph
