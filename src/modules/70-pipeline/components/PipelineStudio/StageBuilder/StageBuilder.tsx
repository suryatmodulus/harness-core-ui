import React from 'react'
import { Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { debounce, isNil } from 'lodash-es'
import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
import SplitPane from 'react-split-pane'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { useToaster } from '@common/components/Toaster/useToaster'
import type { StageElementWrapper, NgPipeline } from 'services/cd-ng'
import { String, useStrings } from 'framework/exports'
import { useConfirmationDialog } from '@common/exports'
import { CanvasButtons } from '@pipeline/components/CanvasButtons/CanvasButtons'
import { moveStageToFocusDelayed } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
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
  mayBeStripCIProps
} from './StageBuilderUtil'
import { useStageBuilderCanvasState } from './useStageBuilderCanvasState'
import { StageList } from './views/StageList'
import { SplitViewTypes } from '../PipelineContext/PipelineActions'
import type { StageTypes } from '../Stages/StageTypes'
import css from './StageBuilder.module.scss'

export type StageStateMap = Map<string, StageState>

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
  renderPipelineStage
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
  }
  return renderPipelineStage({
    isParallel,
    showSelectMenu: true,
    getNewStageFromType,
    onSelectStage: (type, stage) => {
      if (stage) {
        addStage?.(stage, isParallel, event, undefined, true)
      } else {
        addStage?.(getNewStageFromType(type as any), isParallel, event)
      }
    }
  })
}

