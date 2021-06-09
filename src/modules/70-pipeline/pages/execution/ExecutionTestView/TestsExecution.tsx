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
  useModalHook
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { PageError } from '@common/components/Page/PageError'
import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import { TestSuiteSummaryQueryParams, useTestSuiteSummary } from 'services/ti-service'
import { isExecutionComplete } from '@pipeline/utils/statusHelpers'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { TestsCallgraph } from './TestsCallgraph/TestsCallgraph'
import { TestsExecutionItem } from './TestsExecutionItem'
import { SortByKey } from './TestsUtils'
import css from './BuildTests.module.scss'

const PAGE_SIZE = 20

interface TestsExecutionProps {
  serviceToken: string
}

export const TestsExecution: React.FC<TestsExecutionProps> = ({ serviceToken }) => {
  const context = useExecutionContext()
  const callgraphEnabled = useFeatureFlag('TI_CALLGRAPH') || localStorage.TI_CALLGRAPH_ENABLED
  const { getString } = useStrings()
  const status = (context?.pipelineExecutionDetail?.pipelineExecutionSummary?.status || '').toUpperCase()

  const [showModal, hideModal] = useModalHook(() => (
    <Dialog
      className={css.callgraphDialog}
      title={getString('pipeline.testsReports.callgraphTitle')}
      isCloseButtonShown
      isOpen
      onClose={() => hideModal()}
    >
      <TestsCallgraph />
    </Dialog>
  ))

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
      order: 'DESC' as const
    }),
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence,
      pageIndex,
      sortBy
    ]
  )
  const { data: executionSummary, error, loading, refetch: fetchExecutionSummary } = useTestSuiteSummary({
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

  useEffect(() => {
    if (status) {
      if ((!isExecutionComplete(status) && !loading) || (!executionSummary && !error && !loading)) {
        fetchExecutionSummary({ queryParams })
      }
    }
  }, [status, executionSummary, error, loading, fetchExecutionSummary, queryParams])

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
        {!loading && callgraphEnabled && (
          <Button
            className={css.viewCallgraph}
            color={Color.PRIMARY_7}
            icon="graph"
            iconProps={{
              margin: {
                right: 'small'
              }
            }}
            minimal
            onClick={showModal}
          >
            {getString('pipeline.testsReports.viewCallgraph')}
          </Button>
        )}
      </Container>

      <Container className={css.widget} padding="medium">
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
                  pageIndex: 0
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
                    key={summary.name}
                    buildIdentifier={String(
                      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || ''
                    )}
                    executionSummary={summary}
                    serviceToken={serviceToken}
                    status={showFailedTestsOnly ? 'failed' : undefined}
                    expanded={index === expandedIndex ? true : undefined}
                    onExpand={() => {
                      setExpandedIndex(expandedIndex !== index ? index : undefined)
                    }}
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
    </div>
  )
}
