import React, { useEffect } from 'react'
// import { cloneDeep } from 'lodash-es'
import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import { Button, Text } from '@wings-software/uikit'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { useToaster } from '@common/exports'
import { ExecutionStepModel } from './ExecutionStepModel'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { getStageFromPipeline } from '../StageBuilder/StageBuilderUtil'
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
  getServiceState,
  StepType,
  getServiceFromNode,
  STATIC_SERVICE_GROUP_NAME
} from './ExecutionGraphUtil'
import { EmptyStageName } from '../PipelineConstants'
import { StepType as StepsStepType } from '../../PipelineSteps/PipelineStepInterface'
import { DrawerTypes } from '../PipelineContext/PipelineActions'
import {
  CanvasWidget,
  createEngine,
  DefaultLinkEvent,
  DefaultNodeEvent,
  DiagramType,
  Event,
  StepGroupNodeLayerModel,
  StepGroupNodeLayerOptions,
  StepsType
} from '../../Diagram'
import { CanvasButtons } from '../../CanvasButtons/CanvasButtons'
import css from './ExecutionGraph.module.scss'

interface PopoverData {
  event?: DefaultNodeEvent
  isParallelNodeClicked?: boolean
  onPopoverSelection?: (isStepGroup: boolean, isParallelNodeClicked: boolean, event?: DefaultNodeEvent) => void
}

const renderPopover = ({ onPopoverSelection, isParallelNodeClicked = false, event }: PopoverData): JSX.Element => {
  return (
    <>
      <div>
        <Button
          minimal
          icon="Edit"
          text={i18n.addStep}
          onClick={() => onPopoverSelection?.(false, isParallelNodeClicked, event)}
        />
      </div>
      <div>
        <Button
          minimal
          icon="step-group"
          text={i18n.addStepGroup}
          onClick={() => onPopoverSelection?.(true, isParallelNodeClicked, event)}
        />
      </div>
    </>
  )
}

