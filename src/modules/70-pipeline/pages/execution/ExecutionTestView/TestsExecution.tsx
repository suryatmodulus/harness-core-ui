import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import {
  Text,
  Container,
  Layout,
  Heading,
  Select,
  Switch,
  Pagination,
  useIsMounted,
  Icon,
  Color,
  Button,
  useModalHook,
  FlexExpander,
  TextInput
} from '@wings-software/uicore'
import { get, noop, omit } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { PageError } from '@common/components/Page/PageError'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { TestSuiteSummaryQueryParams, useTestSuiteSummary, useVgSearch } from 'services/ti-service'
import { CallGraphAPIResponse, TestsCallgraph } from './TestsCallgraph'
import { TestsExecutionItem } from './TestsExecutionItem'
import { SortByKey, CALL_GRAPH_WIDTH, CALL_GRAPH_HEIGHT, CALL_GRAPH_API_LIMIT } from './TestsUtils'
import css from './BuildTests.module.scss'

const PAGE_SIZE = 20

interface TestsExecutionProps {
  stageId: string
  stepId: string
  serviceToken: string
  splitview?: boolean
}

export const TestsExecution: React.FC<TestsExecutionProps> = ({ stageId, stepId, serviceToken, splitview }) => {
  const context = useExecutionContext()
  const callGraphEnabled = /localhost|qa.harness.io/.test(location.hostname) || localStorage.CI_TI_CALL_GRAPH_ENABLED
  const { getString } = useStrings()
  const status = (context?.pipelineExecutionDetail?.pipelineExecutionSummary?.status || '').toUpperCase()
  const [showFailedTestsOnly, setShowFailedTestsOnly] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | undefined>(0)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    buildIdentifier: string
  }>()
  const [sortBy, setSortBy] = useState<SortByKey>(SortByKey.FAILURE_RATE)
  const [pageIndex, setPageIndex] = useState(0)
  const queryParams = useMemo(
    () => ({
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      pipelineId: context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || '',
      buildId: String(context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || ''),
      report: 'junit' as const,
      pageIndex,
      sort: sortBy,
      pageSize: PAGE_SIZE,
      order: 'DESC' as const,
      stageId,
      stepId
    }),
    [
      stageId,
      stepId,
      accountId,
      orgIdentifier,
      projectIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence,
      pageIndex,
      sortBy
    ]
  )
  const {
    data: executionSummary,
    error,
    loading,
    refetch: fetchExecutionSummary
  } = useTestSuiteSummary({
    queryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken
      }
    },
    debounce: 500
  })
  const sortByItems = useMemo(
    () => [
      { label: getString('common.failureRate'), value: SortByKey.FAILURE_RATE },
      { label: getString('pipeline.testsReports.failedTests'), value: SortByKey.FAILED_TESTS },
      { label: getString('pipeline.duration'), value: SortByKey.DURATION_MS },
      { label: getString('pipeline.testsReports.totalTests'), value: SortByKey.TOTAL_TESTS }
    ],
    [getString]
  )
  const [sortBySelectedItem, setSortBySelectedItem] = useState({
    label: getString('common.failureRate'),
    value: SortByKey.FAILURE_RATE
  })
  const isMounted = useIsMounted()
  const refetchData = useCallback(
    (params: TestSuiteSummaryQueryParams) => {
      setTimeout(() => {
        if (isMounted.current) {
          fetchExecutionSummary({ queryParams: params })
        }
      }, 250)
    },
    [isMounted, fetchExecutionSummary]
  )
  const [selectedCallGraphClass, setSelectedCallGraphClass] = useState<string>()
  const {
    data: callGraphData,
    loading: callGraphLoading,
    error: callGraphError,
    refetch: fetchCallGraph
  } = useVgSearch({
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken
      }
    }
  })
  const callGraphStats = useMemo(() => {
    return callGraphData?.nodes?.reduce(
      (obj, node) => {
        if (node.important) {
          obj.changedCount++
        } else {
          obj.unchangedCount++
        }
        return obj
      },
      {
        changedCount: 0,
        unchangedCount: 0
      }
    )
  }, [callGraphData])
  const onClassSelected = useCallback(
    (selectedClassName: string) => {
      if (selectedClassName !== selectedCallGraphClass) {
        setSelectedCallGraphClass(selectedClassName)
        fetchCallGraph({
          queryParams: Object.assign({}, omit(queryParams, ['report', 'pageIndex', 'sort', 'pageSize', 'order']), {
            limit: CALL_GRAPH_API_LIMIT,
            class: selectedClassName
          })
        })
      }
    },
    [selectedCallGraphClass, queryParams, fetchCallGraph]
  )
  const [callgraphSearchTerm, setCallgraphSearchTerm] = useState('')
  const onCallgraphModalSearch = (event: React.FormEvent<HTMLInputElement>): void => {
    const value = (event.target as HTMLInputElement).value
    setCallgraphSearchTerm(value)
  }
  const renderCallGraphFooter = useCallback(
    (preview?: boolean) => {
      const directCall = (
        <Text className={cx(css.graphLabel, css.direct)}>{getString('pipeline.testsReports.directCall')}</Text>
      )
      const indirectCall = (
        <Text className={cx(css.graphLabel, css.indirect)}>{getString('pipeline.testsReports.indirectCall')}</Text>
      )
      const changedMethods = (
        <Text className={cx(css.graphLabel, css.changed)}>
          {getString('pipeline.testsReports.codeChanges', {
            count: new Intl.NumberFormat().format(callGraphStats?.changedCount || 0)
          })}
        </Text>
      )
      const unchangedMethods = (
        <Text className={cx(css.graphLabel, css.unchanged)}>
          {getString('pipeline.testsReports.unchangedMethods', {
            count: new Intl.NumberFormat().format(callGraphStats?.unchangedCount || 0)
          })}
        </Text>
      )
      return (
        <Container padding={{ top: 'xsmall', right: 'medium', bottom: 'medium', left: preview ? 'medium' : 'large' }}>
          {(preview && (
            <Layout.Vertical spacing="small">
              <Container>
                <Layout.Horizontal spacing="small">
                  {directCall}
                  {indirectCall}
                </Layout.Horizontal>
              </Container>
              <Container>
                <Layout.Horizontal spacing="small">
                  {changedMethods}
                  {unchangedMethods}
                </Layout.Horizontal>
              </Container>
            </Layout.Vertical>
          )) || (
            <Layout.Horizontal spacing="small">
              {changedMethods}
              {unchangedMethods}
              {directCall}
              {indirectCall}
            </Layout.Horizontal>
          )}
        </Container>
      )
    },
    [callGraphStats, getString]
  )
  const [showCallGraphModal, hideCallGraphModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        className={css.callgraphModal}
        title={
          <Layout.Horizontal padding={{ top: 'xsmall' }}>
            <Text className={css.modalTitle}>
              {getString('pipeline.testsReports.callgraphTitle')}: <span>{selectedCallGraphClass}</span>
            </Text>
            <FlexExpander />
            <TextInput
              className={css.searchInput}
              placeholder={getString('search')}
              autoFocus
              leftIcon="search"
              leftIconProps={{
                name: 'search',
                size: 16
              }}
              onChange={onCallgraphModalSearch}
            />
          </Layout.Horizontal>
        }
        isCloseButtonShown
        isOpen
        onClose={() => {
          hideCallGraphModal()
          setCallgraphSearchTerm('')
        }}
        style={{ width: window.innerWidth - 200, height: window.innerHeight - 200 }}
      >
        <Layout.Vertical spacing="small">
          {!callGraphLoading && selectedCallGraphClass && callGraphData && (
            <TestsCallgraph
              selectedClass={selectedCallGraphClass}
              graph={callGraphData as CallGraphAPIResponse}
              onNodeClick={noop}
              searchTerm={callgraphSearchTerm}
            />
          )}
          {renderCallGraphFooter()}
        </Layout.Vertical>
      </Dialog>
    ),
    [selectedCallGraphClass, callGraphLoading, callGraphData, callgraphSearchTerm]
  )

  useEffect(() => {
    if (!executionSummary && !error && !loading) {
      fetchExecutionSummary({ queryParams })
    }
  }, [executionSummary, error, loading, fetchExecutionSummary, queryParams])

  // When build/execution is not resolved from context, render nothing
  if (!status) {
    return null
  }

  return (
    <div className={cx(css.widgetWrapper, css.rightContainer)}>
      <Container flex={{ justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
        <Heading level={2} font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('pipeline.testsReports.testCasesExecution')}
        </Heading>
        <Button
          icon="question"
          minimal
          tooltip={getString('pipeline.testsReports.testCasesExecutionInfo')}
          iconProps={{ size: 14 }}
          margin={{ left: 'xsmall' }}
        />
        {loading && <Icon name="steps-spinner" size={16} color="blue500" margin={{ left: 'xsmall' }} />}
      </Container>
      <Layout.Horizontal spacing="medium" className={css.widget} padding="xlarge">
        <Container width={`calc(100% - ${callGraphEnabled ? CALL_GRAPH_WIDTH : 0}px)`}>
          <Container flex>
            <Switch
              label={getString('pipeline.testsReports.showOnlyFailedTests')}
              style={{ alignSelf: 'center' }}
              checked={showFailedTestsOnly}
              onChange={e => {
                setShowFailedTestsOnly(e.currentTarget.checked)
                setPageIndex(0)
                refetchData({
                  ...queryParams,
                  sort: sortBy,
                  pageIndex: 0,
                  status: e.currentTarget.checked ? 'failed' : undefined
                })
              }}
            />

            <Layout.Horizontal spacing="small">
              <Text style={{ alignSelf: 'center' }}>{getString('pipeline.testsReports.sortBy')}</Text>
              <Select
                className={css.select}
                items={sortByItems}
                value={sortBySelectedItem}
                onChange={item => {
                  setSortBySelectedItem(item as { label: string; value: SortByKey })
                  setSortBy(item.value as SortByKey)
                  setPageIndex(0)
                  refetchData({
                    ...queryParams,
                    sort: item.value as SortByKey,
                    pageIndex: 0,
                    status: showFailedTestsOnly ? 'failed' : undefined
                  })
                }}
              />
            </Layout.Horizontal>
          </Container>

          {error && (
            <Container height={200}>
              <PageError
                message={get(error, 'data.error_msg', error?.message)}
                onClick={() => {
                  fetchExecutionSummary()
                }}
              />
            </Container>
          )}

          {!error && executionSummary?.content && (
            <>
              {executionSummary.content.length > 0 && (
                <Layout.Vertical spacing="small" margin={{ top: 'medium' }}>
                  {executionSummary?.content?.map((summary, index) => (
                    <TestsExecutionItem
                      key={(summary.name || '') + showFailedTestsOnly}
                      buildIdentifier={String(
                        context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || ''
                      )}
                      executionSummary={summary}
                      serviceToken={serviceToken}
                      status={showFailedTestsOnly ? 'failed' : undefined}
                      expanded={index === expandedIndex ? true : undefined}
                      stageId={stageId}
                      stepId={stepId}
                      onExpand={() => {
                        setExpandedIndex(expandedIndex !== index ? index : undefined)
                      }}
                      splitview={splitview}
                      onShowCallGraphForClass={callGraphEnabled ? onClassSelected : undefined}
                    />
                  ))}
                </Layout.Vertical>
              )}
              {executionSummary.content.length === 0 && showFailedTestsOnly && (
                <Text font={{ align: 'center' }} margin={{ top: 'medium' }}>
                  {getString('pipeline.testsReports.noFailedTestsFound')}
                </Text>
              )}
            </>
          )}

          {(executionSummary?.data?.totalItems || 0) > 20 && (
            <Pagination
              pageSize={executionSummary?.data?.pageSize || 0}
              pageIndex={pageIndex}
              pageCount={executionSummary?.data?.totalPages || 0}
              itemCount={executionSummary?.data?.totalItems || 0}
              gotoPage={pageIdx => {
                setPageIndex(pageIdx)
                refetchData({
                  ...queryParams,
                  sort: sortBy,
                  pageIndex: pageIdx
                })
              }}
            />
          )}
        </Container>

        {/* Callgraph container */}
        {callGraphEnabled && (
          <Container width={CALL_GRAPH_WIDTH} className={css.callgraphContainer}>
            <Layout.Horizontal className={css.callgraphHeader}>
              <Text color={Color.GREY_800} style={{ fontWeight: 500, fontSize: '14px', lineHeight: '32px' }}>
                {getString('pipeline.testsReports.callgraphTitle')}
              </Text>
              <FlexExpander />
              <Button
                minimal
                intent="primary"
                icon="canvas-position"
                className={css.expandButton}
                onClick={showCallGraphModal}
                disabled={callGraphLoading || !!callGraphError}
              >
                <span style={{ paddingLeft: 'var(--spacing-small)' }}>
                  {getString('pipeline.testsReports.expandGraph')}
                </span>
              </Button>
            </Layout.Horizontal>
            <Layout.Vertical spacing="small" className={css.callgraphBody}>
              <Text
                color={Color.GREY_400}
                padding="medium"
                font={{ size: 'small' }}
                lineClamp={1}
                className={css.graphTitle}
              >
                {selectedCallGraphClass || ''}
              </Text>
              <Container height={CALL_GRAPH_HEIGHT}>
                {(callGraphLoading || callGraphError) && (
                  <Container className={css.callgraphLoadingStatus}>
                    {callGraphLoading && <Icon name="spinner" />}
                    {callGraphError && (
                      <Text intent="danger" inline className={css.callgraphError}>
                        {get(callGraphError, 'data.error_msg', error?.message)}
                      </Text>
                    )}
                  </Container>
                )}
                {!callGraphLoading && selectedCallGraphClass && callGraphData && (
                  <TestsCallgraph
                    preview
                    selectedClass={selectedCallGraphClass}
                    graph={callGraphData as CallGraphAPIResponse}
                    onNodeClick={showCallGraphModal}
                  />
                )}
              </Container>
              {renderCallGraphFooter(true)}
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Horizontal>
    </div>
  )
}