const StageBuilder: React.FC<{}> = (): JSX.Element => {
  const {
    state: {
      pipeline,
      pipelineView: {
        isSplitViewOpen,
        splitViewData: { selectedStageId, type = SplitViewTypes.StageView, stageType }
      },
      pipelineView,
      isInitialized
    },
    isReadonly,
    stagesMap,
    updatePipeline,
    updatePipelineView,
    renderPipelineStage,
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const { getString } = useStrings()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<PopoverData> | undefined
  >()

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
          showError(getString('deleteStageFailure'))
        }
      }
    }
  })

  const canvasRef = React.useRef<HTMLDivElement | null>(null)

  const [stageMap, setStageMap] = React.useState(new Map<string, StageState>())

  const addStage = (
    newStage: StageElementWrapper,
    isParallel = false,
    event?: DefaultNodeEvent,
    insertAt?: number,
    openSetupAfterAdd?: boolean
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
    model.addUpdateGraph(pipeline, { nodeListeners, linkListeners }, stagesMap, getString, isReadonly)
    if (newStage.stage && newStage.stage.name !== EmptyStageName) {
      stageMap.set(newStage.stage.identifier, { isConfigured: true, stage: newStage })
    }
    engine.repaintCanvas()
    updatePipeline(pipeline).then(() => {
      if (openSetupAfterAdd) {
        updatePipelineView({
          ...pipelineView,
          isSplitViewOpen: true,
          splitViewData: {
            selectedStageId: newStage.stage.identifier,
            type: SplitViewTypes.StageView,
            stageType: newStage.stage.type
          }
        })
        moveStageToFocusDelayed(engine, newStage.stage.identifier, true, false)
      }
    })
  }

  React.useEffect(() => {
    if (isInitialized && !isSplitViewOpen) {
      const map = new Map<string, StageState>()
      initializeStageStateMap(pipeline, map)
      setStageMap(map)
    }
  }, [isInitialized, pipeline, isSplitViewOpen])

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
          updatePipelineView({
            ...pipelineView,
            isSplitViewOpen: false,
            splitViewData: {}
          })
          dynamicPopoverHandler?.show(
            `[data-nodeid="${eventTemp.entity.getID()}"]`,
            {
              addStage,
              isStageView: false,
              renderPipelineStage,
              stagesMap
            },
            { useArrows: false, darkMode: true }
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
                onClickGroupStage: (stageId: string, typeOfStage: StageTypes) => {
                  dynamicPopoverHandler?.hide()
                  updatePipelineView({
                    ...pipelineView,
                    isSplitViewOpen: true,
                    splitViewData: { selectedStageId: stageId, type: SplitViewTypes.StageView, stageType: typeOfStage }
                  })
                  moveStageToFocusDelayed(engine, stageId, true, false)
                },
                stagesMap,
                renderPipelineStage
              },
              { useArrows: false, darkMode: true }
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
                    updatePipelineView({
                      ...pipelineView,
                      isSplitViewOpen: true,
                      splitViewData: {
                        selectedStageId: identifier,
                        type: SplitViewTypes.StageView,
                        stageType: node.stage.type
                      }
                    })
                  },
                  stagesMap,
                  renderPipelineStage
                },
                { useArrows: false, darkMode: false }
              )
              updatePipelineView({
                ...pipelineView,
                isSplitViewOpen: false,
                splitViewData: {}
              })
            } else {
              updatePipelineView({
                ...pipelineView,
                isSplitViewOpen: true,
                splitViewData: {
                  selectedStageId: data?.stage?.identifier,
                  type: SplitViewTypes.StageView,
                  stageType: data?.stage?.type || 'Deployment'
                }
              })
              moveStageToFocusDelayed(engine, data?.stage?.identifier, true, false)
            }
          } /* istanbul ignore else */ else if (!isSplitViewOpen) {
            if (stageMap.has(data?.stage?.identifier)) {
              updatePipelineView({
                ...pipelineView,
                isSplitViewOpen: true,
                splitViewData: {
                  selectedStageId: data?.stage?.identifier,
                  type: SplitViewTypes.StageView,
                  stageType: data?.stage?.type || 'Deployment'
                }
              })
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
                    updatePipelineView({
                      ...pipelineView,
                      isSplitViewOpen: true,
                      splitViewData: {
                        selectedStageId: identifier,
                        type: SplitViewTypes.StageView,
                        stageType: node.stage.type
                      }
                    })
                  },
                  stagesMap,
                  renderPipelineStage
                },
                { useArrows: false, darkMode: false }
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
      dynamicPopoverHandler?.hide()

      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: false,
        splitViewData: {}
      })

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
          { useArrows: false, darkMode: true },
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
        // Check Drop Node and Current node should not be same
        if (event.node.identifier !== eventTemp.entity.getIdentifier()) {
          const isRemove = removeNodeFromPipeline(
            getStageFromPipeline(event.node.identifier),
            pipeline,
            stageMap,
            false
          )
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
    }
  }

  const linkListeners: LinkModelListener = {
    [Event.AddLinkClicked]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      dynamicPopoverHandler?.hide()
      if (eventTemp.entity) {
        dynamicPopoverHandler?.show(
          `[data-linkid="${eventTemp.entity.getID()}"] circle`,
          {
            addStage,
            isStageView: false,
            event: eventTemp,
            stagesMap,
            renderPipelineStage
          },
          { useArrows: false, darkMode: true }
        )
      }
    },
    [Event.DropLinkEvent]: (event: any) => {
      const eventTemp = event as DefaultLinkEvent
      eventTemp.stopPropagation()
      if (event.node?.identifier) {
        const dropNode = getStageFromPipeline(event.node.identifier).stage
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

  model.addUpdateGraph(
    pipeline,
    { nodeListeners, linkListeners },
    stagesMap,
    getString,
    isReadonly,
    selectedStageId,
    splitPaneSize
  )
  const setSplitPaneSizeDeb = debounce(setSplitPaneSize, 200)
  // load model into engine
  engine.setModel(model)

  /* Ignoring this function as it is used by "react-split-pane" */
  /* istanbul ignore next */
  function handleStageResize(size: number): void {
    setSplitPaneSizeDeb(size)
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
          updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
        }
      }}
    >
      <CanvasWidget engine={engine} />
      <DynamicPopover
        darkMode={true}
        className={css.renderPopover}
        render={renderPopover}
        bind={setDynamicPopoverHandler}
      />

      <CanvasButtons tooltipPosition="left" engine={engine} callback={() => dynamicPopoverHandler?.hide()} />
    </div>
  )

  return (
    <Layout.Horizontal className={cx(css.canvasContainer)} padding="medium">
      <String tagName="div" className={css.pipelineStudioTitle} stringID="pipelineStudio" />
      <div className={css.canvasWrapper}>
        <SplitPane
          size={isSplitViewOpen ? splitPaneSize : '100%'}
          split="horizontal"
          minSize={MinimumSplitPaneSize}
          maxSize={MaximumSplitPaneSize}
          pane2Style={{ overflow: 'hidden' }}
          onChange={handleStageResize}
          allowResize={isSplitViewOpen}
        >
          {StageCanvas}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'white'
            }}
          >
            {isSplitViewOpen && type === SplitViewTypes.StageView
              ? renderPipelineStage({ stageType, minimal: false })
              : null}
          </div>
        </SplitPane>
      </div>
    </Layout.Horizontal>
  )
}

export default StageBuilder
