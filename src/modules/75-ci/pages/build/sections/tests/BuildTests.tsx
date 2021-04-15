import { Layout } from '@wings-software/uicore'
import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { PageError } from '@common/components/Page/PageError'
import { useReportSummary, useGetToken, useTestOverview } from 'services/ti-service'
import { PageSpinner } from '@common/components'
import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import { BuildLoadingState } from './BuildLoadingState'
import { BuildZeroState } from './BuildZeroState'
import { TestsExecution } from './TestsExecution'
import { TestsOverview } from './TestsOverview'
import { TestsExecutionResult } from './TestsExecutionResult'
import { TestsSelectionBreakdown } from './TestsSelectionBreakdown'
import { TestsReportOverview } from './TestsReportOverview'
// import { TestsCoverage } from './TestsCoverage'
import { isExecutionComplete } from './TestsUtils'
import css from './BuildTests.module.scss'

enum UI {
  TIAndReports,
  TI,
  Reports,
  ZeroState
}

const BuildTests: React.FC = () => {
  const context = useExecutionContext()
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

  const queryParams = useMemo(
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
    data: reportSummaryData,
    error: reportSummaryError,
    loading: reportSummaryLoading,
    refetch: fetchReportSummary
  } = useReportSummary({
    queryParams: { ...queryParams, report: 'junit' as 'junit' },
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    }
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
    }
  })

  const status = (context?.pipelineExecutionDetail?.pipelineExecutionSummary?.status || '').toUpperCase()
  const isBuildComplete = isExecutionComplete(status)

  const reportSummaryHasTests = (reportSummaryData?.total_tests || 0) > 0
  const testOverviewHasTests = (testOverviewData?.total_tests || 0) > 0

  const uiType =
    reportSummaryHasTests && testOverviewHasTests
      ? UI.TIAndReports
      : !reportSummaryHasTests && testOverviewHasTests
      ? UI.TI
      : reportSummaryHasTests && !testOverviewHasTests
      ? UI.Reports
      : UI.ZeroState

  useEffect(() => {
    if (status && isBuildComplete && serviceToken) {
      if (!reportSummaryData && !reportSummaryError && !reportSummaryLoading) {
        fetchReportSummary()
      }
      if (!testOverviewData && !testOverviewError && !testOverviewLoading) {
        fetchTestOverview()
      }
    }
  }, [
    status,
    isBuildComplete,
    serviceToken,
    reportSummaryData,
    reportSummaryError,
    reportSummaryLoading,
    fetchReportSummary,
    testOverviewData,
    testOverviewError,
    testOverviewLoading,
    fetchTestOverview
  ])

  // When build/execution is not resolved from context, render nothing
  if (!status) {
    return null
  }

  if (reportSummaryLoading || serviceTokenLoading || testOverviewLoading) {
    return <PageSpinner />
  }

  const error = reportSummaryError || serviceTokenError || testOverviewError

  if (error) {
    return (
      <PageError
        message={get(error, 'data.error_msg', error?.message)}
        onClick={() => {
          fetchReportSummary()
          refetchServiceToken()
          fetchTestOverview()
        }}
      />
    )
  }

  let ui = null
  switch (uiType) {
    case UI.ZeroState:
      ui = <BuildZeroState />
      break
    case UI.TIAndReports:
      ui = (
        <>
          <Layout.Horizontal spacing="large" margin={{ bottom: 'xlarge' }}>
            {typeof testOverviewData?.total_tests !== 'undefined' &&
              typeof testOverviewData?.skipped_tests !== 'undefined' &&
              typeof testOverviewData?.time_saved_ms !== 'undefined' &&
              typeof reportSummaryData?.duration_ms !== 'undefined' && (
                <TestsOverview
                  totalTests={testOverviewData.total_tests}
                  skippedTests={testOverviewData.skipped_tests}
                  timeSavedMS={testOverviewData.time_saved_ms}
                  durationMS={reportSummaryData.duration_ms}
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
            {serviceToken && <TestsExecution serviceToken={serviceToken} />}
          </Layout.Horizontal>
        </>
      )
      break
    case UI.TI:
      ui = (
        <Layout.Horizontal spacing="large" margin={{ bottom: 'xlarge' }}>
          {typeof testOverviewData?.total_tests !== 'undefined' &&
            typeof testOverviewData?.skipped_tests !== 'undefined' &&
            typeof testOverviewData?.time_saved_ms !== 'undefined' && (
              <TestsOverview
                totalTests={testOverviewData.total_tests}
                skippedTests={testOverviewData.skipped_tests}
                timeSavedMS={testOverviewData.time_saved_ms}
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
      )
      break
    case UI.Reports:
      ui = (
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
          {serviceToken && <TestsExecution serviceToken={serviceToken} />}
        </Layout.Horizontal>
      )
      break
  }

  return (
    <div className={css.mainContainer}>
      {isBuildComplete && serviceToken && ui}
      {!isBuildComplete && <BuildLoadingState />}
    </div>
  )
}

export default BuildTests
