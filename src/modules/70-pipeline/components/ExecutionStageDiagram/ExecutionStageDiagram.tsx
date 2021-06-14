import React from 'react'
import { useParams } from 'react-router-dom'
import classNames from 'classnames'
import { noop, find, isNil, debounce } from 'lodash-es'
import type { NodeModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import { Button, Layout, Icon } from '@wings-software/uicore'
import { Select } from '@blueprintjs/select'
import { Tooltip } from '@blueprintjs/core'
import { GraphCanvasState, useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useDeepCompareEffect, useUpdateQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type {
  ExecutionPipeline,
  ExecutionPipelineGroupInfo,
  ExecutionPipelineItem,
  StageOptions
} from './ExecutionPipelineModel'
import { ExecutionStageDiagramModel, GridStyleInterface, NodeStyleInterface } from './ExecutionStageDiagramModel'
import ExecutionActions from '../ExecutionActions/ExecutionActions'
import {
  focusRunningNode,
  getGroupsFromData,
  getStageFromDiagramEvent,
  GroupState,
  moveStageToFocus
} from './ExecutionStageDiagramUtils'
import { CanvasButtons, CanvasButtonsActions } from '../CanvasButtons/CanvasButtons'
import * as Diagram from '../Diagram'
import css from './ExecutionStageDiagram.module.scss'

abstract class ItemEvent<T> extends Event {
  readonly stage: ExecutionPipelineItem<T>
  readonly stageTarget: HTMLElement

  constructor(eventName: string, stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super(eventName)
    this.stage = stage
    this.stageTarget = target
  }
}

abstract class GroupEvent<T> extends Event {
  readonly group: ExecutionPipelineGroupInfo<T>
  readonly stageTarget: HTMLElement

  constructor(eventName: string, group: ExecutionPipelineGroupInfo<T>, target: HTMLElement) {
    super(eventName)
    this.group = group
    this.stageTarget = target
  }
}

const StageSelection = Select.ofType<StageOptions>()

export class ItemClickEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemClickEvent', stage, target)
  }
}

export class ItemMouseEnterEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemMouseEnterEvent', stage, target)
  }
}

export class GroupMouseEnterEvent<T> extends GroupEvent<T> {
  constructor(group: ExecutionPipelineGroupInfo<T>, target: HTMLElement) {
    super('GroupMouseEnterEvent', group, target)
  }
}

export class ItemMouseLeaveEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemMouseLeaveEvent', stage, target)
  }
}

export interface ExecutionStageDiagramProps<T> {
  /** pipeline definition */
  data: ExecutionPipeline<T>
  /** selected item id */
  selectedIdentifier: string // TODO: 1. add node style for each type/shape 2. add default value
  /** node style  */
  nodeStyle?: NodeStyleInterface
  /** grid style */
  gridStyle: GridStyleInterface
  loading?: boolean
  showStartEndNode?: boolean // Default: true
  showEndNode?: boolean // Default: true
  diagramContainerHeight?: number
  itemClickHandler?: (event: ItemClickEvent<T>) => void
  itemMouseEnter?: (event: ItemMouseEnterEvent<T>) => void
  itemMouseLeave?: (event: ItemMouseLeaveEvent<T>) => void
  mouseEnterStepGroupTitle?: (event: GroupMouseEnterEvent<T>) => void
  mouseLeaveStepGroupTitle?: (event: GroupMouseEnterEvent<T>) => void
  canvasListener?: (action: CanvasButtonsActions) => void
  isWhiteBackground?: boolean // Default: false
  className?: string
  showStageSelection?: boolean // Default: false
  selectedStage?: StageOptions
  stageSelectionOptions?: StageOptions[]
  onChangeStageSelection?: (value: StageOptions) => void
  canvasBtnsClass?: string
  graphCanvasState?: GraphCanvasState
  setGraphCanvasState?: (state: GraphCanvasState) => void
  disableCollapseButton?: boolean
}

