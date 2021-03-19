import React from 'react'
import { Icon, Button, Text } from '@wings-software/uicore'
import { ResizeSensor } from '@blueprintjs/core'
import cx from 'classnames'
import { throttle } from 'lodash-es'

import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { isExecutionRunning, isExecutionCompletedWithBadState } from '@pipeline/utils/statusHelpers'
import { processLayoutNodeMap, ExecutionStatusIconMap as IconMap } from '@pipeline/utils/executionUtils'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'

import { StageNode, RunningIcon } from './StageNode'
import { ParallelStageNode } from './ParallelStageNode'
import css from './MiniExecutionGraph.module.scss'

const SCROLL_DELTA = 60
const THROTTLE_TIME = 300

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
    executionErrorInfo,
    pipelineIdentifier = '',
    planExecutionId = ''
  } = pipelineExecution
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
  const handleRightArrowClick = React.useCallback(
    throttle(
      (e: React.SyntheticEvent<Element>): void => {
        e.preventDefault()
        e.stopPropagation()
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
  const handleLeftArrowClick = React.useCallback(
    throttle(
      (e: React.SyntheticEvent<Element>): void => {
        e.preventDefault()
        e.stopPropagation()
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

  return (
    <ResizeSensor onResize={hideShowButtons}>
      <div className={css.main}>
        <div ref={wrapperRef} className={css.graphWrapper}>
          <div ref={graphRef} className={css.graph}>
            {(elements || []).map(({ stage, parallel }, i) => {
              if (parallel && Array.isArray(parallel)) {
                return (
                  <ParallelStageNode
                    key={i}
                    stages={parallel}
                    {...{ accountId, orgIdentifier, projectIdentifier, module, pipelineIdentifier, planExecutionId }}
                  />
                )
              }

              if (stage) {
                return (
                  <StageNode
                    key={stage.nodeUuid}
                    stage={stage}
                    {...{ accountId, orgIdentifier, projectIdentifier, module, pipelineIdentifier, planExecutionId }}
                  />
                )
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
          onClick={handleLeftArrowClick}
        />
        <Button
          minimal
          icon="arrow-right"
          className={css.scrollRight}
          iconProps={{ size: 10 }}
          style={{ display: 'none' }}
          onClick={handleRightArrowClick}
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
            <Text lineClamp={1} className={cx(css.stepCount, css.errorMsg)}>
              {executionErrorInfo.message}
            </Text>
          ) : null}
        </div>
      </div>
    </ResizeSensor>
  )
}