const ExecutionGraph = (): JSX.Element => {
  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const [state, setState] = React.useState<ExecutionGraphState>({
    stepsData: { steps: [], rollbackSteps: [], metadata: '' },
    stepStates: new Map<string, StepState>(),
    servicesData: [],
    isRollback: false
  })

  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<PopoverData> | undefined
  >()

  const { showError } = useToaster()

  const {
    state: {
      pipeline,
      isInitialized,
      pipelineView: {
        splitViewData: { selectedStageId, stageType },
        isSplitViewOpen,
        isDrawerOpened
      },
      pipelineView
    },
    stagesMap,
    stepsFactory,
    updatePipelineView,
    updatePipeline
  } = React.useContext(PipelineContext)

  //1) setup the diagram engine
  const engine = React.useMemo(() => createEngine(), [])

  //2) setup the diagram model
  const model = React.useMemo(() => new ExecutionStepModel(), [])

  const onPopoverSelection = (isStepGroup: boolean, isParallelNodeClicked: boolean, event?: DefaultNodeEvent): void => {
    if (!isStepGroup && event) {
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: true,
        drawerData: {
          type: DrawerTypes.AddStep,
          data: {
            paletteData: {
              entity: event.entity,
              isAddStepOverride: true,
              isRollback: state.isRollback,
              isParallelNodeClicked
            }
          }
        }
      })
    } else if (event?.entity) {
      addStepOrGroup(
        event.entity,
        state.stepsData,
        {
          stepGroup: {
            name: EmptyStageName,
            identifier: generateRandomString(EmptyStageName),
            steps: []
          }
        },
        isParallelNodeClicked,
        state.isRollback
      )
      updatePipeline(pipeline)
    }
    dynamicPopoverHandler?.hide()
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
                    updatePipeline(pipeline)
                  }
                } else if (current.node.parallel && current.node.parallel.length > 0) {
                  current.node.parallel.push(dropNode)
                  updatePipeline(pipeline)
                }
              } else {
                addStepOrGroup(eventTemp.entity, state.stepsData, dropNode, false, state.isRollback)
                updatePipeline(pipeline)
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
      const stepState = state.stepStates.get(event.entity.getIdentifier())
      dynamicPopoverHandler?.hide()
      const nodeRender = document.querySelector(`[data-nodeid="${eventTemp.entity.getID()}"]`)
      const layer = eventTemp.entity.getParent()
      if (eventTemp.entity.getType() === DiagramType.CreateNew && nodeRender) {
        // if Node is in Step Group then directly show Add Steps
        if (layer instanceof StepGroupNodeLayerModel) {
          if ((layer.getOptions() as StepGroupNodeLayerOptions).identifier === STATIC_SERVICE_GROUP_NAME) {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: {
                type: DrawerTypes.ConfigureService,
                data: {
                  stepConfig: {
                    node: {
                      type: StepsStepType.Dependency,
                      name: name,
                      identifier: generateRandomString(name)
                    },
                    addOrEdit: 'add',
                    isStepGroup: false
                  }
                }
              }
            })
          } else {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: {
                type: DrawerTypes.AddStep,
                data: {
                  paletteData: {
                    isAddStepOverride: false,
                    isRollback: state.isRollback,
                    entity: eventTemp.entity,
                    isParallelNodeClicked: false
                  }
                }
              }
            })
          }
        } else {
          dynamicPopoverHandler?.show(
            nodeRender,
            {
              event,
              isParallelNodeClicked: false,
              onPopoverSelection
            },
            { useArrows: true, darkMode: true }
          )
        }
      } else if (stepState && stepState.isStepGroupCollapsed) {
        const stepStates = state.stepStates.set(event.entity.getIdentifier(), {
          ...stepState,
          isStepGroupCollapsed: !stepState.isStepGroupCollapsed
        })
        setState(prev => ({ ...prev, stepStates }))
      } else {
        let node
        if (stepState?.stepType === StepType.STEP) {
          node = getStepFromNode(state.stepsData, eventTemp.entity).node
        } else if (stepState?.stepType === StepType.SERVICE) {
          node = getServiceFromNode(state.servicesData, eventTemp.entity).node
        }
        /* istanbul ignore else */ if (node) {
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: {
              type: stepState?.stepType === StepType.STEP ? DrawerTypes.StepConfig : DrawerTypes.ConfigureService,
              data: {
                stepConfig: {
                  node: node,
                  isStepGroup: false,
                  addOrEdit: 'edit'
                }
              }
            }
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
        updatePipeline(pipeline)
      }
    },
    [Event.AddParallelNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      const layer = eventTemp.entity.getParent()
      if (layer instanceof StepGroupNodeLayerModel) {
        const node = getStepFromNode(state.stepsData, eventTemp.entity).node
        if (node) {
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: {
              type: DrawerTypes.AddStep,
              data: {
                paletteData: {
                  isAddStepOverride: true,
                  isRollback: state.isRollback,
                  entity: eventTemp.entity,
                  isParallelNodeClicked: true
                }
              }
            }
          })
        }
      } else {
        /* istanbul ignore else */ if (eventTemp.target) {
          dynamicPopoverHandler?.show(
            eventTemp.target,
            {
              event,
              isParallelNodeClicked: true,
              onPopoverSelection
            },
            { useArrows: true, darkMode: true },
            eventTemp.callback
          )
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
        dynamicPopoverHandler?.show(
          linkRender,
          {
            event,
            isParallelNodeClicked: false,
            onPopoverSelection
          },
          { useArrows: true, darkMode: true }
        )
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
              updatePipeline(pipeline)
            }
          }
        }
      }
    }
  }

  const layerListeners: BaseModelListener = {
    [Event.StepGroupCollapsed]: (event: any) => {
      const stepState = state.stepStates.get(event.entity.getIdentifier())
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (stepState) {
        const stepStates = state.stepStates.set(event.entity.getIdentifier(), {
          ...stepState,
          isStepGroupCollapsed: !stepState.isStepGroupCollapsed
        })
        setState(prev => ({ ...prev, stepStates }))
      }
    },
    [Event.StepGroupClicked]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      const node = getStepFromNode(state.stepsData, eventTemp.entity).node
      if (node) {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: DrawerTypes.StepConfig,
            data: {
              stepConfig: {
                node: node,
                isStepGroup: true,
                addOrEdit: 'edit'
              }
            }
          }
        })
      }
    },
    [Event.RollbackClicked]: (event: any) => {
      const stepState = state.stepStates.get(event.entity.getIdentifier())
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (stepState) {
        const stepStates = state.stepStates.set(event.entity.getIdentifier(), {
          ...stepState,
          isStepGroupRollback: !stepState.isStepGroupRollback
        })
        setState(prev => ({ ...prev, stepStates }))
      }
    },
    [Event.AddParallelNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (eventTemp.target) {
        dynamicPopoverHandler?.show(
          eventTemp.target,
          {
            event,
            isParallelNodeClicked: true,
            onPopoverSelection
          },
          { useArrows: true, darkMode: true },
          eventTemp.callback
        )
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
    stagesMap[stageType as string].type,
    state.isRollback ? state.stepsData.rollbackSteps || [] : state.stepsData.steps || [],
    state.stepStates,
    state.servicesData,
    stepsFactory,
    { nodeListeners, linkListeners, layerListeners },
    state.isRollback
  )

  // load model into engine
  engine.setModel(model)

  useEffect(() => {
    if (isInitialized && selectedStageId && isSplitViewOpen) {
      const { stage: data } = getStageFromPipeline(pipeline, selectedStageId)
      if (data?.stage?.spec?.execution) {
        if (!data.stage.spec.execution.steps) {
          data.stage.spec.execution.steps = []
        }
        if (!data.stage.spec.execution.rollbackSteps && stageType === 'Deployment') {
          data.stage.spec.execution.rollbackSteps = []
        }
        if (!data.stage.spec.dependencies) {
          data.stage.spec.dependencies = []
        }
        getStepsState(data.stage.spec.execution, state.stepStates)
        getServiceState(data.stage.spec.dependencies, state.stepStates)
        setState(prevState => ({
          ...prevState,
          stepsData: data.stage.spec.execution,
          stepStates: state.stepStates,
          servicesData: data.stage.spec.dependencies
        }))
      } else if (data?.stage) {
        if (!data.stage.spec) {
          data.stage.spec = {}
        }
        data.stage.spec = {
          ...data.stage.spec
          // execution: {
          //   steps: [],
          //   rollbackSteps: []
          // }
        }

        updatePipeline(pipeline)
      }
    }
  }, [selectedStageId, pipeline, isSplitViewOpen, updatePipeline, isInitialized])

  useEffect(() => {
    const openExecutionStrategy = stageType ? stagesMap[stageType].openExecutionStrategy : true
    /* istanbul ignore else */ if (openExecutionStrategy) {
      const { stage: data } = getStageFromPipeline(pipeline, selectedStageId as string)
      if (data?.stage) {
        if (!data?.stage?.spec?.execution) {
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: {
              type: DrawerTypes.ExecutionStrategy
            }
          })
        }
      }
    }
  }, [])

  React.useEffect(() => {
    if (!isDrawerOpened) {
      model.clearSelection()
    }
  }, [isDrawerOpened, model])

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
          isRollback={stageType === 'Deployment'}
          rollBackProps={{
            style: { top: 62 },
            active: state.isRollback ? StepsType.Rollback : StepsType.Normal
          }}
        />
        <CanvasButtons engine={engine} />
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

export default ExecutionGraph
