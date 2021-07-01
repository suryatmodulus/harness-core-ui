import React from 'react'
import { Intent, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { debounce, isEmpty, isNil } from 'lodash-es'
import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
import SplitPane from 'react-split-pane'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { useToaster } from '@common/components/Toaster/useToaster'
import type { StageElementWrapper, NgPipeline, PipelineInfoConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useConfirmationDialog } from '@common/exports'
import { CanvasButtons } from '@pipeline/components/CanvasButtons/CanvasButtons'
import { moveStageToFocusDelayed } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { PipelineOrStageStatus } from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import ConditionalExecutionTooltip from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/common/components/ConditionalExecutionToolTip/ConditionalExecutionTooltip'
import { useGlobalEventListener, useUpdateQueryParams } from '@common/hooks'
import {
  CanvasWidget,
  createEngine,
  DefaultLinkEvent,
  DefaultLinkModel,
  DefaultNodeEvent,
  DefaultNodeModel,
  DiagramType,
  Event
} from '../../Diagram'
import { StageBuilderModel } from './StageBuilderModel'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { EmptyStageName, MinimumSplitPaneSize, DefaultSplitPaneSize, MaximumSplitPaneSize } from '../PipelineConstants'
import {
  getNewStageFromType,
  PopoverData,
  EmptyNodeSeparator,
  StageState,
  resetDiagram,
  removeNodeFromPipeline,
  mayBeStripCIProps,
  getStageIndexFromPipeline,
  getDependantStages,
  resetServiceSelectionForStages,
  getAffectedDependentStages,
  getStageIndexByIdentifier
} from './StageBuilderUtil'
import { useStageBuilderCanvasState } from './useStageBuilderCanvasState'
import { StageList } from './views/StageList'
import { SplitViewTypes } from '../PipelineContext/PipelineActions'
import css from './StageBuilder.module.scss'

export type StageStateMap = Map<string, StageState>

declare global {
  interface WindowEventMap {
    CLOSE_CREATE_STAGE_POPOVER: CustomEvent<string>
  }
}

enum MoveDirection {
  AHEAD,
  BEHIND
}
interface MoveStageDetailsType {
  direction: MoveDirection
  event?: any
  dependentStages?: string[]
  currentStage?: unknown
  isLastAddLink?: boolean
}
const DEFAULT_MOVE_STAGE_DETAILS: MoveStageDetailsType = {
  direction: MoveDirection.AHEAD,
  event: undefined
}
const initializeStageStateMap = (pipeline: NgPipeline, mapState: StageStateMap): void => {
  /* istanbul ignore else */ if (pipeline?.stages) {
    pipeline.stages.forEach?.((node: StageElementWrapper) => {
      if (node?.stage && node.stage.name !== EmptyStageName) {
        mapState.set(node.stage.identifier, { isConfigured: true, stage: node })
      } /* istanbul ignore else */ else if (node?.parallel) {
        node.parallel.forEach?.((parallelNode: StageElementWrapper) => {
          /* istanbul ignore else */ if (parallelNode.stage && parallelNode.stage.name !== EmptyStageName) {
            mapState.set(parallelNode.stage.identifier, { isConfigured: true, stage: parallelNode })
          }
        })
      }
    })
  }
}

export const renderPopover = ({
  data,
  addStage,
  isParallel,
  isGroupStage,
  groupStages,
  groupSelectedStageId,
  onClickGroupStage,
  stagesMap,
  event,
  isStageView,
  onSubmitPrimaryData,
  renderPipelineStage,
  isHoverView
}: PopoverData): JSX.Element => {
  if (isStageView && data) {
    const stageData = {
      stage: {
        ...data.stage,
        identifier: data?.stage.name === EmptyStageName ? '' : /* istanbul ignore next */ data.stage.identifier,
        name: data?.stage.name === EmptyStageName ? '' : /* istanbul ignore next */ data.stage.name
      }
    }
    return renderPipelineStage({
      minimal: true,
      stageType: data.stage.type,
      stageProps: {
        data: stageData,
        onSubmit: (values: StageElementWrapper, identifier: string) => {
          data.stage = {
            ...values.stage
          }
          onSubmitPrimaryData?.(values, identifier)
        }
      }
    })
  } else if (isGroupStage) {
    return (
      <StageList
        stagesMap={stagesMap}
        stages={groupStages || []}
        selectedStageId={groupSelectedStageId}
        onClick={onClickGroupStage}
      />
    )
  } else if (isHoverView && !!data?.stage.when) {
    return (
      <HoverCard>
        <ConditionalExecutionTooltip
          status={data.stage.when.pipelineStatus}
          condition={data.stage.when.condition}
          mode={Modes.STAGE}
        />
      </HoverCard>
    )
  }
  return renderPipelineStage({
    isParallel,
    showSelectMenu: true,
    getNewStageFromType,
    onSelectStage: (type, stage, pipelineTemp) => {
      if (stage) {
        addStage?.(stage, isParallel, event, undefined, true, pipelineTemp)
      } else {
        addStage?.(getNewStageFromType(type as any), isParallel, event)
      }
    }
  })
}

const StageBuilder: React.FC<unknown> = (): JSX.Element => {
  const {
    state: {
      pipeline,
      pipelineView: {
        isSplitViewOpen,
        splitViewData: { type = SplitViewTypes.StageView }
      },
      pipelineView,
      isInitialized,
      selectionState: { selectedStageId }
    },
    isReadonly,
    stagesMap,
    updatePipeline,
    updatePipelineView,
    renderPipelineStage,
    getStageFromPipeline,
    setSelectedStageId,
    setSelectedSectionId
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<PopoverData> | undefined
  >()
  useGlobalEventListener('CLOSE_CREATE_STAGE_POPOVER', () => {
    dynamicPopoverHandler?.hide()
  })

  const [deleteId, setDeleteId] = React.useState<string | undefined>(undefined)
  const { showSuccess, showError } = useToaster()
  const { openDialog: confirmDeleteStage } = useConfirmationDialog({
    contentText: `${getString('stageConfirmationText', {
      name: getStageFromPipeline(deleteId || '').stage?.stage?.name || deleteId,
      id: deleteId
    })} `,
    titleText: getString('deletePipelineStage'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (deleteId && isConfirmed) {
        const isRemove = removeNodeFromPipeline(getStageFromPipeline(deleteId), pipeline, stageMap)
        const isStripped = mayBeStripCIProps(pipeline)
        if (isRemove || isStripped) {
          updatePipeline(pipeline)
          showSuccess(getString('deleteStageSuccess'))
        } else {
          showError(getString('deleteStageFailure'), undefined, 'pipeline.delete.stage.error')
        }
      }
    }
  })

  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const { updateQueryParams } = useUpdateQueryParams()
  const [stageMap, setStageMap] = React.useState(new Map<string, StageState>())
  const { errorMap } = useValidationErrors()

  const addStage = (
    newStage: StageElementWrapper,
    isParallel = false,
    event?: DefaultNodeEvent,
    insertAt?: number,
    openSetupAfterAdd?: boolean,
    pipelineTemp?: PipelineInfoConfig
  ): void => {
    if (!pipeline.stages) {
      pipeline.stages = []
    }
    if (event?.entity && event.entity instanceof DefaultLinkModel) {
      let node = event.entity.getSourcePort().getNode() as DefaultNodeModel
      let { stage } = getStageFromPipeline(node.getIdentifier())
      let next = 1
      if (!stage) {
        node = event.entity.getTargetPort().getNode() as DefaultNodeModel
        stage = getStageFromPipeline(node.getIdentifier()).stage
        next = 0
      }
      if (stage) {
        const index = pipeline.stages.indexOf(stage)
        if (index > -1) {
          pipeline.stages.splice(index + next, 0, newStage)
        }
      } else {
        // parallel next parallel case
        let nodeParallel = event.entity.getSourcePort().getNode() as DefaultNodeModel
        let nodeId = nodeParallel.getIdentifier().split(EmptyNodeSeparator)[1]
        stage = getStageFromPipeline(nodeId).parent
        next = 1
        if (!stage) {
          nodeParallel = event.entity.getTargetPort().getNode() as DefaultNodeModel
          nodeId = nodeParallel.getIdentifier().split(EmptyNodeSeparator)[2]
          const parallelOrRootLevelStage = getStageFromPipeline(nodeId)
          // NOTE: in a case of two stages parallel node is moved to root level
          // so we use parallelOrRootLevelStage.parent if defined, otherwise we use parallelOrRootLevelStage
          stage = parallelOrRootLevelStage.parent ? parallelOrRootLevelStage.parent : parallelOrRootLevelStage.stage
          next = 0
        }
        if (stage) {
          const index = pipeline.stages.indexOf(stage)
          if (index > -1) {
            pipeline.stages.splice(index + next, 0, newStage)
          }
        }
      }
    } else if (isParallel && event?.entity && event.entity instanceof DefaultNodeModel) {
      const { stage, parent } = getStageFromPipeline(event.entity.getIdentifier())
      if (stage) {
        if (parent && parent.parallel && parent.parallel.length > 0) {
          parent.parallel.push(newStage)
        } else {
          const index = pipeline.stages.indexOf(stage)
          if (index > -1) {
            pipeline.stages.splice(index, 1, {
              parallel: [stage, newStage]
            })
          }
        }
      }
    } else {
      if (!isNil(insertAt) && insertAt > -1) {
        pipeline.stages.splice(insertAt, 0, newStage)
      } else {
        pipeline.stages.push(newStage)
      }
    }
    dynamicPopoverHandler?.hide()
    model.addUpdateGraph({
      data: pipeline,
      listeners: {
        nodeListeners,
        linkListeners
      },
      stagesMap,
      getString,
      isReadonly,
      parentPath: 'pipeline.stages',
      errorMap
    })
    if (newStage.stage && newStage.stage.name !== EmptyStageName) {
      stageMap.set(newStage.stage.identifier, { isConfigured: true, stage: newStage })
    }
    engine.repaintCanvas()
    updatePipeline({ ...(pipelineTemp || {}), ...pipeline }).then(() => {
      if (openSetupAfterAdd) {
        /*updatePipelineView({
          ...pipelineView,
          isSplitViewOpen: true,
          splitViewData: {
            type: SplitViewTypes.StageView
          }
        })*/
        setSelectedStageId(newStage.stage.identifier)
        moveStageToFocusDelayed(engine, newStage.stage.identifier, true, false)
      }
    })
  }

  // open split panel if stage is selected stage exist
  // note: this open split panel when user use direct url
  React.useEffect(() => {
    if (selectedStageId && !isSplitViewOpen) {
      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: true,
        splitViewData: { type: SplitViewTypes.StageView }
      })
    }

    if (!selectedStageId && isSplitViewOpen) {
      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: false,
        splitViewData: {}
      })
    }
  }, [selectedStageId, isSplitViewOpen])

  React.useEffect(() => {
    if (isInitialized && !isSplitViewOpen) {
      const map = new Map<string, StageState>()
      initializeStageStateMap(pipeline, map)
      setStageMap(map)
    }
  }, [isInitialized, pipeline, isSplitViewOpen])

  // updates stages when stage is dragged to add stage link
  const updateStageOnAddLink = (event: any, dropNode: StageElementWrapper, current: any): void => {
    // Check Drop Node and Current node should not be same
    if (event.node.identifier !== event.entity.getIdentifier()) {
      const isRemove = removeNodeFromPipeline(getStageFromPipeline(event.node.identifier), pipeline, stageMap, false)
      if (isRemove && dropNode) {
        if (!current.parent && current.stage) {
          const index = pipeline.stages?.indexOf(current.stage) ?? -1
          if (index > -1) {
            // Remove current Stage also and make it parallel
            pipeline?.stages?.splice(index, 1)
            // Now make a parallel stage and update at the same place
            addStage(
              {
                parallel: [current.stage, dropNode]
              },
              false,
              event,
              index,
              false
            )
          }
        } else {
          addStage(dropNode, current?.parent?.parallel?.length > 0, event, undefined, false)
        }
      }
    }
  }

  React.useEffect(() => {
    setDeleteId(deleteId)
  }, [deleteId])

  const nodeListeners: NodeModelListener = {
    // Can not remove this Any because of React Diagram Issue
    [Event.ClickNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      dynamicPopoverHandler?.hide()

      /* istanbul ignore else */ if (eventTemp.entity) {
        if (eventTemp.entity.getType() === DiagramType.CreateNew) {
          /*updatePipelineView({
            ...pipelineView,
            isSplitViewOpen: false,
            splitViewData: {}
          })*/
          setSelectedStageId(undefined)
          setSelectedSectionId(undefined)
          dynamicPopoverHandler?.show(
            `[data-nodeid="${eventTemp.entity.getID()}"]`,
            {
              addStage,
              isStageView: false,
              renderPipelineStage,
              stagesMap
            },
            { useArrows: true, darkMode: false, fixedPosition: false }
          )
        } else if (eventTemp.entity.getType() === DiagramType.GroupNode && selectedStageId) {
          const parent = getStageFromPipeline(eventTemp.entity.getIdentifier()).parent
          /* istanbul ignore else */ if (parent?.parallel) {
            dynamicPopoverHandler?.show(
              `[data-nodeid="${eventTemp.entity.getID()}"]`,
              {
                isGroupStage: true,
                groupSelectedStageId: selectedStageId,
                isStageView: false,
                groupStages: parent.parallel,
                onClickGroupStage: (stageId: string) => {
                  dynamicPopoverHandler?.hide()
                  /*updatePipelineView({
                    ...pipelineView,
                    isSplitViewOpen: true,
                    splitViewData: { type: SplitViewTypes.StageView }
                  })*/
                  setSelectedStageId(stageId)
                  moveStageToFocusDelayed(engine, stageId, true, false)
                },
                stagesMap,
                renderPipelineStage
              },
              { useArrows: false, darkMode: false, fixedPosition: false }
            )
          }
        } /* istanbul ignore else */ else if (eventTemp.entity.getType() !== DiagramType.StartNode) {
          const data = getStageFromPipeline(eventTemp.entity.getIdentifier()).stage
          if (isSplitViewOpen && data?.stage?.identifier) {
            if (data?.stage?.name === EmptyStageName) {
              // TODO: check if this is unused code
              dynamicPopoverHandler?.show(
                `[data-nodeid="${eventTemp.entity.getID()}"]`,
                {
                  isStageView: true,
                  data,
                  onSubmitPrimaryData: (node, identifier) => {
                    updatePipeline(pipeline)
                    stageMap.set(node.stage.identifier, { isConfigured: true, stage: node })
                    dynamicPopoverHandler.hide()
                    resetDiagram(engine)
                    /*updatePipelineView({
                      ...pipelineView,
                      isSplitViewOpen: true,
                      splitViewData: {
                        type: SplitViewTypes.StageView
                      }
                    })*/
                    setSelectedStageId(identifier)
                  },
                  stagesMap,
                  renderPipelineStage
                },
                { useArrows: false, darkMode: false, fixedPosition: false }
              )
              /*updatePipelineView({
                ...pipelineView,
                isSplitViewOpen: false,
                splitViewData: {}
              })*/
              setSelectedStageId(undefined)
              setSelectedSectionId(undefined)
            } else {
              /*updatePipelineView({
                ...pipelineView,
                isSplitViewOpen: true,
                splitViewData: {
                  type: SplitViewTypes.StageView
                }
              })*/
              setSelectedStageId(data?.stage?.identifier)
              moveStageToFocusDelayed(engine, data?.stage?.identifier, true, false)
            }
          } /* istanbul ignore else */ else if (!isSplitViewOpen) {
            if (stageMap.has(data?.stage?.identifier)) {
              /*updatePipelineView({
                ...pipelineView,
                isSplitViewOpen: true,
                splitViewData: {
                  type: SplitViewTypes.StageView
                }
              })*/
              setSelectedStageId(data?.stage?.identifier)
              moveStageToFocusDelayed(engine, data?.stage?.identifier, true, false)
            } else {
              // TODO: check if this is unused code
              dynamicPopoverHandler?.show(
                `[data-nodeid="${eventTemp.entity.getID()}"]`,
                {
                  isStageView: true,
                  data,
                  onSubmitPrimaryData: (node, identifier) => {
                    updatePipeline(pipeline)
                    stageMap.set(node.stage.identifier, { isConfigured: true, stage: node })
                    dynamicPopoverHandler.hide()
                    resetDiagram(engine)
                    /*updatePipelineView({
                      ...pipelineView,
                      isSplitViewOpen: true,
                      splitViewData: {
                        type: SplitViewTypes.StageView
                      }
                    })*/
                    setSelectedStageId(identifier)
                  },
                  stagesMap,
                  renderPipelineStage
                },
                { useArrows: false, darkMode: false, fixedPosition: false }
              )
            }
          }
        }
      }
    },
    // Can not remove this Any because of React Diagram Issue
    [Event.RemoveNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      const stageIdToBeRemoved = eventTemp.entity.getIdentifier()
      setDeleteId(stageIdToBeRemoved)
      confirmDeleteStage()
    },
    [Event.AddParallelNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      // dynamicPopoverHandler?.hide()

      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: false,
        splitViewData: {}
      })
      setSelectedStageId(undefined)
      setSelectedSectionId(undefined)

      if (eventTemp.entity) {
        dynamicPopoverHandler?.show(
          `[data-nodeid="${eventTemp.entity.getID()}"] [data-nodeid="add-parallel"]`,
          {
            addStage,
            isParallel: true,
            isStageView: false,
            event: eventTemp,
            stagesMap,
            renderPipelineStage
          },
          { useArrows: false, darkMode: false, fixedPosition: false },
          eventTemp.callback
        )
      }
    },
    [Event.DropLinkEvent]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (event.node?.identifier) {
        const dropNode = getStageFromPipeline(event.node.identifier).stage
        const current = getStageFromPipeline(eventTemp.entity.getIdentifier())
        const dependentStages = getDependantStages(pipeline, dropNode as StageElementWrapper)
        const parentStageId = dropNode?.stage?.spec?.serviceConfig?.useFromStage?.stage
        if (parentStageId?.length) {
          const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)

          const { index: parentIndex } = getStageIndexFromPipeline(pipeline, parentStageId)
          if (stageIndex <= parentIndex) {
            setMoveStageDetails({
              event,
              direction: MoveDirection.AHEAD,
              currentStage: current
            })
            confirmMoveStage()
            return
          }

          return
        } else if (dependentStages?.length) {
          let finalDropIndex = -1
          let firstDependentStageIndex
          const {
            stageIndex: dependentStageIndex,
            parallelStageIndex: dependentParallelIndex = -1
          } = getStageIndexByIdentifier(pipeline, dependentStages[0])

          firstDependentStageIndex = dependentStageIndex

          if (current.parent) {
            const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)
            finalDropIndex = stageIndex
            firstDependentStageIndex = dependentStageIndex
          } else if (current?.stage) {
            const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)
            finalDropIndex = stageIndex
          }

          finalDropIndex = finalDropIndex === -1 ? pipeline.stages?.length || 0 : finalDropIndex
          const stagesTobeUpdated = getAffectedDependentStages(
            dependentStages,
            finalDropIndex,
            pipeline,
            dependentParallelIndex
          )

          if (finalDropIndex >= firstDependentStageIndex) {
            setMoveStageDetails({
              event,
              direction: MoveDirection.BEHIND,
              dependentStages: stagesTobeUpdated,
              currentStage: current,
              isLastAddLink: !current.parent
            })

            confirmMoveStage()
            return
          }
        }
        updateStageOnAddLink(event, dropNode as StageElementWrapper, current)
      }
    },
    [Event.MouseEnterNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      dynamicPopoverHandler?.hide()
      const current = getStageFromPipeline(eventTemp.entity.getIdentifier())
      if (current.stage?.stage?.when) {
        const { pipelineStatus, condition } = current.stage.stage.when
        if (pipelineStatus === PipelineOrStageStatus.SUCCESS && isEmpty(condition)) {
          return
        }
        dynamicPopoverHandler?.show(
          `[data-nodeid="${eventTemp.entity.getID()}"]`,
          {
            event: eventTemp,
            data: current.stage,
            isStageView: false,
            isHoverView: true,
            stagesMap,
            renderPipelineStage
          },
          { useArrows: true, darkMode: false, fixedPosition: false }
        )
      }
    },
    [Event.MouseLeaveNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
    }
  }
  const [moveStageDetails, setMoveStageDetails] = React.useState<MoveStageDetailsType>({
    ...DEFAULT_MOVE_STAGE_DETAILS
  })

  const resetPipelineStages = (stages: StageElementWrapper[]): void => {
    updatePipeline({
      ...pipeline,
      stages
    }).then(() => {
      resetMoveStageDetails()
    })
  }

  const resetMoveStageDetails = (): void =>
    setMoveStageDetails({
      ...DEFAULT_MOVE_STAGE_DETAILS
    })

  const { openDialog: confirmMoveStage } = useConfirmationDialog({
    contentText: getString('pipeline.moveStage.description'),
    titleText: getString('pipeline.moveStage.title'),
    confirmButtonText: getString('common.move'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        const {
          event,
          dependentStages = [],
          currentStage = false,
          isLastAddLink = false
        }: { event?: any; dependentStages?: string[]; currentStage?: any; isLastAddLink?: boolean } = moveStageDetails

        const nodeIdentifier = event?.node?.identifier
        const dropNode = getStageFromPipeline(nodeIdentifier).stage

        if (currentStage?.parent?.parallel || isLastAddLink) {
          if (dropNode && event.node.identifier !== event?.entity.getIdentifier()) {
            updateStageOnAddLink(event, dropNode, currentStage)
            const updatedStages = resetServiceSelectionForStages(
              dependentStages.length ? dependentStages : [nodeIdentifier],
              pipeline
            )

            resetPipelineStages(updatedStages)
          }
        } else {
          const isRemove = removeNodeFromPipeline(getStageFromPipeline(nodeIdentifier), pipeline, stageMap, false)
          if (isRemove && dropNode) {
            addStage(dropNode, !!currentStage, event as any)
            const updatedStages = resetServiceSelectionForStages(
              dependentStages.length ? dependentStages : [nodeIdentifier],
              pipeline
            )
            resetPipelineStages(updatedStages)
          }
        }
      }
    }
  })
  const linkListeners: LinkModelListener = {
    [Event.AddLinkClicked]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      dynamicPopoverHandler?.hide()
      if (eventTemp.entity) {
        dynamicPopoverHandler?.show(
          `[data-linkid="${eventTemp.entity.getID()}"] circle`,
          {
            addStage,
            isStageView: true,
            event: eventTemp,
            stagesMap,
            renderPipelineStage
          },
          { useArrows: false, darkMode: false, fixedPosition: openSplitView }
        )
      }
    },
    [Event.DropLinkEvent]: (event: any) => {
      // console.log(event.node.identifier === event.entity.getIdentifier())
      const eventTemp = event as DefaultLinkEvent
      eventTemp.stopPropagation()
      if (event.node?.identifier) {
        const dropNode = getStageFromPipeline(event.node.identifier).stage
        const parentStageName = dropNode?.stage?.spec?.serviceConfig?.useFromStage?.stage
        const dependentStages = getDependantStages(pipeline, dropNode as StageElementWrapper)

        if (parentStageName?.length) {
          const node = event.entity.getTargetPort().getNode() as DefaultNodeModel
          const { stage } = getStageFromPipeline(node.getIdentifier())
          const dropIndex = pipeline?.stages?.indexOf(stage!) || -1
          const { stageIndex: parentIndex = -1 } = getStageIndexByIdentifier(pipeline, parentStageName)

          if (dropIndex < parentIndex) {
            setMoveStageDetails({
              event,
              direction: MoveDirection.AHEAD
            })
            confirmMoveStage()
            return
          }
        } else if (dependentStages?.length) {
          let dropIndex = -1
          const node = event.entity.getSourcePort().getNode() as DefaultNodeModel
          const { stage } = getStageFromPipeline(node.getIdentifier())
          if (!stage) {
            //  node on sourceport is parallel so split nodeId to get original node identifier
            const nodeId = node.getIdentifier().split(EmptyNodeSeparator)[1]

            const { stageIndex: nextStageIndex } = getStageIndexByIdentifier(pipeline, nodeId)
            dropIndex = nextStageIndex + 1 // adding 1 as we checked source port that is prev to index where we will move this node
          } else {
            dropIndex = pipeline?.stages?.indexOf(stage!) || -1
          }

          const { stageIndex: firstDependentStageIndex = -1 } = getStageIndexByIdentifier(pipeline, dependentStages[0])

          if (dropIndex >= firstDependentStageIndex) {
            const stagesTobeUpdated = getAffectedDependentStages(dependentStages, dropIndex, pipeline)

            setMoveStageDetails({
              event,
              direction: MoveDirection.BEHIND,
              dependentStages: stagesTobeUpdated
            })
            confirmMoveStage()
            return
          }
        }

        const isRemove = removeNodeFromPipeline(getStageFromPipeline(event.node.identifier), pipeline, stageMap, false)
        if (isRemove && dropNode) {
          addStage(dropNode, false, event)
        }
      }
    }
  }
  //1) setup the diagram engine
  const engine = React.useMemo(() => createEngine({}), [])

  //2) setup the diagram model
  const model = React.useMemo(() => new StageBuilderModel(), [])
  const [splitPaneSize, setSplitPaneSize] = React.useState(DefaultSplitPaneSize)

  model.addUpdateGraph({
    data: pipeline,
    listeners: {
      nodeListeners,
      linkListeners
    },
    stagesMap,
    getString,
    isReadonly,
    selectedStageId,
    splitPaneSize,
    parentPath: 'pipeline.stages',
    errorMap
  })
  const setSplitPaneSizeDeb = React.useRef(debounce(setSplitPaneSize, 200))
  // load model into engine
  engine.setModel(model)

  /* Ignoring this function as it is used by "react-split-pane" */
  /* istanbul ignore next */
  function handleStageResize(size: number): void {
    setSplitPaneSizeDeb.current(size)
  }

  // handle position and zoom of canvas
  useStageBuilderCanvasState(engine, [])

  const StageCanvas = (
    <div
      className={css.canvas}
      ref={canvasRef}
      onClick={e => {
        const div = e.target as HTMLDivElement
        if (div === canvasRef.current?.children[0]) {
          dynamicPopoverHandler?.hide()
        }

        if (isSplitViewOpen) {
          updateQueryParams({ stageId: undefined as any, sectionId: undefined as any })
          //updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
          // setSelectedStageId(undefined)
        }
      }}
    >
      <CanvasWidget engine={engine} />
      <DynamicPopover
        darkMode={false}
        className={css.renderPopover}
        render={renderPopover}
        bind={setDynamicPopoverHandler}
        placement={'right'}
      />
      <CanvasButtons tooltipPosition="left" engine={engine} callback={() => dynamicPopoverHandler?.hide()} />
    </div>
  )

  const selectedStage = getStageFromPipeline(selectedStageId || '')
  const openSplitView = isSplitViewOpen && !!selectedStage?.stage
  // eslint-disable-next-line
  const resizerStyle = !!navigator.userAgent.match(/firefox/i)
    ? { display: 'flow-root list-item' }
    : { display: 'inline-table' }

  return (
    <Layout.Horizontal className={cx(css.canvasContainer)} padding="medium">
      <div className={css.canvasWrapper}>
        <SplitPane
          size={openSplitView ? splitPaneSize : '100%'}
          split="horizontal"
          minSize={MinimumSplitPaneSize}
          maxSize={MaximumSplitPaneSize}
          style={{ overflow: openSplitView ? 'auto' : 'hidden' }}
          pane2Style={{ overflow: 'initial', zIndex: 2 }}
          resizerStyle={resizerStyle}
          onChange={handleStageResize}
          allowResize={openSplitView}
        >
          {StageCanvas}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'white'
            }}
          >
            {openSplitView && type === SplitViewTypes.StageView
              ? renderPipelineStage({
                  stageType: selectedStage?.stage?.stage?.type,
                  minimal: false
                })
              : null}
          </div>
        </SplitPane>
      </div>
    </Layout.Horizontal>
  )
}

export default StageBuilder
