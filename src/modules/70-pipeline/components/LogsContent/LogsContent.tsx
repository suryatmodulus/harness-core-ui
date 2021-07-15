import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import { ExpandingSearchInput, ExpandingSearchInputHandle, Icon, Text } from '@wings-software/uicore'
import type { GroupedVirtuosoHandle, VirtuosoHandle } from 'react-virtuoso'

import { String } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { useStrings } from 'framework/strings'
import { useGlobalEventListener } from '@common/hooks'

import { useLogsContent } from './useLogsContent'
import { GroupedLogsWithRef as GroupedLogs } from './components/GroupedLogs'
import { SingleSectionLogsWithRef as SingleSectionLogs } from './components/SingleSectionLogs'
import css from './LogsContent.module.scss'

export interface LogsContentProps {
  mode: 'step-details' | 'console-view'
  toConsoleView?: string
  errorMessage?: string
  isWarning?: boolean
}

export function LogsContent(props: LogsContentProps): React.ReactElement {
  const { mode, toConsoleView = '', errorMessage, isWarning } = props
  const { pipelineStagesMap, selectedStageId, allNodeMap, selectedStepId, pipelineExecutionDetail, queryParams } =
    useExecutionContext()
  const { state, actions } = useLogsContent()
  const { getString } = useStrings()
  const { linesWithResults, currentIndex } = state.searchData
  const searchRef = React.useRef<ExpandingSearchInputHandle>()

  const virtuosoRef = React.useRef<null | GroupedVirtuosoHandle | VirtuosoHandle>(null)

  React.useEffect(() => {
    const currentStepId = mode !== 'console-view' && queryParams.retryStep ? queryParams.retryStep : selectedStepId
    const selectedStep = allNodeMap[currentStepId]

    actions.createSections({
      node: selectedStep,
      selectedStep: selectedStepId,
      selectedStage: selectedStageId,
      getSectionName: (index: number) => getString('pipeline.logs.sectionName', { index })
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

  // scroll to current search result
  React.useEffect(() => {
    const index = linesWithResults[currentIndex]

    if (virtuosoRef.current && typeof index === 'number' && index >= 0) {
      virtuosoRef.current.scrollToIndex(index)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      actions.goToPrevSearchResult()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      actions.goToNextSearchResult()
    }
  }

  useGlobalEventListener('keydown', e => {
    const isMetaKey = navigator.userAgent.includes('Mac') ? e.metaKey : e.ctrlKey

    if (e.key === 'f' && isMetaKey && searchRef.current) {
      e.preventDefault()
      searchRef.current.focus()
    }
  })

  function handleSearchChange(term: string): void {
    if (term) {
      actions.search(term)
    } else {
      actions.resetSearch()
    }
  }

  return (
    <div className={cx(css.main, { [css.hasErrorMessage]: !!errorMessage })} data-mode={mode}>
      <div className={css.header}>
        <String tagName="div" stringID={mode === 'console-view' ? 'execution.consoleLogs' : 'execution.stepLogs'} />
        <div className={css.rhs} onKeyDown={handleKeyDown}>
          <ExpandingSearchInput
            onChange={handleSearchChange}
            ref={searchRef}
            showPrevNextButtons
            flip
            className={css.search}
            fixedText={`${Math.min(currentIndex + 1, linesWithResults.length)} / ${linesWithResults.length}`}
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
          state.units.length === 1 ? (
            <SingleSectionLogs ref={virtuosoRef} state={state} actions={actions} />
          ) : (
            <GroupedLogs ref={virtuosoRef} state={state} actions={actions} />
          )
        ) : (
          <String tagName="div" className={css.noLogs} stringID="common.logs.noLogsText" />
        )}
      </pre>
      {mode === 'console-view' && errorMessage ? (
        <div className={cx(css.errorMessage, { [css.isWarning]: isWarning })}>
          <String className={css.summary} tagName="div" stringID="summary" />
          <div className={css.error}>
            <Icon name={isWarning ? 'warning-sign' : 'circle-cross'} />
            <Text lineClamp={1}>{errorMessage}</Text>
          </div>
        </div>
      ) : null}
    </div>
  )
}
