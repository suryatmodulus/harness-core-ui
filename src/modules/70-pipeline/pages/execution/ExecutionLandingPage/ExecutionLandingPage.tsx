import React from 'react'
import { useParams } from 'react-router-dom'

import { isEmpty } from 'lodash-es'
import { Layout, Text } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useGetExecutionDetail } from 'services/pipeline-ng'
import type { ExecutionNode } from 'services/cd-ng'
import { Duration } from '@common/components/Duration/Duration'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { String, useAppStore, useStrings } from 'framework/exports'

import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { isExecutionComplete } from '@pipeline/utils/statusHelpers'
import {
  getPipelineStagesMap,
  ExecutionPathParams,
  getRunningStageForPipeline,
  getRunningStep,
  LITE_ENGINE_TASK
} from '@pipeline/utils/executionUtils'
import { useQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { PageError } from '@common/components/Page/PageError'
import ExecutionContext from '../ExecutionContext/ExecutionContext'
import ExecutionMetadata from './ExecutionMetadata/ExecutionMetadata'
import ExecutionTabs from './ExecutionTabs/ExecutionTabs'
import RightBar from './RightBar/RightBar'

import css from './ExecutionLandingPage.module.scss'

export const POLL_INTERVAL = 2 /* sec */ * 1000 /* ms */

// TODO: remove 'any' once DTO is ready
/** Add dependency services to nodeMap */
const addServiceDependenciesFromLiteTaskEngine = (nodeMap: { [key: string]: any }): void => {
  const liteEngineTask = Object.values(nodeMap).find(item => item.stepType === LITE_ENGINE_TASK)
  if (liteEngineTask) {
    // NOTE: liteEngineTask contains information about dependency services
    const serviceDependencyList: ExecutionNode[] =
      ((liteEngineTask as any)?.outcomes as any)?.find((_item: any) => !!_item.serviceDependencyList)
        ?.serviceDependencyList || []

    // 1. add service dependencies to nodeMap
    serviceDependencyList.forEach(service => {
      service.stepType = 'dependency-service'
      nodeMap[(service as any).identifier] = service
    })

    // 2. add Initialize (Initialize step is liteEngineTask step)
    // override step name
    liteEngineTask.name = 'Initialize'
    nodeMap[liteEngineTask.uuid] = liteEngineTask
  }
}

export default function ExecutionLandingPage(props: React.PropsWithChildren<{}>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<ExecutionPathParams>
  >()

  /* cache token required for retrieving logs */
  const [logsToken, setLogsToken] = React.useState('')

  /* These are used when auto updating selected stage/step when a pipeline is running */
  const [autoSelectedStageId, setAutoSelectedStageId] = React.useState('')
  const [autoSelectedStepId, setAutoSelectedStepId] = React.useState('')

  /* These are updated only when new data is fetched successfully */
  const [selectedStageId, setSelectedStageId] = React.useState('')
  const [selectedStepId, setSelectedStepId] = React.useState('')
  const queryParams = useQueryParams<ExecutionPageQueryParams>()

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
  const allNodeMap = React.useMemo(() => {
    const nodeMap = { ...data?.data?.executionGraph?.nodeMap }
    // NOTE: add dependencies from "liteEngineTask" (ci stage)
    addServiceDependenciesFromLiteTaskEngine(nodeMap)
    return nodeMap
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

    const runningStage = getRunningStageForPipeline(
      data.data.pipelineExecutionSummary,
      data.data?.pipelineExecutionSummary?.status
    )

    const runningStep = getRunningStep(data.data.executionGraph || {})

    if (runningStage) {
      setAutoSelectedStageId(runningStage)
    }

    if (runningStep) {
      setAutoSelectedStepId(runningStep)
    }
  }, [queryParams, data])

  // update stage/step selection
  React.useEffect(() => {
    if (loading) {
      setSelectedStageId((queryParams.stage as string) || autoSelectedStageId)
    }
    setSelectedStepId((queryParams.step as string) || autoSelectedStepId)
  }, [loading, queryParams, autoSelectedStageId, autoSelectedStepId])

  const { pipelineExecutionSummary = {} } = data?.data || {}

  return (
    <ExecutionContext.Provider
      value={{
        pipelineExecutionDetail: data?.data || null,
        allNodeMap,
        pipelineStagesMap,
        selectedStageId,
        selectedStepId,
        loading,
        queryParams,
        logsToken,
        setLogsToken,
        refetch
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
                    url: routes.toCDProjectOverview({ orgIdentifier, projectIdentifier, accountId }),
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
                      module
                    }),
                    label: pipelineExecutionSummary.name || getString('pipeline')
                  },
                  { url: '#', label: getString('executionText') }
                ]}
              />
              <div className={css.headerTopRow}>
                <div className={css.titleContainer}>
                  <div className={css.title}>{pipelineExecutionSummary.name}</div>
                  <div className={css.pipelineId}>
                    <String
                      stringID={
                        module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'
                      }
                      vars={pipelineExecutionSummary}
                    />
                  </div>
                </div>
                <div className={css.statusBar}>
                  {pipelineExecutionSummary.status && (
                    <ExecutionStatusLabel className={css.statusLabel} status={pipelineExecutionSummary.status} />
                  )}
                  {pipelineExecutionSummary.startTs && (
                    <Layout.Horizontal spacing="small" padding={{ right: 'xxlarge' }}>
                      <Text>
                        <String stringID="startTime" />
                      </Text>
                      <Text font={{ weight: 'semi-bold' }}>{formatDatetoLocale(pipelineExecutionSummary.startTs)}</Text>
                    </Layout.Horizontal>
                  )}
                  <Duration
                    startTime={pipelineExecutionSummary.startTs}
                    endTime={pipelineExecutionSummary.endTs}
                    icon="hourglass"
                    durationText={' '}
                  />{' '}
                  <ExecutionActions
                    executionStatus={pipelineExecutionSummary.status}
                    refetch={refetch}
                    params={{
                      orgIdentifier,
                      pipelineIdentifier,
                      projectIdentifier,
                      accountId,
                      executionIdentifier,
                      module
                    }}
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
