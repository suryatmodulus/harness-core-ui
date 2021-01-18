import React from 'react'
import { IconName, Icon, Button } from '@wings-software/uicore'
import { Tooltip, ITooltipProps, Popover, ResizeSensor, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { startCase, sortBy, throttle } from 'lodash-es'
import { useHistory } from 'react-router-dom'

import type { GraphLayoutNode, PipelineExecutionSummary } from 'services/pipeline-ng'
import { ExecutionStatus, isExecutionNotStarted } from '@pipeline/utils/statusHelpers'
import { isExecutionRunning, isExecutionCompletedWithBadState } from '@pipeline/utils/statusHelpers'
import { processLayoutNodeMap } from '@pipeline/utils/executionUtils'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import css from './MiniExecutionGraph.module.scss'

const IconMap: Record<ExecutionStatus, IconName> = {
  Success: 'tick-circle',
  Running: 'main-more',
  Failed: 'circle-cross',
  Expired: 'expired',
  Aborted: 'banned',
  Suspended: 'banned',
  Queued: 'queued',
  NotStarted: 'pending',
  Paused: 'pause',
  Waiting: 'waiting',
  Skipped: 'skipped'
}

// Higher the number, Higher the Priority, Max 100.
const StagePriority: Record<ExecutionStatus, number> = {
  Success: 1,
  Running: 2,
  Failed: 20,
  Expired: 18,
  Aborted: 19,
  Suspended: 17,
  Queued: 0,
  NotStarted: 0,
  Paused: 24,
  Waiting: 25,
  Skipped: 15
}

function RunningIcon(): React.ReactElement {
  return (
    <div className={css.runningAnimation}>
      <div />
      <div />
      <div />
    </div>
  )
}

export interface StageNodeProps extends Omit<ITooltipProps, 'content'> {
  stage: GraphLayoutNode
  onClick(stageId: string): void
}

export function StageNode({ stage, onClick, ...rest }: StageNodeProps): React.ReactElement {
  const statusLower = stage.status?.toLowerCase() || ''

  return (
    <Tooltip
      position="top"
      {...rest}
      content={startCase(stage.status)}
      className={cx(css.stageWrapper, css[statusLower as keyof typeof css])}
      targetClassName={css.stage}
      targetTagName="div"
      wrapperTagName="div"
      targetProps={{ onClick: () => onClick(stage.nodeUuid || '') }}
    >
      {stage.status === 'Running' ? (
        <RunningIcon />
      ) : (
        <Icon name={IconMap[stage.status as ExecutionStatus]} size={13} className={css.icon} />
      )}
    </Tooltip>
  )
}

export interface ParallelNodeProps {
  stages: GraphLayoutNode[]
  onClick(stageId: string): void
}

const STEP_DETAILS_LIMIT = 4
const SCROLL_DELTA = 60
const THROTTLE_TIME = 300

export function ParallelStageNode(props: ParallelNodeProps): React.ReactElement {
  const { stages, onClick } = props
  const sortedStages = sortBy(stages, stage => 100 - StagePriority[stage.status as ExecutionStatus])

  return (
    <Popover
      interactionKind="hover"
      minimal
      position="bottom"
      lazy
      autoFocus={false}
      enforceFocus={false}
      className={css.parallelNodes}
      wrapperTagName="div"
      targetTagName="div"
      targetClassName={css.ghostNodes}
      popoverClassName={css.moreStages}
      targetProps={{ 'data-stages': sortedStages.length } as any}
      modifiers={{ offset: { offset: '0,8px' } }}
    >
      <StageNode stage={sortedStages[0]} onClick={onClick} />
      <React.Fragment>
        {sortedStages.slice(1, STEP_DETAILS_LIMIT).map((stage: GraphLayoutNode, i) => (
          <StageNode key={i} stage={stage} onClick={onClick} />
        ))}
        {sortedStages.length > STEP_DETAILS_LIMIT ? (
          <div className={css.extraCount}>+ {stages.length - STEP_DETAILS_LIMIT}</div>
        ) : null}
      </React.Fragment>
    </Popover>
  )
}

export interface MiniExecutionGraphProps extends ProjectPathProps, ModulePathParams {
  pipelineExecution: PipelineExecutionSummary
}

export default function MiniExecutionGraph(props: MiniExecutionGraphProps): React.ReactElement {
  const { pipelineExecution, accountId, orgIdentifier, projectIdentifier, module } = props
  const {
    successfulStagesCount,
    runningStagesCount,
    failedStagesCount,
    status,
    totalStagesCount,
    layoutNodeMap,
    executionErrorInfo,
    pipelineIdentifier = '',
    planExecutionId = ''
  } = pipelineExecution
  const history = useHistory()
  const elements = React.useMemo(() => processLayoutNodeMap(pipelineExecution), [pipelineExecution])
  const graphRef = React.useRef<HTMLDivElement | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    hideShowButtons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hideShowButtons = React.useCallback(
    throttle(() => {
      window.requestAnimationFrame(() => {
        if (graphRef.current && wrapperRef.current) {
          const graph = graphRef.current.getBoundingClientRect()
          const wrapper = wrapperRef.current.getBoundingClientRect()
          const leftBtn = wrapperRef.current.parentElement?.querySelector(`.${css.scrollLeft}`) as HTMLButtonElement
          const rightBtn = wrapperRef.current.parentElement?.querySelector(`.${css.scrollRight}`) as HTMLButtonElement

          if (graph.width > wrapper.width) {
            // show buttons
            leftBtn?.style.removeProperty('display')
            rightBtn?.style.removeProperty('display')
          } else {
            // hide buttons
            leftBtn?.style.setProperty('display', 'none')
            rightBtn?.style.setProperty('display', 'none')
          }
        }
      })
    }, THROTTLE_TIME),
    []
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRightClick = React.useCallback(
    throttle(
      (): void => {
        window.requestAnimationFrame(() => {
          if (graphRef.current && wrapperRef.current) {
            const graph = graphRef.current.getBoundingClientRect()
            const wrapper = wrapperRef.current.getBoundingClientRect()

            if (graph.right > wrapper.right) {
              graphRef.current.style.transform = `translateX(${Math.max(
                graph.left - wrapper.left - SCROLL_DELTA,
                wrapper.width - graph.width
              )}px)`
            }
          }
        })
      },
      THROTTLE_TIME,
      { leading: true }
    ),
    []
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleLeftClick = React.useCallback(
    throttle(
      (): void => {
        window.requestAnimationFrame(() => {
          if (graphRef.current && wrapperRef.current) {
            const graph = graphRef.current.getBoundingClientRect()
            const wrapper = wrapperRef.current.getBoundingClientRect()

            if (graph.left < wrapper.left) {
              graphRef.current.style.transform = `translateX(${Math.min(
                graph.left - wrapper.left + SCROLL_DELTA,
                0
              )}px)`
            }
          }
        })
      },
      THROTTLE_TIME,
      { leading: true }
    ),
    []
  )

  function handleStageClick(stageId: string): void {
    const path = routes.toExecutionPipelineView({
      accountId,
      module,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      executionIdentifier: planExecutionId
    })
    if (!isExecutionNotStarted(layoutNodeMap?.[stageId]?.status)) {
      history.push(`${path}?stage=${stageId}`)
    }
  }

  return (
    <ResizeSensor onResize={hideShowButtons}>
      <div className={css.main}>
        <div ref={wrapperRef} className={css.graphWrapper}>
          <div ref={graphRef} className={css.graph}>
            {(elements || []).map(({ stage, parallel }, i) => {
              if (parallel && Array.isArray(parallel)) {
                return <ParallelStageNode key={i} stages={parallel} onClick={handleStageClick} />
              }

              if (stage) {
                return <StageNode key={stage.nodeUuid} stage={stage} onClick={handleStageClick} />
              }

              return null
            })}
          </div>
        </div>
        <Button
          minimal
          icon="arrow-left"
          className={css.scrollLeft}
          iconProps={{ size: 10 }}
          style={{ display: 'none' }}
          onClick={handleLeftClick}
        />
        <Button
          minimal
          icon="arrow-right"
          className={css.scrollRight}
          iconProps={{ size: 10 }}
          style={{ display: 'none' }}
          onClick={handleRightClick}
        />
        <div className={css.stepCounts}>
          <div className={css.stepCount} data-status="success">
            <Icon name={IconMap.Success} size={10} />
            {successfulStagesCount} / {totalStagesCount}
          </div>
          {isExecutionRunning(status) ? (
            <div className={css.stepCount} data-status="running">
              <RunningIcon />
              {runningStagesCount}
            </div>
          ) : isExecutionCompletedWithBadState(status) ? (
            <div className={css.stepCount} data-status="failed">
              <Icon name={IconMap.Failed} size={10} /> {failedStagesCount}
            </div>
          ) : null}
          {isExecutionCompletedWithBadState(status) && executionErrorInfo?.message ? (
            <Tooltip
              content={<div className={css.errorTooltip}>{executionErrorInfo.message}</div>}
              position={Position.BOTTOM}
            >
              <div className={cx(css.stepCount, css.errorMsg)}>{executionErrorInfo.message}</div>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </ResizeSensor>
  )
}
