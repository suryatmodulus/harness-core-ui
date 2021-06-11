import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { Layout, Text } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import { useGetExecutionDetail } from 'services/pipeline-ng'
import type { ExecutionNode } from 'services/pipeline-ng'
import { Duration } from '@common/components/Duration/Duration'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { String, useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { ExecutionStatus, isExecutionComplete } from '@pipeline/utils/statusHelpers'
import {
  getPipelineStagesMap,
  getActiveStageForPipeline,
  getActiveStep,
  LITE_ENGINE_TASK
} from '@pipeline/utils/executionUtils'
import { useQueryParams, useDeepCompareEffect } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { PageError } from '@common/components/Page/PageError'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { logsCache } from '@pipeline/components/LogsContent/LogsState/utils'
import ExecutionContext, { GraphCanvasState } from '@pipeline/context/ExecutionContext'

import ExecutionMetadata from './ExecutionMetadata/ExecutionMetadata'
import ExecutionTabs from './ExecutionTabs/ExecutionTabs'
import RightBar from './RightBar/RightBar'

import css from './ExecutionLandingPage.module.scss'

export const POLL_INTERVAL = 2 /* sec */ * 1000 /* ms */

/** Add dependency services to nodeMap */
const addServiceDependenciesFromLiteTaskEngine = (nodeMap: { [key: string]: ExecutionNode }): void => {
  const liteEngineTask = Object.values(nodeMap).find(item => item.stepType === LITE_ENGINE_TASK)
  if (liteEngineTask) {
    // NOTE: liteEngineTask contains information about dependency services
    const serviceDependencyList: ExecutionNode[] =
      // Array check is required for legacy support
      (Array.isArray(liteEngineTask.outcomes)
        ? liteEngineTask.outcomes.find((_item: any) => !!_item.serviceDependencyList)?.serviceDependencyList
        : liteEngineTask.outcomes?.dependencies?.serviceDependencyList) || []

    // 1. add service dependencies to nodeMap
    serviceDependencyList.forEach(service => {
      if (service?.identifier) {
        service.stepType = 'dependency-service'
        service.executableResponses = [
          {
            task: {
              logKeys: (service as any).logKeys
            } as any
          }
        ]
        nodeMap[service.identifier] = service
      }
    })

    // 2. add Initialize (Initialize step is liteEngineTask step)
    // override step name
    if (liteEngineTask.uuid) {
      liteEngineTask.name = 'Initialize'
      nodeMap[liteEngineTask.uuid] = liteEngineTask
    }
  }
}

export default function ExecutionLandingPage(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<ExecutionPathProps>
  >()
  const [allNodeMap, setAllNodeMap] = React.useState({})

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

  const { selectedProject } = useAppStore()
  const project = selectedProject
  const { getString } = useStrings()
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
    addServiceDependenciesFromLiteTaskEngine(nodeMap)
    setAllNodeMap(nodeMap)
    setAllNodeMap(oldNodeMap => ({ ...oldNodeMap, ...nodeMap }))
  }, [data?.data?.executionGraph?.nodeMap])

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

  const { pipelineExecutionSummary = {} } = data?.data || {}

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
        <PageError />
      ) : (
        <main className={css.main}>
          <div className={css.lhs}>
            <header className={css.header}>
              <Breadcrumbs
                links={[
                  {
                    url: routes.toCDProjectOverview({ orgIdentifier, projectIdentifier, accountId, module }),
                    label: project?.name as string
                  },
                  {
                    url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
                    label: getString('pipelines')
                  },
                  {
                    url: routes.toPipelineDeploymentList({
                      orgIdentifier,
                      projectIdentifier,
                      pipelineIdentifier,
                      accountId,
                      module,
                      branch: pipelineExecutionSummary?.gitDetails?.branch,
                      repoIdentifier: pipelineExecutionSummary?.gitDetails?.repoIdentifier
                    }),
                    label: pipelineExecutionSummary.name || getString('common.pipeline')
                  },
                  { url: '#', label: getString('executionText') }
                ]}
              />
              <div className={css.headerTopRow}>
                <div className={css.titleContainer}>
                  <div className={css.title}>{pipelineExecutionSummary.name}</div>
                  <Layout.Horizontal style={{ alignItems: 'center' }} spacing={'xsmall'}>
                    <div className={css.pipelineId}>
                      <String
                        stringID={
                          module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'
                        }
                        vars={pipelineExecutionSummary}
                      />
                    </div>
                    {pipelineExecutionSummary.gitDetails?.objectId && (
                      <GitPopover data={pipelineExecutionSummary.gitDetails} />
                    )}
                  </Layout.Horizontal>
                </div>
                <div className={css.statusBar}>
                  {pipelineExecutionSummary.status && (
                    <ExecutionStatusLabel
                      className={css.statusLabel}
                      status={pipelineExecutionSummary.status as ExecutionStatus}
                    />
                  )}
                  {pipelineExecutionSummary.startTs && (
                    <Layout.Horizontal spacing="small" padding={{ right: 'xxlarge' }}>
                      <Text>
                        <String stringID="pipeline.startTime" />
                      </Text>
                      <Text font={{ weight: 'semi-bold' }}>{formatDatetoLocale(pipelineExecutionSummary.startTs)}</Text>
                    </Layout.Horizontal>
                  )}
                  <Duration
                    startTime={pipelineExecutionSummary.startTs}
                    endTime={pipelineExecutionSummary.endTs}
                    icon="hourglass"
                    durationText={' '}
                  />
                  <ExecutionActions
                    executionStatus={pipelineExecutionSummary.status as ExecutionStatus}
                    refetch={refetch}
                    params={{
                      orgIdentifier,
                      pipelineIdentifier,
                      projectIdentifier,
                      accountId,
                      executionIdentifier,
                      module,
                      repoIdentifier: pipelineExecutionSummary?.gitDetails?.repoIdentifier,
                      branch: pipelineExecutionSummary?.gitDetails?.branch
                    }}
                    canEdit={canEdit}
                    canExecute={canExecute}
                  />
                </div>
              </div>
            </header>
            <ExecutionMetadata />
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
