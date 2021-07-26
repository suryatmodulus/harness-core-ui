import { Layout, Select, Text, Container, SelectOption } from '@wings-software/uicore'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { get, uniqWith, isEqual } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { PageError } from '@common/components/Page/PageError'
import {
  useReportSummary,
  useGetToken,
  useTestOverview,
  useReportsInfo,
  useTestInfo,
  TestReportSummary,
  SelectionOverview
} from 'services/ti-service'
import { PageSpinner } from '@common/components'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { BuildLoadingState } from './BuildLoadingState'
import { BuildZeroState } from './BuildZeroState'
import { TestsExecution } from './TestsExecution'
import { TestsOverview } from './TestsOverview'
import { TestsExecutionResult } from './TestsExecutionResult'
import { TestsSelectionBreakdown } from './TestsSelectionBreakdown'
import { TestsReportOverview } from './TestsReportOverview'
import { isExecutionComplete } from './TestsUtils'
// import { TestsCoverage } from './TestsCoverage'
import css from './BuildTests.module.scss'

enum UI {
  TIAndReports,
  TI,
  Reports,
  ZeroState,
  LoadingState
}

interface BuildTestsProps {
  reportSummaryMock?: TestReportSummary
  testOverviewMock?: SelectionOverview
}

const BuildTests: React.FC<BuildTestsProps> = ({ reportSummaryMock, testOverviewMock }) => {
  const context = useExecutionContext()

  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const {
    data: serviceToken,
    loading: serviceTokenLoading,
    error: serviceTokenError,
    refetch: refetchServiceToken
  } = useGetToken({
    queryParams: { accountId }
  })

  const [selectItems, setSelectItems] = useState<SelectOption[]>([])
  const [selectValue, setSelectValue] = useState<SelectOption>()

  const [stageId, stepId] = (selectValue?.value as string)?.split('/') || []

  const status = (context?.pipelineExecutionDetail?.pipelineExecutionSummary?.status || '').toUpperCase()

  const infoQueryParams = useMemo(
    () => ({
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      pipelineId: context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || '',
      buildId: String(context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || '')
    }),
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence
    ]
  )

  const {
    data: reportInfoData,
    error: reportInfoError,
    loading: reportInfoLoading,
    refetch: fetchReportInfo
  } = useReportsInfo({
    queryParams: infoQueryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    }
  })

  const {
    data: testInfoData,
    error: testInfoError,
    loading: testInfoLoading,
    refetch: fetchTestInfo
  } = useTestInfo({
    queryParams: infoQueryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    }
  })

  useEffect(() => {
    if (isExecutionComplete(status) && serviceToken) {
      fetchReportInfo()
      fetchTestInfo()
    }
  }, [status, serviceToken])

  useEffect(() => {
    if (reportInfoData && testInfoData) {
      const uniqItems = uniqWith([...reportInfoData, ...testInfoData], isEqual)
      const readySelectItems = uniqItems.map(({ stage, step }) => ({
        label: `Step: ${step} (Stage: ${stage})`,
        value: `${stage}/${step}`
      }))
      setSelectItems(readySelectItems as SelectOption[])
      setSelectValue(readySelectItems[0] as SelectOption)
    }
  }, [reportInfoData, testInfoData])

  const queryParams = useMemo(
    () => ({
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      pipelineId: context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || '',
      buildId: String(context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || ''),
      stageId,
      stepId
    }),
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence,
      stageId,
      stepId
    ]
  )

  const {
    data: reportSummaryData,
    error: reportSummaryError,
    loading: reportSummaryLoading,
    refetch: fetchReportSummary
  } = useReportSummary({
    queryParams: { ...queryParams, report: 'junit' as const },
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    },
    mock: reportSummaryMock
      ? {
          data: reportSummaryMock
        }
      : undefined
  })

  const {
    data: testOverviewData,
    error: testOverviewError,
    loading: testOverviewLoading,
    refetch: fetchTestOverview
  } = useTestOverview({
    queryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    },
    mock: testOverviewMock
      ? {
          data: testOverviewMock
        }
      : undefined
  })

  const reportSummaryHasTests = (reportSummaryData?.total_tests || 0) > 0
  const testOverviewHasTests = (testOverviewData?.total_tests || 0) > 0

  const uiType =
    reportSummaryHasTests && testOverviewHasTests
      ? UI.TIAndReports
      : !reportSummaryHasTests && testOverviewHasTests
      ? UI.TI
      : reportSummaryHasTests && !testOverviewHasTests
      ? UI.Reports
      : reportInfoLoading || testInfoLoading
      ? UI.LoadingState
      : UI.ZeroState

  useEffect(() => {
    if (isExecutionComplete(status) && stageId && stepId) {
      fetchReportSummary()
      fetchTestOverview()
    }
  }, [stageId, stepId, status])

  const testsCountDiff = useMemo(() => {
    const newTests = testOverviewData?.selected_tests?.new_tests
    const total = testOverviewData?.total_tests
    if (newTests && total) {
      return Number(Number(newTests / (total / 100)).toFixed(2))
    }
    return 0
  }, [testOverviewData?.total_tests, testOverviewData?.selected_tests?.new_tests])

  // When build/execution is not resolved from context, render nothing
  if (!status) {
    return null
  }

  const error = reportSummaryError || serviceTokenError || testOverviewError || reportInfoError || testInfoError

  if (error) {
    return (
      <PageError
        message={get(error, 'data.error_msg', error?.message)}
        onClick={() => {
          refetchServiceToken()

          if (serviceToken) {
            fetchReportInfo()
            fetchTestInfo()

            if (stageId && stepId) {
              fetchReportSummary()
              fetchTestOverview()
            }
          }
        }}
      />
    )
  }

  if (serviceTokenLoading || reportInfoLoading || testInfoLoading || testOverviewLoading || reportSummaryLoading) {
    return <PageSpinner />
  }

  const header = (
    <Container
      flex
      padding={{ bottom: 'small' }}
      margin={{ bottom: 'medium' }}
      style={{ borderBottom: '1px solid #D9DAE6' }}
    >
      <Text font={{ size: 'medium', weight: 'semi-bold' }} style={{ color: '#22222A' }}>
        {getString('pipeline.testsReports.testExecutions')}
      </Text>
      {selectItems && selectValue && (
        <div style={{ width: '375px' }}>
          <Select fill value={selectValue} items={selectItems} onChange={value => setSelectValue(value as any)} />
        </div>
      )}
    </Container>
  )

  let ui = null
  switch (uiType) {
    case UI.LoadingState:
      ui = <BuildLoadingState />
      break
    case UI.ZeroState:
      ui = <BuildZeroState />
      break
    case UI.TIAndReports:
      ui = (
        <>
          {header}
          <Layout.Horizontal spacing="large" margin={{ bottom: 'xlarge' }}>
            {typeof testOverviewData?.total_tests !== 'undefined' &&
              typeof testOverviewData?.skipped_tests !== 'undefined' &&
              typeof testOverviewData?.time_saved_ms !== 'undefined' &&
              typeof testOverviewData?.time_taken_ms !== 'undefined' && (
                <TestsOverview
                  totalTests={testOverviewData.total_tests}
                  skippedTests={testOverviewData.skipped_tests}
                  timeSavedMS={testOverviewData.time_saved_ms}
                  durationMS={testOverviewData?.time_taken_ms}
                  testsCountDiff={testsCountDiff}
                />
              )}
            {reportSummaryData?.total_tests && reportSummaryData?.tests && (
              <TestsExecutionResult totalTests={reportSummaryData.total_tests} tests={reportSummaryData.tests} />
            )}
            {typeof testOverviewData?.selected_tests?.source_code_changes !== 'undefined' &&
              typeof testOverviewData?.selected_tests?.new_tests !== 'undefined' &&
              typeof testOverviewData?.selected_tests?.updated_tests !== 'undefined' && (
                <TestsSelectionBreakdown
                  sourceCodeChanges={testOverviewData.selected_tests.source_code_changes}
                  newTests={testOverviewData.selected_tests.new_tests}
                  updatedTests={testOverviewData.selected_tests.updated_tests}
                />
              )}
          </Layout.Horizontal>
          <Layout.Horizontal spacing="large">
            {/* <TestsCoverage /> */}
            {/* TI is above Reports which is 100% width */}
            {stageId && stepId && serviceToken && (
              <TestsExecution stageId={stageId} stepId={stepId} serviceToken={serviceToken} />
            )}
          </Layout.Horizontal>
        </>
      )
      break
    case UI.TI:
      ui = (
        <>
          {header}
          <Layout.Horizontal spacing="large" margin={{ bottom: 'xlarge' }}>
            {typeof testOverviewData?.total_tests !== 'undefined' &&
              typeof testOverviewData?.skipped_tests !== 'undefined' &&
              typeof testOverviewData?.time_saved_ms !== 'undefined' && (
                <TestsOverview
                  totalTests={testOverviewData.total_tests}
                  skippedTests={testOverviewData.skipped_tests}
                  timeSavedMS={testOverviewData.time_saved_ms}
                  testsCountDiff={testsCountDiff}
                />
              )}
            {typeof testOverviewData?.selected_tests?.source_code_changes !== 'undefined' &&
              typeof testOverviewData?.selected_tests?.new_tests !== 'undefined' &&
              typeof testOverviewData?.selected_tests?.updated_tests !== 'undefined' && (
                <TestsSelectionBreakdown
                  sourceCodeChanges={testOverviewData.selected_tests.source_code_changes}
                  newTests={testOverviewData.selected_tests.new_tests}
                  updatedTests={testOverviewData.selected_tests.updated_tests}
                />
              )}
          </Layout.Horizontal>
        </>
      )
      break
    case UI.Reports:
      ui = (
        <>
          {header}
          <Layout.Horizontal spacing="large">
            {typeof reportSummaryData?.total_tests !== 'undefined' &&
              typeof reportSummaryData?.duration_ms !== 'undefined' &&
              typeof reportSummaryData?.tests !== 'undefined' && (
                <TestsReportOverview
                  totalTests={reportSummaryData.total_tests}
                  durationMS={reportSummaryData.duration_ms}
                  tests={reportSummaryData.tests}
                />
              )}
            {/* Overview and Reports split the width  */}
            {stageId && stepId && serviceToken && (
              <TestsExecution splitview={true} stageId={stageId} stepId={stepId} serviceToken={serviceToken} />
            )}
          </Layout.Horizontal>
        </>
      )
      break
    default:
      ui = <BuildZeroState />
      break
  }

  return <div className={css.mainContainer}>{ui}</div>
}

export default BuildTests
