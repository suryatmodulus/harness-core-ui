import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Intent, ProgressBar } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { Button, Color, Icon, Container, Text, useIsMounted, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import type { CellProps, Column, Renderer } from 'react-table'
import { TestSuite, useTestCaseSummary, TestCase, TestCaseSummaryQueryParams } from 'services/ti-service'
import { useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import Table from '@common/components/Table/Table'
import { renderFailureRate } from './TestsUtils'
import { TestsFailedPopover } from './TestsFailedPopover'
import css from './BuildTests.module.scss'

const NOW = Date.now()
const PAGE_SIZE = 10

export interface TestExecutionEntryProps {
  buildIdentifier: string
  serviceToken: string
  executionSummary: TestSuite
  expanded?: boolean
  status?: 'failed'
  onExpand: () => void
  stageId: string
  stepId: string
}

export const TestsExecutionItem: React.FC<TestExecutionEntryProps> = ({
  buildIdentifier,
  serviceToken,
  executionSummary,
  expanded,
  status,
  onExpand,
  stageId,
  stepId
}) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, pipelineIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
  }>()
  const [pageIndex, setPageIndex] = useState(0)
  const queryParams = ({
    accountId,
    orgId: orgIdentifier,
    projectId: projectIdentifier,
    buildId: buildIdentifier,
    pipelineId: pipelineIdentifier,
    report: 'junit' as const,
    suite_name: executionSummary.name,
    status,
    sort: 'status',
    order: 'ASC',
    pageIndex,
    pageSize: PAGE_SIZE,
    stageId,
    stepId
  } as unknown) as TestCaseSummaryQueryParams

  const { data, error, loading, refetch } = useTestCaseSummary({
    queryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken
      }
    }
  })
  const isMounted = useIsMounted()
  const refetchData = useCallback(
    (params: TestCaseSummaryQueryParams) => {
      setTimeout(() => {
        if (isMounted.current) {
          refetch({ queryParams: params })
        }
      }, 250)
    },
    [isMounted, refetch]
  )
  const renderColumn = useMemo(
    () => (col: keyof TestCase | 'order') => {
      let itemOrderNumber = 0
      return (props => {
        const { row, rows } = props
        const failed = ['error', 'failed'].includes(row.original?.result?.status || '')
        const tooltip = failed && col === 'name' ? <TestsFailedPopover testCase={row.original} /> : undefined

        itemOrderNumber++

        if (itemOrderNumber > rows.length) {
          itemOrderNumber = 1
        }

        return (
          <Container width="90%" className={css.testCell}>
            <Text
              className={cx(css.text, tooltip && css.failed)}
              color={failed && col !== 'order' ? Color.RED_700 : Color.GREY_700}
              lineClamp={!tooltip ? 1 : undefined}
              tooltip={tooltip}
            >
              {col === 'order' ? (
                PAGE_SIZE * pageIndex + itemOrderNumber + '.'
              ) : col === 'result' ? (
                row.original[col]?.status
              ) : col === 'duration_ms' ? (
                <Duration icon={undefined} durationText=" " startTime={NOW} endTime={NOW + (row.original[col] || 0)} />
              ) : (
                row.original[col]
              )}
            </Text>
          </Container>
        )
      }) as Renderer<CellProps<TestCase>>
    },
    [pageIndex]
  )
  const columns: Column<TestCase>[] = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'order' as 'name',
        width: '50px',
        Cell: renderColumn('order'),
        disableSortBy: true
      },
      {
        Header: getString('pipeline.testsReports.testCaseName'),
        accessor: 'name',
        width: 'calc(50% - 130px)',
        Cell: renderColumn('name'),
        disableSortBy: (data?.content?.length || 0) === 1
      },
      {
        Header: getString('pipeline.testsReports.className'),
        accessor: 'class_name',
        width: 'calc(50% - 120px)',
        Cell: renderColumn('class_name'),
        disableSortBy: (data?.content?.length || 0) === 1
      },
      {
        Header: getString('pipeline.testsReports.result'),
        accessor: 'result',
        width: '100px',
        Cell: renderColumn('result'),
        disableSortBy: (data?.content?.length || 0) === 1
      },
      {
        Header: getString('pipeline.duration').toUpperCase(),
        accessor: 'duration_ms',
        width: '100px',
        Cell: renderColumn('duration_ms'),
        disableSortBy: (data?.content?.length || 0) === 1
      }
    ],
    [getString, renderColumn, data?.content?.length]
  )
  const failureRate = (executionSummary.failed_tests || 0) / (executionSummary.total_tests || 1)

  useEffect(() => {
    if (expanded) {
      if (!data) {
        refetchData(queryParams)
      }
    }
  }, [expanded, queryParams, refetchData, data])

  useEffect(() => {
    refetchData(queryParams)
  }, [status])

  return (
    <Container className={cx(css.widget, css.testSuite, expanded && css.expanded)} padding="medium">
      <Container flex className={css.headingContainer}>
        <Text
          className={css.testSuiteHeading}
          color={Color.GREY_500}
          style={{ flexGrow: 1, textAlign: 'left', justifyContent: 'flex-start' }}
        >
          <Button minimal large icon={expanded ? 'chevron-down' : 'chevron-right'} onClick={onExpand} />
          <Text className={css.testSuiteName} tooltip={<Container padding="small">{executionSummary.name}</Container>}>
            {getString('pipeline.testsReports.testSuite')} {executionSummary.name}
          </Text>
        </Text>
        <Text
          className={cx(css.testSuiteHeading, css.withSeparator)}
          color={Color.GREY_500}
          font={{ size: 'small' }}
          padding={{ left: 'small', right: 'small' }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>{getString('pipeline.testsReports.totalTests')}</span>
          <span>{executionSummary.total_tests}</span>
        </Text>
        <Text
          className={cx(css.testSuiteHeading, css.withSeparator)}
          color={Color.GREY_500}
          font={{ size: 'small' }}
          padding={{ left: 'small', right: 'small' }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>{getString('pipeline.testsReports.failedTests')}</span>
          <span>{executionSummary.failed_tests}</span>
        </Text>
        <Text
          className={cx(css.testSuiteHeading, css.withSeparator)}
          color={Color.GREY_500}
          font={{ size: 'small' }}
          padding={{ left: 'small', right: 'small' }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>{getString('common.failureRate')}</span>
          <span>{renderFailureRate(failureRate)}%</span>
        </Text>
        <Layout.Vertical spacing="xsmall" style={{ marginRight: 'var(--spacing-large)' }} flex>
          <Duration
            icon="time"
            durationText=" "
            startTime={NOW}
            endTime={NOW + (executionSummary.duration_ms || 0)}
            font={{ size: 'small' }}
            color={Color.GREY_500}
            iconProps={{ color: Color.GREY_500, size: 12 }}
          />
          <ProgressBar
            className={css.progressBar}
            animate={false}
            intent={failureRate > 0 ? Intent.DANGER : Intent.SUCCESS}
            stripes={false}
            value={failureRate || 1}
          />
        </Layout.Vertical>
      </Container>
      {expanded && (
        <>
          {loading && (
            <Container flex={{ align: 'center-center' }} padding="xlarge">
              <Icon name="spinner" size={24} color="blue500" />
            </Container>
          )}
          {!loading && error && (
            <Container flex={{ align: 'center-center' }} padding="large">
              <Text icon="error" color={Color.RED_500} iconProps={{ size: 16, color: Color.RED_500 }}>
                {get(error, 'data.error_msg', error?.message)}
              </Text>
            </Container>
          )}
          {!loading && !error && (
            <Table<TestCase>
              className={css.testSuiteTable}
              columns={columns}
              data={data?.content || []}
              pagination={
                (data?.data?.totalItems || 0) > PAGE_SIZE
                  ? {
                      itemCount: data?.data?.totalItems || 0,
                      pageSize: data?.data?.pageSize || 0,
                      pageCount: data?.data?.totalPages || 0,
                      pageIndex,
                      gotoPage: pageIdx => {
                        setPageIndex(pageIdx)
                        refetchData({
                          ...queryParams,
                          pageIndex: pageIdx
                        })
                      }
                    }
                  : undefined
              }
            />
          )}
        </>
      )}
    </Container>
  )
}
