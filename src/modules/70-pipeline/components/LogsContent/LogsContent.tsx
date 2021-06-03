import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso'
import { ExpandingSearchInput, Icon } from '@wings-software/uicore'
import { sum } from 'lodash-es'

import { String } from 'framework/strings'
import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'

import { GroupHeader, GroupHeaderProps, LogViewerAccordionStatus } from './components/GroupHeader'
import { MultiLogLine } from './components/MultiLogLine'
import { useLogsContent } from './useLogsContent'
import css from './LogsContent.module.scss'

// const worker = new Worker(new URL('./logparser.worker', import.meta.url))

const STATUSES_FOR_ACCORDION_SKIP: LogViewerAccordionStatus[] = ['LOADING', 'NOT_STARTED']

export interface LogsContentProps {
  mode: 'step-details' | 'console-view'
  toConsoleView?: string
  errorMessage?: string
}

export function LogsContent(props: LogsContentProps): React.ReactElement {
  const { mode, toConsoleView = '', errorMessage } = props
  const {
    pipelineStagesMap,
    selectedStageId,
    allNodeMap,
    selectedStepId,
    pipelineExecutionDetail,
    queryParams
  } = useExecutionContext()
  const { state, actions } = useLogsContent()

  const virtuosoRef = React.useRef<null | GroupedVirtuosoHandle>(null)

  React.useEffect(() => {
    const currentStepId = mode !== 'console-view' && queryParams.retryStep ? queryParams.retryStep : selectedStepId
    const selectedStep = allNodeMap[currentStepId]

    actions.createSections({
      node: selectedStep,
      selectedStep: selectedStepId,
      selectedStage: selectedStageId
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    queryParams.retryStep,
    mode,
    selectedStepId,
    allNodeMap,
    pipelineStagesMap,
    selectedStageId,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence
  ])

  function handleSectionClick(id: string, _props: GroupHeaderProps): boolean | void {
    const currentSection = state.dataMap[id]

    if (currentSection?.status && STATUSES_FOR_ACCORDION_SKIP.includes(currentSection?.status)) {
      return false
    }

    if (!currentSection?.data.length) {
      actions.fetchSectionData(id)
    } else {
      actions.toggleSection(id)
    }

    return false
  }

  // scroll to current search result
  React.useEffect(() => {
    const { currentIndex, linesWithResults } = state.searchData
    const index = linesWithResults[currentIndex]

    if (virtuosoRef.current && typeof index === 'number' && index >= 0) {
      virtuosoRef.current.scrollToIndex(index)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.searchData.currentIndex])

  const groupedCounts = state.logKeys.map(key => {
    const section = state.dataMap[key]
    return section.isOpen ? section.data.length : 0
  })

  return (
    <div className={cx(css.main, { [css.hasErrorMessage]: !!errorMessage })} data-mode={mode}>
      <div className={css.header}>
        <String tagName="div" stringID={mode === 'console-view' ? 'execution.consoleLogs' : 'execution.stepLogs'} />
        <div className={css.rhs}>
          <ExpandingSearchInput
            onChange={actions.search}
            showPrevNextButtons
            flip
            className={css.search}
            fixedText={`${state.searchData.currentIndex + 1} / ${state.searchData.linesWithResults.length}`}
            onNext={() => actions.goToNextSearchResult()}
            onPrev={() => actions.goToPrevSearchResult()}
            onEnter={() => actions.goToNextSearchResult()}
          />
          {mode === 'step-details' ? (
            <Link className={css.toConsoleView} to={toConsoleView}>
              <String stringID="consoleView" />
            </Link>
          ) : null}
        </div>
      </div>
      <pre className={css.container}>
        {state.units.length > 0 ? (
          <GroupedVirtuoso
            overscan={5}
            ref={virtuosoRef}
            groupCounts={groupedCounts}
            followOutput={() => 'auto'}
            groupContent={index => {
              const logKey = state.logKeys[index]
              const unit = state.dataMap[logKey]

              return <GroupHeader {...unit} id={logKey} onSectionClick={handleSectionClick} />
            }}
            itemContent={(index, groupIndex) => {
              const logKey = state.logKeys[groupIndex]
              const unit = state.dataMap[logKey]
              const previousCount = sum(groupedCounts.slice(0, groupIndex))
              const lineNumber = index - previousCount
              const logData = unit.data[lineNumber]

              return (
                <MultiLogLine
                  {...logData}
                  lineNumber={lineNumber}
                  limit={unit.data.length}
                  searchText={state.searchData.text}
                  currentSearchIndex={state.searchData.currentIndex}
                />
              )
            }}
          />
        ) : (
          <String tagName="div" className={css.noLogs} stringID="common.logs.noLogsText" />
        )}
      </pre>
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
