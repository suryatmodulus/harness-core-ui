import React, { Reducer } from 'react'
import { useParams, Link } from 'react-router-dom'
import cx from 'classnames'

import { ExpandingSearchInput, Icon } from '@wings-software/uicore'
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
import type { FormattedLogLine } from '@common/components/MultiLogsViewer/types'

import { useLogsStream } from './useLogsStream'
import { reducer, ActionType, State, Action } from './LogsState'
import css from './LogsContent.module.scss'

const logsCache = new Map()
const STATUSES_FOR_ACCORDION_SKIP: LogViewerAccordionStatus[] = ['LOADING', 'NOT_STARTED']

export interface LogsContentProps {
  mode: 'step-details' | 'console-view'
  toConsoleView?: string
  errorMessage?: string
}

type LogsReducer = Reducer<State, Action<ActionType>>

type LogArray = {
  title: React.ReactNode
  data: string
  startTime?: number | undefined
  endTime?: number | undefined
  id: string
  status: LogViewerAccordionStatus
  isOpen?: boolean | undefined
  logKey: string
  dataSource: 'blob' | 'stream'
  unitStatus: LogViewerAccordionStatus
  manuallyToggled?: boolean | undefined
  previousLineLength?: number
  formattedData: FormattedLogLine[]
}

type Matches = {
  matchId: number
  arrayId: string
  arrayIndex: number
  matchLineNo: number | undefined
}

type Chunks = {
  start: number
  end: number
}

export function highlightSearchText(
  arrayToSearch: LogArray[],
  searchText: string,
  searchSelection: number
): { logArray: LogArray[]; matches: Matches[] } {
  const regex = new RegExp(searchText, 'gi')

  const matches: Matches[] = []

  let searchedLines = 0

  // Loop through log sections
  const formattedArrayToSearch = arrayToSearch.map((logSection, arrayIndex) => {
    if (logSection.formattedData) {
      const arrayId = logSection.id

      // Loop through each line in the section
      const highlightedFormattedData = Object.values(logSection.formattedData).map(logLine => {
        // Turn the log object (level, time, out) into an array so we can look through it
        const logLineContent = Object.values(logLine)

        // Loop through each line section for matches
        const highlightedLogLineContent = logLineContent.map(textToHighlight => {
          let match
          const chunks: Chunks[] = []
          while ((match = regex.exec(textToHighlight)) !== null) {
            if (regex.lastIndex > match.index) {
              chunks.push({
                start: match.index,
                end: regex.lastIndex
              })
            }

            if (match.index === regex.lastIndex) {
              regex.lastIndex++
            }
          }

          let highlightedString = textToHighlight
          chunks.forEach((chunk, index) => {
            const startShift = highlightedString.length - textToHighlight.length
            const openMarkTags = [
              highlightedString.slice(0, chunk.start + startShift),
              `<mark class=${searchSelection === index + 1 + matches.length ? css.selectedSearchResult : ''}>`,
              highlightedString.slice(chunk.start + startShift)
            ].join('')
            const endShift = openMarkTags.length - textToHighlight.length
            const closeMarkTags = [
              openMarkTags.slice(0, chunk.end + endShift),
              '</mark>',
              openMarkTags.slice(chunk.end + endShift)
            ].join('')
            highlightedString = closeMarkTags

            matches.push({
              matchId: matches.length + 1,
              arrayId: arrayId,
              arrayIndex: arrayIndex,
              matchLineNo: 1 + searchedLines
            })
          })

          return highlightedString
        })

        searchedLines += 1

        return {
          level: highlightedLogLineContent[0],
          time: highlightedLogLineContent[1],
          out: highlightedLogLineContent[2]
        }
      })

      return {
        ...logSection,
        formattedData: highlightedFormattedData
      }
    } else {
      return {
        ...logSection,
        formattedData: [
          {
            level: '',
            time: '',
            out: ''
          }
        ]
      }
    }
  })
  return {
    logArray: formattedArrayToSearch,
    matches: matches
  }
}

export function LogsContent(props: LogsContentProps): React.ReactElement {
  const { mode, toConsoleView = '', errorMessage } = props
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

  const [searchText, setSearchText] = React.useState<string>('')
  const [searchSelection, setSearchSelection] = React.useState<number>(0)

  const searchResults = highlightSearchText(
    state.units.map(unit => {
      return {
        ...state.dataMap[unit]
      }
    }),
    searchText,
    searchSelection
  )

  const logViewerData = searchResults.logArray

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const virtuosoRef = React.useRef<null | any>(null)

  async function goToResult(
    direction: 'next' | 'previous',
    _searchResults: { logArray: LogArray[]; matches: Matches[] },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.MutableRefObject<null | any>
  ): Promise<void> {
    const { logArray, matches } = _searchResults
    //Do nothing if no matches are found
    if (matches.length === 0) return

    let nextValue = searchSelection

    if (direction === 'next') {
      nextValue = matches[searchSelection] ? matches[searchSelection].matchId : matches[0].matchId
    } else if (direction === 'previous') {
      nextValue = matches[searchSelection - 2]
        ? matches[searchSelection - 1].matchId - 1
        : matches[matches.length - 1].matchId
    }

    setSearchSelection(nextValue)

    if (logArray[matches[nextValue - 1].arrayIndex].isOpen === false) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dispatch({ type: ActionType.ToggleSection, payload: matches[nextValue - 1].arrayId! })
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ref.current.scrollToIndex({ index: matches[nextValue - 1].matchLineNo! - 1, align: 'center', behaviour: 'smooth' })
  }

  function handleSearchChange(text: string): void {
    setSearchSelection(0)
    setSearchText(text)
  }

  const cssSearchInput = `${css.searchInput} ${searchText ? css.searchHasInput : ''}`

  const previousRowCounts = searchResults.logArray.map(arrayRow => {
    return arrayRow.previousLineLength || 0
  })

  return (
    <div className={cx(css.main, { [css.hasErrorMessage]: !!errorMessage })} data-mode={mode}>
      <div className={css.header}>
        <String tagName="div" stringID={mode === 'console-view' ? 'execution.consoleLogs' : 'execution.stepLogs'} />
        <div className={css.searchContainer}>
          <ExpandingSearchInput
            className={cssSearchInput}
            onChange={text => handleSearchChange(text)}
            showPrevNextButtons={true}
            onNext={() => goToResult('next', searchResults, virtuosoRef)}
            onPrev={() => goToResult('previous', searchResults, virtuosoRef)}
            flip
            fixedText={`${searchSelection} / ${searchResults.matches.length}`}
          />
        </div>
        <div>
          {mode === 'step-details' ? (
            <Link className={css.toConsoleView} to={toConsoleView}>
              <String stringID="consoleView" />
            </Link>
          ) : null}
        </div>
      </div>
      <div>
        {state.units.length > 0 ? (
          <MultiLogsViewer
            key={selectedStepId}
            data={logViewerData}
            onSectionClick={handleSectionClick}
            virtuosoRef={virtuosoRef}
            previousRowCounts={previousRowCounts}
          />
        ) : (
          <String tagName="div" className={css.noLogs} stringID="logs.noLogsText" />
        )}
      </div>
      {mode === 'console-view' && errorMessage ? (
        <div className={css.errorMessage}>
          <String className={css.summary} tagName="div" stringID="summary" />
          <div className={css.error}>
            <Icon name="circle-cross" />
            <span>{errorMessage}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
