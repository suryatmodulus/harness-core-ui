import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  Icon,
  Text
} from '@wings-software/uicore'
import type { GroupedVirtuosoHandle, VirtuosoHandle } from 'react-virtuoso'

import { String as StrTemplate, useStrings } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { useGlobalEventListener } from '@common/hooks'
import type { ConsoleViewStepDetailProps } from '@pipeline/factories/ExecutionFactory/types'

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

  /* istanbul ignore next */
  function getSectionName(index: number): string {
    return getString('pipeline.logs.sectionName', { index })
  }

  React.useEffect(() => {
    const currentStepId = queryParams.retryStep ? queryParams.retryStep : selectedStepId
    const selectedStep = allNodeMap[currentStepId]

    actions.createSections({
      node: selectedStep,
      selectedStep: selectedStepId,
      selectedStage: selectedStageId,
      getSectionName
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

    /* istanbul ignore next */
    if (virtuosoRef.current && typeof index === 'number' && index >= 0) {
      virtuosoRef.current.scrollToIndex(index)
    }
  }, [currentIndex, linesWithResults])

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
    /* istanbul ignore else */
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      actions.goToPrevSearchResult()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      actions.goToNextSearchResult()
    }
  }

  /* istanbul ignore next */
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
        <StrTemplate
          tagName="div"
          stringID={mode === 'console-view' ? 'execution.consoleLogs' : 'execution.stepLogs'}
        />
        <div className={css.rhs} onKeyDown={handleKeyDown}>
          <ExpandingSearchInput
            onChange={handleSearchChange}
            ref={searchRef}
            showPrevNextButtons
            flip
            theme={'dark'}
            className={css.search}
            fixedText={`${Math.min(currentIndex + 1, linesWithResults.length)} / ${linesWithResults.length}`}
            onNext={/* istanbul ignore next */ () => actions.goToNextSearchResult()}
            onPrev={/* istanbul ignore next */ () => actions.goToPrevSearchResult()}
            onEnter={/* istanbul ignore next */ () => actions.goToNextSearchResult()}
          />
          {mode === 'step-details' ? (
            <Link className={css.toConsoleView} to={toConsoleView}>
              <StrTemplate stringID="consoleView" />
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
          <StrTemplate tagName="div" className={css.noLogs} stringID="common.logs.noLogsText" />
        )}
      </pre>
      {mode === 'console-view' && errorMessage ? (
        <div className={cx(css.errorMessage, { [css.isWarning]: isWarning })}>
          <StrTemplate className={css.summary} tagName="div" stringID="summary" />
          <div className={css.error}>
            <Icon name={isWarning ? 'warning-sign' : 'circle-cross'} />
            <Text lineClamp={1}>{errorMessage}</Text>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export interface LogsContentState {
  hasError: boolean
}

export class LogsContentWithErrorBoundary extends React.Component<LogsContentProps, LogsContentState> {
  constructor(props: LogsContentProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): LogsContentState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown): void {
    window?.bugsnagClient?.notify?.(error)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false })
  }

  render(): React.ReactElement {
    if (this.state.hasError) {
      return (
        <div className={css.errorContainer}>
          <StrTemplate tagName="div" className={css.txt} stringID="pipeline.logs.errorText" />
          <Button onClick={this.handleRetry} variation={ButtonVariation.PRIMARY} size={ButtonSize.SMALL}>
            <StrTemplate stringID="pipeline.logs.retry" />
          </Button>
        </div>
      )
    }

    return <LogsContent {...this.props} />
  }
}

export function DefaultConsoleViewStepDetails(props: ConsoleViewStepDetailProps): React.ReactElement {
  const { errorMessage, isSkipped } = props

  return (
    <div className={css.logViewer}>
      <LogsContentWithErrorBoundary mode="console-view" errorMessage={errorMessage} isWarning={isSkipped} />
    </div>
  )
}
