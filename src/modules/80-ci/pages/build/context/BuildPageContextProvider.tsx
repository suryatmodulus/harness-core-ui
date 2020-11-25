import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getLogsFromBlob, useLogs } from '@ci/services/LogService'
import { useGetBuild } from 'services/ci'
import { ExecutionPipelineItemStatus } from '@pipeline/exports'
import type { BuildPageUrlParams } from '../CIBuildPage'
import { BuildPageContext, BuildPageStateInterface } from './BuildPageContext'
import {
  getDefaultSelectionFromExecutionPipeline,
  getFirstItemIdFromExecutionPipeline,
  graph2ExecutionPipeline
} from '../utils/api2ui'
import {
  getFlattenItemsFromPipeline,
  getSelectOptionsFromExecutionPipeline,
  getStepsPipelineFromExecutionPipeline
} from '../../build/sections/pipeline-graph/BuildPipelineGraphUtils'
import { BuildPipelineGraphLayoutType } from '../sections/pipeline-graph/BuildPipelineGraphLayout/BuildPipelineGraphLayout'
import { fetchLogsAccessToken } from '../../../services/TokenService'

export const BuildPageContextProvider: React.FC = props => {
  const { children } = props
  const { orgIdentifier, projectIdentifier, buildIdentifier, accountId } = useParams<BuildPageUrlParams>()
  const [state, setState] = React.useState<BuildPageStateInterface>({
    selectedStageIdentifier: '-1',
    selectedStepIdentifier: '-1',
    graphLayoutType: BuildPipelineGraphLayoutType.RIGHT,
    globalErrorMessage: null
  })

  const [logs, setLogs] = React.useState<Array<any>>([])
  const [logsToken, setLogsToken] = React.useState<string | undefined>()

  const setSelectedStageIdentifier = (selectedStageIdentifier: string): void => {
    if (selectedStageIdentifier === state.selectedStageIdentifier) return

    // select default (first step in the pipeline)
    const pipeline = getStepsPipelineFromExecutionPipeline(buildData?.stagePipeline, selectedStageIdentifier)
    const selectedStepIdentifier = getFirstItemIdFromExecutionPipeline(pipeline)

    setState({ ...state, selectedStageIdentifier, selectedStepIdentifier })
  }

  const setSelectedStepIdentifier = (selectedStepIdentifier: string): void => {
    if (selectedStepIdentifier === state.selectedStepIdentifier) return
    setState({ ...state, selectedStepIdentifier })
  }

  const setGraphLayoutType = (graphLayoutType: BuildPipelineGraphLayoutType): void => {
    setState({ ...state, graphLayoutType })
  }

  const { data, loading, error, refetch } = useGetBuild({
    buildIdentifier: Number(buildIdentifier),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  // TODO: Not finalized in the mock - TBD
  // const globalErrorMessage = getGlobalErrorFromResponse();
  const globalErrorMessage = null

  // api2ui model
  const stagePipeline = graph2ExecutionPipeline(data?.data?.graph)

  // default selected stage and step
  const { defaultSelectedStageIdentifier, defaultSelectedStepIdentifier } = getDefaultSelectionFromExecutionPipeline(
    stagePipeline
  )

  const buildData = {
    response: data,
    stagePipeline,
    defaultSelectedStageIdentifier,
    defaultSelectedStepIdentifier,
    globalErrorMessage
  }

  // load data every 5 seconds
  useEffect(() => {
    const reloadInterval = setInterval(() => {
      refetch()
    }, 5000)

    return function () {
      clearInterval(reloadInterval)
    }
  })

  // get token for accessing logs
  useEffect(() => {
    fetchLogsAccessToken(accountId).then((token: string) => {
      setLogsToken(token)
    })
  }, [])

  // by default fist stage/step is selected
  useEffect(() => {
    setState({
      ...state,
      selectedStageIdentifier: buildData?.defaultSelectedStageIdentifier as string,
      selectedStepIdentifier: buildData?.defaultSelectedStepIdentifier as string,
      globalErrorMessage: buildData?.globalErrorMessage as string | null
    })
  }, [
    buildData?.defaultSelectedStageIdentifier,
    buildData?.defaultSelectedStepIdentifier,
    buildData?.globalErrorMessage
  ])

  const stagesSelectOptions = getSelectOptionsFromExecutionPipeline(buildData?.stagePipeline)
  const selectedStageOption = stagesSelectOptions.find(item => item.value === state.selectedStageIdentifier)
  const executionSteps = getStepsPipelineFromExecutionPipeline(buildData?.stagePipeline, state.selectedStageIdentifier)
  const stepItems = getFlattenItemsFromPipeline(executionSteps)
  const selectedStepStatus = stepItems.find(item => item.identifier === state.selectedStepIdentifier)?.status
  const isStepRunning =
    selectedStepStatus === ExecutionPipelineItemStatus.RUNNING ||
    selectedStepStatus === ExecutionPipelineItemStatus.ASYNC_WAITING

  const [logsStream] = useLogs(
    logsToken as string,
    accountId,
    orgIdentifier,
    projectIdentifier,
    buildIdentifier,
    state.selectedStageIdentifier || '',
    state.selectedStepIdentifier || '',
    !!logsToken && isStepRunning && !!selectedStageOption && !!state.selectedStepIdentifier
  )

  useEffect(() => {
    setLogs([])
    !!logsToken &&
      !isStepRunning &&
      selectedStageOption &&
      state.selectedStepIdentifier &&
      getLogsFromBlob(
        logsToken,
        accountId,
        orgIdentifier,
        projectIdentifier,
        buildIdentifier,
        state.selectedStageIdentifier || '',
        state.selectedStepIdentifier || '',
        setLogs
      )
  }, [logsToken, state.selectedStepIdentifier])

  return (
    <BuildPageContext.Provider
      value={{
        state,
        buildData,
        loading,
        error,
        logs: isStepRunning ? logsStream : logs,
        isStepRunning,
        setSelectedStageIdentifier,
        setSelectedStepIdentifier,
        setGraphLayoutType
      }}
    >
      {children}
    </BuildPageContext.Provider>
  )
}