export default function ExecutionStageDiagram<T>(props: ExecutionStageDiagramProps<T>): React.ReactElement {
  const {
    data,
    className,
    selectedIdentifier,
    nodeStyle = { width: 50, height: 50 },
    gridStyle,
    diagramContainerHeight,
    showStartEndNode = true,
    showEndNode = true,
    itemClickHandler = noop,
    itemMouseEnter = noop,
    itemMouseLeave = noop,
    mouseEnterStepGroupTitle = noop,
    mouseLeaveStepGroupTitle = noop,
    canvasListener = noop,
    loading = false,
    selectedStage,
    showStageSelection = false,
    stageSelectionOptions,
    onChangeStageSelection,
    isWhiteBackground = false,
    canvasBtnsClass = '',
    graphCanvasState,
    setGraphCanvasState,
    disableCollapseButton
  } = props

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSetGraphCanvasState = React.useCallback(
    debounce((values: GraphCanvasState) => {
      return setGraphCanvasState?.(values)
    }, 250),
    []
  )

  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<ExecutionPathProps>
  >()

  const {
    pipelineStagesMap,
    refetch,
    pipelineExecutionDetail,
    allNodeMap,
    queryParams,
    selectedStageId,
    selectedStepId
  } = useExecutionContext()
  const { replaceQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const [autoPosition, setAutoPosition] = React.useState(true)

  const [groupState, setGroupState] = React.useState<Map<string, GroupState<T>>>()

  function stopAutoSelection(): void {
    if (queryParams.stage && queryParams.step) {
      return
    }

    if (selectedStageId && selectedStepId) {
      replaceQueryParams({
        ...queryParams,
        stage: selectedStageId,
        step: selectedStepId
      })
    }
  }

  useDeepCompareEffect(() => {
    const stageData = getGroupsFromData(data.items)
    setGroupState(stageData)
  }, [data])

  const currentStage = pipelineStagesMap.get(selectedStage?.value || '')
  const updateGroupStage = (event: Diagram.DefaultNodeEvent): void => {
    const group = groupState?.get(event.entity.getIdentifier())
    if (group && groupState) {
      groupState?.set(event.entity.getIdentifier(), {
        ...group,
        collapsed: !group.collapsed
      })
      setGroupState(new Map([...groupState]))
    }
  }

  //setup the diagram engine
  const engine = React.useMemo(() => Diagram.createEngine({}), [])

  //setup the diagram model
  const model = React.useMemo(() => new ExecutionStageDiagramModel(), [])
  model.setDefaultNodeStyle(nodeStyle)
  model.setGridStyle(gridStyle)

  // Graph position and zoom set (set values from context)
  React.useEffect(() => {
    const { offsetX, offsetY, zoom } = graphCanvasState || {}
    if (!isNil(offsetX) && offsetX !== model.getOffsetX() && !isNil(offsetY) && offsetY !== model.getOffsetY()) {
      model.setOffset(offsetX, offsetY)
    }
    if (!isNil(zoom) && zoom !== model.getZoomLevel()) {
      model.setZoomLevel(zoom)
    }
  }, [graphCanvasState, model])

  // Graph position and zoom change - event handling (update context value)
  React.useEffect(() => {
    const offsetUpdateHandler = function (event: any): void {
      if (graphCanvasState) {
        graphCanvasState.offsetX = event.offsetX
        graphCanvasState.offsetY = event.offsetY
        debounceSetGraphCanvasState({
          ...graphCanvasState
        })
      }
    }
    const zoomUpdateHandler = function (event: any): void {
      if (graphCanvasState) {
        graphCanvasState.zoom = event.zoom
        debounceSetGraphCanvasState({ ...graphCanvasState })
      }
    }
    const listenerHandle = model.registerListener({
      [Diagram.Event.OffsetUpdated]: offsetUpdateHandler,
      [Diagram.Event.ZoomUpdated]: zoomUpdateHandler
    })
    return () => {
      model.deregisterListener(listenerHandle)
    }
  }, [model])

  const nodeListeners: NodeModelListener = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Diagram.Event.ClickNode]: (event: any) => {
      /* istanbul ignore else */ if (autoPosition) {
        setAutoPosition(false)
      }
      const group = groupState?.get(event.entity.getIdentifier())
      if (group && group.collapsed) {
        updateGroupStage(event)
      } else {
        const stage = getStageFromDiagramEvent(event, data)
        /* istanbul ignore else */ if (stage) itemClickHandler(new ItemClickEvent(stage, event.target))
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Diagram.Event.MouseEnterNode]: (event: any) => {
      const stage = getStageFromDiagramEvent(event, data)
      /* istanbul ignore else */ if (stage) itemMouseEnter(new ItemMouseEnterEvent(stage, event.target))
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Diagram.Event.MouseLeaveNode]: (event: any) => {
      const stage = getStageFromDiagramEvent(event, data)
      // dynamicPopoverHandler?.hide()
      /* istanbul ignore else */ if (stage) itemMouseLeave(new ItemMouseLeaveEvent(stage, event.target))
    }
  }
  const layerListeners: BaseModelListener = {
    [Diagram.Event.StepGroupCollapsed]: (event: any) => updateGroupStage(event),
    [Diagram.Event.MouseEnterStepGroupTitle]: (event: any) => {
      const groupData = groupState?.get(event.entity.getIdentifier())
      if (groupData?.group) {
        mouseEnterStepGroupTitle(new GroupMouseEnterEvent(groupData?.group, event.target))
      }
    },
    [Diagram.Event.MouseLeaveStepGroupTitle]: (event: any) => {
      const groupData = groupState?.get(event.entity.getIdentifier())
      if (groupData?.group) {
        mouseLeaveStepGroupTitle(new GroupMouseEnterEvent(groupData?.group, event.target))
      }
    }
  }

  React.useEffect(() => {
    setAutoPosition(true)
  }, [data.identifier])

  React.useEffect(() => {
    moveStageToFocus(engine, selectedIdentifier, true, true)
  }, [selectedIdentifier])

  React.useEffect(() => {
    model.clearAllNodesAndLinks()
    engine.repaintCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.identifier])

  React.useEffect(() => {
    !loading &&
      model.addUpdateGraph(
        data,
        { nodeListeners: nodeListeners, linkListeners: {}, layerListeners },
        selectedIdentifier,
        diagramContainerHeight,
        showStartEndNode,
        showEndNode,
        groupState,
        disableCollapseButton
      )
  }, [
    data,
    diagramContainerHeight,
    groupState,
    layerListeners,
    loading,
    model,
    nodeListeners,
    selectedIdentifier,
    showStartEndNode,
    showEndNode
  ])

  const [canEdit, canExecute] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier as string
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [orgIdentifier, projectIdentifier, accountId, pipelineIdentifier]
  )

  //Load model into engine
  engine.setModel(model)
  autoPosition && focusRunningNode(engine, data)
  const stageNode = find(allNodeMap, node => node.setupId === selectedStage?.value)

  return (
    <div
      className={classNames(css.main, { [css.whiteBackground]: isWhiteBackground }, className)}
      onClick={stopAutoSelection}
    >
      <Diagram.CanvasWidget engine={engine} className={css.canvas} />
      {showStageSelection && selectedStage && selectedStage?.value?.length > 0 && (
        <Layout.Horizontal spacing="xxlarge" className={css.stageSelection}>
          <div className={css.groupLabels}>
            <StageSelection
              itemRenderer={(item, { handleClick, modifiers: { disabled } }) => (
                <div key={item.value}>
                  <Button
                    icon={item.icon?.name}
                    text={item.label}
                    className={css.stageItem}
                    disabled={disabled}
                    minimal
                    onClick={e => handleClick(e as React.MouseEvent<HTMLElement, MouseEvent>)}
                  />
                </div>
              )}
              itemDisabled={item => {
                return item.disabled ?? false
              }}
              itemPredicate={(query, item, _index, exactMatch) => {
                const normalizedValue = item.value.toLowerCase()
                const normalizedQuery = query.toLowerCase()
                /* istanbul ignore if */ if (exactMatch) {
                  return normalizedValue === normalizedQuery
                } else {
                  return (
                    normalizedValue.indexOf(normalizedQuery) > -1 ||
                    item.label.toLowerCase().indexOf(normalizedQuery) > -1
                  )
                }
              }}
              items={stageSelectionOptions || /* istanbul ignore next */ []}
              onItemSelect={item => onChangeStageSelection?.(item)}
            >
              <Button
                className={css.stageButton}
                icon={selectedStage.icon?.name}
                text={selectedStage.label}
                rightIcon="caret-down"
                minimal
              />
            </StageSelection>
            <ExecutionActions
              executionStatus={stageNode?.status as ExecutionStatus}
              refetch={refetch}
              params={{
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                accountId,
                executionIdentifier,
                module,
                repoIdentifier: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoIdentifier,
                branch: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch
              }}
              noMenu
              stageName={stageNode?.name}
              stageId={stageNode?.uuid}
              canEdit={canEdit}
              canExecute={canExecute}
            />
          </div>
          {groupState && groupState.size > 1 && (
            // Do not render groupStage if the size is less than 1
            // In approval stage, we do not have service/infra/execution sections
            <div className={css.groupLabels}>
              {[...groupState]
                .filter(item => item[1].showInLabel)
                .map(item => (
                  <span
                    onClick={e => {
                      e.currentTarget.classList.add(css.selectedLabel)
                      moveStageToFocus(engine, item[1].identifier)
                    }}
                    onAnimationEnd={e => {
                      e.currentTarget.classList.remove(css.selectedLabel)
                    }}
                    className={css.label}
                    key={item[0]}
                  >
                    {item[1].name}
                  </span>
                ))}
            </div>
          )}
          {currentStage?.failureInfo?.message && (
            <div>
              <Tooltip content={currentStage?.failureInfo?.message} portalClassName={css.errorTooltip}>
                <Icon data-testId="stage-error-tooltip" className={css.stageError} name="warning-sign" size={18} />
              </Tooltip>
            </div>
          )}
        </Layout.Horizontal>
      )}
      <CanvasButtons
        engine={engine}
        className={canvasBtnsClass}
        callback={action => {
          canvasListener(action)
        }}
        tooltipPosition="right"
      />
    </div>
  )
}
