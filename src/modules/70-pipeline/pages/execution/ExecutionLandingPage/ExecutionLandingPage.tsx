/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { get, isEmpty, pickBy } from 'lodash-es'
import { PageError, PageSpinner } from '@wings-software/uicore'
import { GovernanceMetadata, useGetExecutionDetail, ResponsePipelineExecutionDetail } from 'services/pipeline-ng'
import type { ExecutionNode } from 'services/pipeline-ng'
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

import { logsCache } from '@pipeline/components/LogsContent/LogsState/utils'
import { PipelineFeatureLimitBreachedBanner } from '@pipeline/factories/PipelineFeatureRestrictionFactory/PipelineFeatureRestrictionFactory'
import { EvaluationModal } from '@governance/EvaluationModal'
import { FeatureRestrictionBanners } from '@pipeline/factories/FeatureRestrictionBannersFactory/FeatureRestrictionBannersFactory'
import ExecutionContext, { GraphCanvasState } from '@pipeline/context/ExecutionContext'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import useTabVisible from '@common/hooks/useTabVisible'
import { ExecutionHeader } from './ExecutionHeader/ExecutionHeader'
import ExecutionMetadata from './ExecutionMetadata/ExecutionMetadata'
import ExecutionTabs from './ExecutionTabs/ExecutionTabs'

import css from './ExecutionLandingPage.module.scss'

export const POLL_INTERVAL = 2 /* sec */ * 1000 /* ms */
const PageTabs = { PIPELINE: 'pipeline' }

const setStageIds = ({
  queryParams,
  setAutoSelectedStageId,
  setAutoSelectedStepId,
  setSelectedStepId,
  setSelectedStageId,
  data
}: {
  queryParams: ExecutionPageQueryParams
  setAutoSelectedStageId: Dispatch<SetStateAction<string>>
  setAutoSelectedStepId: Dispatch<SetStateAction<string>>
  setSelectedStepId: Dispatch<SetStateAction<string>>
  setSelectedStageId: Dispatch<SetStateAction<string>>
  data?: ResponsePipelineExecutionDetail | null
}): void => {
  // if user has selected a stage/step do not auto-update
  if (queryParams.stage || queryParams.step) {
    setAutoSelectedStageId('')
    setAutoSelectedStepId('')
    return
  }

  // if no data is found, reset the stage and step
  if (!data || !data?.data) {
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
}

export default function ExecutionLandingPage(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, module } =
    useParams<PipelineType<ExecutionPathProps>>()
  const [allNodeMap, setAllNodeMap] = React.useState<Record<string, ExecutionNode>>({})

  /* cache token required for retrieving logs */
  const [logsToken, setLogsToken] = React.useState('')

  /* These are used when auto updating selected stage/step when a pipeline is running */
  const [autoSelectedStageId, setAutoSelectedStageId] = React.useState<string>('')
  const [autoSelectedStepId, setAutoSelectedStepId] = React.useState<string>('')

  /* These are updated only when new data is fetched successfully */
  const [selectedStageId, setSelectedStageId] = React.useState<string>('')
  const [selectedStepId, setSelectedStepId] = React.useState<string>('')
  const queryParams = useQueryParams<ExecutionPageQueryParams>()
  const location = useLocation<{ shouldShowGovernanceEvaluations: boolean; governanceMetadata: GovernanceMetadata }>()
  const locationPathNameArr = location?.pathname?.split('/') || []
  const selectedPageTab = locationPathNameArr[locationPathNameArr.length - 1]
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

  const visibility = useTabVisible()
  // setup polling
  React.useEffect(() => {
    if (!loading && data && !isExecutionComplete(data.data?.pipelineExecutionSummary?.status)) {
      const timerId = window.setTimeout(() => {
        if (visibility) {
          refetch()
        }
      }, POLL_INTERVAL)

      return () => {
        window.clearTimeout(timerId)
      }
    }
  }, [data, refetch, loading, visibility])

  // show the current running stage and steps automatically
  React.useEffect(() => {
    setStageIds({
      queryParams,
      setAutoSelectedStageId,
      setAutoSelectedStepId,
      setSelectedStepId,
      setSelectedStageId,
      data
    })
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
            <PipelineFeatureLimitBreachedBanner featureIdentifier={FeatureIdentifier.SERVICES} module={module} />
            <PipelineFeatureLimitBreachedBanner
              featureIdentifier={FeatureIdentifier.DEPLOYMENTS_PER_MONTH}
              module={module}
            />
            <PipelineFeatureLimitBreachedBanner
              featureIdentifier={FeatureIdentifier.INITIAL_DEPLOYMENTS}
              module={module}
            />
            <ExecutionTabs />
            {module === 'ci' && (
              <FeatureRestrictionBanners
                featureNames={[
                  FeatureIdentifier.ACTIVE_COMMITTERS,
                  FeatureIdentifier.MAX_BUILDS_PER_MONTH,
                  FeatureIdentifier.MAX_TOTAL_BUILDS
                ]}
                module={module}
              />
            )}
            <div
              className={css.childContainer}
              data-view={(selectedPageTab === PageTabs.PIPELINE && queryParams.view) || 'graph'}
              id="pipeline-execution-container"
            >
              {props.children}
            </div>
            {!!location?.state?.shouldShowGovernanceEvaluations && (
              <EvaluationModal accountId={accountId} metadata={location?.state?.governanceMetadata} />
            )}
          </div>
        </main>
      )}
    </ExecutionContext.Provider>
  )
}
