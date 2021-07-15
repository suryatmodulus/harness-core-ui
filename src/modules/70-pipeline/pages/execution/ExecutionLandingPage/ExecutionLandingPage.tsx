import React from 'react'
import { useParams } from 'react-router-dom'
import { get, isEmpty, pickBy } from 'lodash-es'

import { useGetExecutionDetail } from 'services/pipeline-ng'
import type { ExecutionNode } from 'services/pipeline-ng'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { ExecutionStatus, isExecutionComplete } from '@pipeline/utils/statusHelpers'
import {
  getPipelineStagesMap,
  getActiveStageForPipeline,
  getActiveStep,
  addServiceDependenciesFromLiteTaskEngine
} from '@pipeline/utils/executionUtils'
import { useQueryParams, useDeepCompareEffect } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

import { PageError } from '@common/components/Page/PageError'
import { logsCache } from '@pipeline/components/LogsContent/LogsState/utils'
import ExecutionContext, { GraphCanvasState } from '@pipeline/context/ExecutionContext'

import { ExecutionHeader } from './ExecutionHeader/ExecutionHeader'
import ExecutionMetadata from './ExecutionMetadata/ExecutionMetadata'
import ExecutionTabs from './ExecutionTabs/ExecutionTabs'
import RightBar from './RightBar/RightBar'

import css from './ExecutionLandingPage.module.scss'

export const POLL_INTERVAL = 2 /* sec */ * 1000 /* ms */

export default function ExecutionLandingPage(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId } =
    useParams<PipelineType<ExecutionPathProps>>()
  const [allNodeMap, setAllNodeMap] = React.useState<Record<string, ExecutionNode>>({})

  /* cache token required for retrieving logs */
  const [logsToken, setLogsToken] = React.useState('')

  /* These are used when auto updating selected stage/step when a pipeline is running */
  const [autoSelectedStageId, setAutoSelectedStageId] = React.useState('')
  const [autoSelectedStepId, setAutoSelectedStepId] = React.useState('')

  /* These are updated only when new data is fetched successfully */
  const [selectedStageId, setSelectedStageId] = React.useState('')
  const [selectedStepId, setSelectedStepId] = React.useState('')
  const queryParams = useQueryParams<ExecutionPageQueryParams>()

  const [stepsGraphCanvasState, setStepsGraphCanvasState] = React.useState<GraphCanvasState>({
    offsetX: 5,
    offsetY: 0,
    zoom: 100
  })

  const { data, refetch, loading, error } = useGetExecutionDetail({
    planExecutionId: executionIdentifier,
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId,
      stageNodeId: isEmpty(queryParams.stage || autoSelectedStageId)
        ? undefined
        : queryParams.stage || autoSelectedStageId
    },
    debounce: 500
  })

  const graphNodeMap = data?.data?.executionGraph?.nodeMap || {}
  const isDataLoadedForSelectedStage = Object.keys(graphNodeMap).some(
    key => graphNodeMap?.[key]?.setupId === selectedStageId
  )

  const pipelineStagesMap = React.useMemo(() => {
    return getPipelineStagesMap(
      data?.data?.pipelineExecutionSummary?.layoutNodeMap,
      data?.data?.pipelineExecutionSummary?.startingNodeId
    )
  }, [data?.data?.pipelineExecutionSummary?.layoutNodeMap, data?.data?.pipelineExecutionSummary?.startingNodeId])

  // combine steps and dependencies(ci stage)
  useDeepCompareEffect(() => {
    const nodeMap = { ...data?.data?.executionGraph?.nodeMap }
    // NOTE: add dependencies from "liteEngineTask" (ci stage)
    addServiceDependenciesFromLiteTaskEngine(nodeMap, data?.data?.executionGraph?.nodeAdjacencyListMap)
    setAllNodeMap(oldNodeMap => {
      const interruptHistories = pickBy(oldNodeMap, val => get(val, '__isInterruptNode'))

      return { ...interruptHistories, ...nodeMap }
    })
  }, [data?.data?.executionGraph?.nodeMap, data?.data?.executionGraph?.nodeAdjacencyListMap])

  // setup polling
  React.useEffect(() => {
    if (!loading && data && !isExecutionComplete(data.data?.pipelineExecutionSummary?.status)) {
      const timerId = window.setTimeout(() => {
        refetch()
      }, POLL_INTERVAL)

      return () => {
        window.clearTimeout(timerId)
      }
    }
  }, [data, refetch, loading])

  // show the current running stage and steps automatically
  React.useEffect(() => {
    // if user has selected a stage/step do not auto-update
    if (queryParams.stage || queryParams.step) {
      setAutoSelectedStageId('')
      setAutoSelectedStepId('')
      return
    }

    // if no data is found, reset the stage and step
    if (!data || !data.data) {
      setAutoSelectedStageId('')
      setAutoSelectedStepId('')
      return
    }

    const runningStage = getActiveStageForPipeline(
      data.data.pipelineExecutionSummary,
      data.data?.pipelineExecutionSummary?.status as ExecutionStatus
    )

    const runningStep = getActiveStep(
      data.data.executionGraph || {},
      undefined,
      data.data.pipelineExecutionSummary?.layoutNodeMap
    )

    if (runningStage) {
      setAutoSelectedStageId(runningStage)
      setSelectedStageId(runningStage)
    }

    if (runningStep) {
      setAutoSelectedStepId(runningStep)
      setSelectedStepId(runningStep)
    }
  }, [queryParams, data])

  React.useEffect(() => {
    return () => {
      logsCache.clear()
    }
  }, [])

  // update stage/step selection
  React.useEffect(() => {
    if (loading) {
      setSelectedStageId((queryParams.stage as string) || autoSelectedStageId)
    }
    setSelectedStepId((queryParams.step as string) || autoSelectedStepId)
  }, [loading, queryParams, autoSelectedStageId, autoSelectedStepId])

  return (
    <ExecutionContext.Provider
      value={{
        pipelineExecutionDetail: data?.data || null,
        allNodeMap,
        pipelineStagesMap,
        selectedStageId,
        selectedStepId,
        loading,
        isDataLoadedForSelectedStage,
        queryParams,
        logsToken,
        setLogsToken,
        refetch,
        stepsGraphCanvasState,
        setStepsGraphCanvasState,
        setSelectedStageId,
        setSelectedStepId,
        addNewNodeToMap(id, node) {
          setAllNodeMap(nodeMap => ({ ...nodeMap, [id]: node }))
        }
      }}
    >
      {loading && !data ? <PageSpinner /> : null}
      {error ? (
        <PageError message={(error?.data as any)?.message?.replace('"', '')} />
      ) : (
        <main className={css.main}>
          <div className={css.lhs}>
            <header className={css.header}>
              <ExecutionHeader />
              <ExecutionMetadata />
            </header>
            <ExecutionTabs />
            <div className={css.childContainer} id="pipeline-execution-container">
              {props.children}
            </div>
          </div>
          <RightBar />
        </main>
      )}
    </ExecutionContext.Provider>
  )
}
