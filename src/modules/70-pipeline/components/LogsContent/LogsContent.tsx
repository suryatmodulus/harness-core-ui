import React, { Reducer } from 'react'
import { useParams, Link } from 'react-router-dom'

import { useGetToken, logBlobPromise } from 'services/logs'
import { String } from 'framework/exports'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import SessionToken from 'framework/utils/SessionToken'
import {
  MultiLogsViewer,
  LogViewerAccordionProps,
  LogViewerAccordionStatus
} from '@common/components/MultiLogsViewer/MultiLogsViewer'
import { getStageType } from '@pipeline/utils/executionUtils'
import { PQueue } from '@common/utils/PQueue'
import { useDeepCompareEffect } from '@common/hooks'

import { useLogsStream } from './useLogsStream'
import { reducer, ActionType, State, Action } from './LogsState'
import css from './LogsContent.module.scss'

const logsCache = new Map()
const STATUSES_FOR_ACCORDION_SKIP: LogViewerAccordionStatus[] = ['LOADING', 'NOT_STARTED']

export interface LogsContentProps {
  mode: 'step-details' | 'console-view'
  toConsoleView?: string
}

type LogsReducer = Reducer<State, Action<ActionType>>

export function LogsContent(props: LogsContentProps): React.ReactElement {
  const { mode, toConsoleView = '' } = props
  const requestQueue = React.useRef(new PQueue())
  const { accountId, pipelineIdentifier, projectIdentifier, executionIdentifier, orgIdentifier } = useParams<
    ExecutionPathProps
  >()
  const [state, dispatch] = React.useReducer<LogsReducer>(reducer, { units: [], dataMap: {}, selectedStep: '' })
  const {
    pipelineStagesMap,
    selectedStageId,
    allNodeMap,
    selectedStepId,
    logsToken,
    setLogsToken,
    pipelineExecutionDetail
  } = useExecutionContext()
  const { data: tokenData } = useGetToken({ queryParams: { accountID: accountId }, lazy: !!logsToken })
  const { log: streamData, startStream, closeStream, unitId: streamKey } = useLogsStream()

  // need to save token in a ref due to scoping issues
  const logsTokenRef = React.useRef('')

  function getBlobData(id: string, key: string): void {
    requestQueue.current.add(async (signal: AbortSignal) => {
      if (logsCache.has(key)) {
        dispatch({ type: ActionType.UpdateSectionData, payload: { data: logsCache.get(key), id } })
        return
      }

      // if token is not found, schedule the call for later
      if (!logsTokenRef.current) {
        setTimeout(() => getBlobData(id, key), 300)
        return
      }

      dispatch({ type: ActionType.FetchingSectionData, payload: id })
      const data = ((await logBlobPromise(
        {
          queryParams: {
            accountID: accountId,
            'X-Harness-Token': '',
            key
          },
          requestOptions: {
            headers: {
              'X-Harness-Token': logsTokenRef.current
            }
          }
        },
        signal
      )) as unknown) as string

      logsCache.set(key, data)
      dispatch({ type: ActionType.UpdateSectionData, payload: { id, data } })
    })
  }

  React.useEffect(() => {
    // use the existing token if present
    if (logsToken) {
      logsTokenRef.current = logsToken
    }

    // if `logsToken` is not present, `tokenData` is fetched
    // as we set the lazy flag based on it's presence
    if (tokenData) {
      setLogsToken(tokenData)
      logsTokenRef.current = tokenData
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenData, logsToken])

  // This fetches data for sections
  useDeepCompareEffect(() => {
    state.units.forEach(unit => {
      const section = state.dataMap[unit]
      if (section && section.status === 'LOADING') {
        if (section.dataSource === 'blob') {
          getBlobData(unit, section.logKey)
        } else if (section.dataSource === 'stream') {
          dispatch({ type: ActionType.FetchingSectionData, payload: unit })
          startStream({
            queryParams: {
              accountId,
              key: encodeURIComponent(section.logKey)
            },
            headers: {
              'X-Harness-Token': logsTokenRef.current,
              Authorization: SessionToken.getToken()
            },
            unitId: unit
          })
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedStep, state.dataMap])

  // fetch data for stream
  React.useEffect(() => {
    if (streamData) {
      dispatch({ type: ActionType.UpdateSectionData, payload: { data: streamData, id: streamKey } })
    }
  }, [streamData, streamKey, state.selectedStep])

  // on unmount
  React.useEffect(() => {
    const queue = requestQueue.current

    return () => {
      queue.cancel()
      closeStream()
      logsCache.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const selectedStep = allNodeMap[selectedStepId]
    const selectedStage = pipelineStagesMap.get(selectedStageId)

    dispatch({
      type: ActionType.CreateSections,
      payload: {
        node: selectedStep,
        module: getStageType(selectedStage),
        stageStatus: selectedStage?.status,
        accountId,
        pipelineIdentifier,
        projectIdentifier,
        executionIdentifier,
        orgIdentifier,
        stageIdentifier: selectedStage?.nodeIdentifier || '',
        runSequence: pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence,
        selectedStep: selectedStepId
      }
    })
  }, [
    selectedStepId,
    allNodeMap,
    accountId,
    pipelineIdentifier,
    projectIdentifier,
    executionIdentifier,
    pipelineStagesMap,
    selectedStageId,
    orgIdentifier,
    pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence
  ])

  function handleSectionClick(id: string, _props: LogViewerAccordionProps): boolean | void {
    const currentSection = state.dataMap[id]

    if (currentSection?.status && STATUSES_FOR_ACCORDION_SKIP.includes(currentSection?.status)) {
      return false
    }

    if (!currentSection?.data) {
      dispatch({ type: ActionType.FetchSectionData, payload: id })
    } else {
      dispatch({ type: ActionType.ToggleSection, payload: id })
    }

    return false
  }

  const logViewerData = state.units.map(unit => ({ ...state.dataMap[unit] }))

  return (
    <div className={css.main} data-mode={mode}>
      <div className={css.header}>
        <String tagName="div" stringID={mode === 'console-view' ? 'execution.consoleLogs' : 'execution.stepLogs'} />
        <div>
          {mode === 'step-details' ? (
            <Link className={css.toConsoleView} to={toConsoleView}>
              <String stringID="consoleView" />
            </Link>
          ) : null}
        </div>
      </div>
      <div className={css.logViewer}>
        {state.units.length > 0 ? (
          <MultiLogsViewer key={selectedStepId} data={logViewerData} onSectionClick={handleSectionClick} />
        ) : (
          <String tagName="div" className={css.noLogs} stringID="logs.noLogsText" />
        )}
      </div>
    </div>
  )
}
