/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '1.0.0'
export interface Error {
  /**
   * Details about the error encountered
   */
  error_msg?: string
}

export interface ResponseMetadata {
  pageItemCount?: number
  pageSize?: number
  totalItems?: number
  totalPages?: number
}

export interface Result {
  /**
   * Description corresponding to the test case status
   */
  desc?: string
  /**
   * Message corresponding to the test case status
   */
  message?: string
  status?: TestCaseStatus
  /**
   * Type corresponding to the test case status
   */
  type?: string
}

export interface SelectionDetails {
  new_tests?: number
  source_code_changes?: number
  updated_tests?: number
}

export interface SelectionOverview {
  selected_tests?: SelectionDetails
  skipped_tests?: number
  time_saved_ms?: number
  time_taken_ms?: number
  total_tests?: number
}

export interface StepInfo {
  stage?: string
  step?: string
}

export interface TestCase {
  class_name?: string
  duration_ms?: number
  name?: string
  result?: Result
  /**
   * (Truncated) stderr while running the test
   */
  stderr?: string
  /**
   * (Truncated) stdout while running the test
   */
  stdout?: string
  suite_name?: string
}

/**
 * Status of the test
 */
export type TestCaseStatus = 'passed' | 'skipped' | 'error' | 'failed'

export interface TestCases {
  content?: TestCase[]
  data?: ResponseMetadata
}

export interface TestReportSummary {
  duration_ms?: number
  failed_tests?: number
  skipped_tests?: number
  successful_tests?: number
  total_tests?: number
}

export interface TestSuite {
  duration_ms?: number
  fail_pct?: number
  failed_tests?: number
  name?: string
  passed_tests?: number
  skipped_tests?: number
  total_tests?: number
}

export interface TestSuites {
  content?: TestSuite[]
  data?: ResponseMetadata
}

export interface VisEdge {
  from?: number
  to?: number[]
}

export interface VisGraph {
  edges?: VisEdge[]
  nodes?: VisNode[]
}

export interface VisNode {
  class?: string
  /**
   * Only populated for resource types
   */
  file?: string
  id?: number
  /**
   * Whether the node should be specially marked in the UI or not
   */
  important?: boolean
  method?: string
  package?: string
  params?: string
  /**
   * Whether to use this node as the root node in the UI or not
   */
  root?: boolean
  /**
   * Can be test | source | resource
   */
  type?: string
}

export interface ReportsInfoQueryParams {
  /**
   * Account ID
   */
  accountId: string
  /**
   * Org ID
   */
  orgId: string
  /**
   * Project ID
   */
  projectId: string
  /**
   * Pipeline ID
   */
  pipelineId: string
  /**
   * Build ID
   */
  buildId: string
}

export type ReportsInfoProps = Omit<GetProps<StepInfo[], Error, ReportsInfoQueryParams, void>, 'path'>

/**
 * Get information about steps with reports configured
 *
 * Get information about test reports
 */
export const ReportsInfo = (props: ReportsInfoProps) => (
  <Get<StepInfo[], Error, ReportsInfoQueryParams, void>
    path={`/reports/info`}
    base={getConfig('ti-service')}
    {...props}
  />
)

export type UseReportsInfoProps = Omit<UseGetProps<StepInfo[], Error, ReportsInfoQueryParams, void>, 'path'>

/**
 * Get information about steps with reports configured
 *
 * Get information about test reports
 */
export const useReportsInfo = (props: UseReportsInfoProps) =>
  useGet<StepInfo[], Error, ReportsInfoQueryParams, void>(`/reports/info`, { base: getConfig('ti-service'), ...props })

export interface ReportSummaryQueryParams {
  /**
   * Account ID corresponding to report
   */
  accountId: string
  /**
   * Org ID corresponding to report
   */
  orgId: string
  /**
   * Project ID corresponding to report
   */
  projectId: string
  /**
   * Pipeline ID corresponding to report
   */
  pipelineId: string
  /**
   * Build ID corresponding to report
   */
  buildId: string
  /**
   * Report type
   */
  report: 'junit'
  /**
   * Step ID
   */
  stepId?: string
  /**
   * Stage ID
   */
  stageId: string
}

export type ReportSummaryProps = Omit<GetProps<TestReportSummary, Error, ReportSummaryQueryParams, void>, 'path'>

/**
 * Get test report summary
 *
 * Get summary of test reports
 */
export const ReportSummary = (props: ReportSummaryProps) => (
  <Get<TestReportSummary, Error, ReportSummaryQueryParams, void>
    path={`/reports/summary`}
    base={getConfig('ti-service')}
    {...props}
  />
)

export type UseReportSummaryProps = Omit<UseGetProps<TestReportSummary, Error, ReportSummaryQueryParams, void>, 'path'>

/**
 * Get test report summary
 *
 * Get summary of test reports
 */
export const useReportSummary = (props: UseReportSummaryProps) =>
  useGet<TestReportSummary, Error, ReportSummaryQueryParams, void>(`/reports/summary`, {
    base: getConfig('ti-service'),
    ...props
  })

export interface TestCaseSummaryQueryParams {
  /**
   * Account ID corresponding to report
   */
  accountId: string
  /**
   * Org ID corresponding to report
   */
  orgId: string
  /**
   * Project ID corresponding to report
   */
  projectId: string
  /**
   * Pipeline ID corresponding to report
   */
  pipelineId: string
  /**
   * Build ID corresponding to report
   */
  buildId: string
  /**
   * Step ID
   */
  stepId: string
  /**
   * Stage ID
   */
  stageId: string
  /**
   * Report type
   */
  report: 'junit'
  /**
   * Get test cases corresponding to the suite name
   */
  suite_name: string
  /**
   * Max number of elements in response
   */
  pageSize?: number
  /**
   * Index of the page whose responses need to be returned
   */
  pageIndex?: number
  /**
   * Filter by status
   */
  status?: 'failed'
  /**
   * Attribute to sort on
   */
  sort?: 'name' | 'class_name' | 'status' | 'duration_ms'
  /**
   * Display results in ascending or descending order
   */
  order?: 'ASC' | 'DESC'
}

export type TestCaseSummaryProps = Omit<GetProps<TestCases, Error, TestCaseSummaryQueryParams, void>, 'path'>

/**
 * Get test cases
 *
 * Get test case details
 */
export const TestCaseSummary = (props: TestCaseSummaryProps) => (
  <Get<TestCases, Error, TestCaseSummaryQueryParams, void>
    path={`/reports/test_cases`}
    base={getConfig('ti-service')}
    {...props}
  />
)

export type UseTestCaseSummaryProps = Omit<UseGetProps<TestCases, Error, TestCaseSummaryQueryParams, void>, 'path'>

/**
 * Get test cases
 *
 * Get test case details
 */
export const useTestCaseSummary = (props: UseTestCaseSummaryProps) =>
  useGet<TestCases, Error, TestCaseSummaryQueryParams, void>(`/reports/test_cases`, {
    base: getConfig('ti-service'),
    ...props
  })

export interface TestSuiteSummaryQueryParams {
  /**
   * Account ID corresponding to report
   */
  accountId: string
  /**
   * Org ID corresponding to report
   */
  orgId: string
  /**
   * Project ID corresponding to report
   */
  projectId: string
  /**
   * Pipeline ID corresponding to report
   */
  pipelineId: string
  /**
   * Build ID corresponding to report
   */
  buildId: string
  /**
   * Step ID
   */
  stepId: string
  /**
   * Stage ID
   */
  stageId: string
  /**
   * Report type
   */
  report: 'junit'
  /**
   * Max number of elements in response
   */
  pageSize?: number
  /**
   * Index of the page whose responses need to be returned
   */
  pageIndex?: number
  /**
   * Filter by status
   */
  status?: 'failed'
  /**
   * Attribute to sort on
   */
  sort?: 'suite_name' | 'duration_ms' | 'total_tests' | 'skipped_tests' | 'passed_tests' | 'failed_tests' | 'fail_pct'
  /**
   * Display results in ascending or descending order
   */
  order?: 'ASC' | 'DESC'
}

export type TestSuiteSummaryProps = Omit<GetProps<TestSuites, Error, TestSuiteSummaryQueryParams, void>, 'path'>

/**
 * Get test suites
 *
 * Get information about test suites
 */
export const TestSuiteSummary = (props: TestSuiteSummaryProps) => (
  <Get<TestSuites, Error, TestSuiteSummaryQueryParams, void>
    path={`/reports/test_suites`}
    base={getConfig('ti-service')}
    {...props}
  />
)

export type UseTestSuiteSummaryProps = Omit<UseGetProps<TestSuites, Error, TestSuiteSummaryQueryParams, void>, 'path'>

/**
 * Get test suites
 *
 * Get information about test suites
 */
export const useTestSuiteSummary = (props: UseTestSuiteSummaryProps) =>
  useGet<TestSuites, Error, TestSuiteSummaryQueryParams, void>(`/reports/test_suites`, {
    base: getConfig('ti-service'),
    ...props
  })

export interface TestInfoQueryParams {
  /**
   * Account ID
   */
  accountId: string
  /**
   * Org ID
   */
  orgId: string
  /**
   * Project ID
   */
  projectId: string
  /**
   * Pipeline ID
   */
  pipelineId: string
  /**
   * Build ID
   */
  buildId: string
}

export type TestInfoProps = Omit<GetProps<StepInfo[], Error, TestInfoQueryParams, void>, 'path'>

/**
 * Get information about test intelligence steps
 *
 * Get information about TI steps
 */
export const TestInfo = (props: TestInfoProps) => (
  <Get<StepInfo[], Error, TestInfoQueryParams, void> path={`/tests/info`} base={getConfig('ti-service')} {...props} />
)

export type UseTestInfoProps = Omit<UseGetProps<StepInfo[], Error, TestInfoQueryParams, void>, 'path'>

/**
 * Get information about test intelligence steps
 *
 * Get information about TI steps
 */
export const useTestInfo = (props: UseTestInfoProps) =>
  useGet<StepInfo[], Error, TestInfoQueryParams, void>(`/tests/info`, { base: getConfig('ti-service'), ...props })

export interface TestOverviewQueryParams {
  /**
   * Account ID
   */
  accountId: string
  /**
   * Org ID
   */
  orgId: string
  /**
   * Project ID
   */
  projectId: string
  /**
   * Pipeline ID
   */
  pipelineId: string
  /**
   * Build ID
   */
  buildId: string
  /**
   * Step ID
   */
  stepId: string
  /**
   * Stage ID
   */
  stageId: string
}

export type TestOverviewProps = Omit<GetProps<SelectionOverview, Error, TestOverviewQueryParams, void>, 'path'>

/**
 * Get overview of selected tests
 *
 * Get overview of selected tests.
 */
export const TestOverview = (props: TestOverviewProps) => (
  <Get<SelectionOverview, Error, TestOverviewQueryParams, void>
    path={`/tests/overview`}
    base={getConfig('ti-service')}
    {...props}
  />
)

export type UseTestOverviewProps = Omit<UseGetProps<SelectionOverview, Error, TestOverviewQueryParams, void>, 'path'>

/**
 * Get overview of selected tests
 *
 * Get overview of selected tests.
 */
export const useTestOverview = (props: UseTestOverviewProps) =>
  useGet<SelectionOverview, Error, TestOverviewQueryParams, void>(`/tests/overview`, {
    base: getConfig('ti-service'),
    ...props
  })

export interface GetTokenQueryParams {
  /**
   * Account ID to generate token for
   */
  accountId: string
}

export type GetTokenProps = Omit<GetProps<string, Error, GetTokenQueryParams, void>, 'path'>

/**
 * Get an account level token
 */
export const GetToken = (props: GetTokenProps) => (
  <Get<string, Error, GetTokenQueryParams, void> path={`/token`} base={getConfig('ti-service')} {...props} />
)

export type UseGetTokenProps = Omit<UseGetProps<string, Error, GetTokenQueryParams, void>, 'path'>

/**
 * Get an account level token
 */
export const useGetToken = (props: UseGetTokenProps) =>
  useGet<string, Error, GetTokenQueryParams, void>(`/token`, { base: getConfig('ti-service'), ...props })

export interface VgSearchQueryParams {
  /**
   * Account ID
   */
  accountId: string
  /**
   * Org ID
   */
  orgId: string
  /**
   * Project ID
   */
  projectId: string
  /**
   * Pipeline ID
   */
  pipelineId: string
  /**
   * Build ID
   */
  buildId: string
  /**
   * Step ID
   */
  stepId: string
  /**
   * Stage ID
   */
  stageId: string
  /**
   * Limit on number of nodes to show
   */
  limit?: number
  /**
   * Fully qualified class name to search for
   */
  class?: string
}

export type VgSearchProps = Omit<GetProps<VisGraph, Error, VgSearchQueryParams, void>, 'path'>

/**
 * Get visualisation callgraph
 *
 * Get visualisation callgraph for the repository
 */
export const VgSearch = (props: VgSearchProps) => (
  <Get<VisGraph, Error, VgSearchQueryParams, void> path={`/vg`} base={getConfig('ti-service')} {...props} />
)

export type UseVgSearchProps = Omit<UseGetProps<VisGraph, Error, VgSearchQueryParams, void>, 'path'>

/**
 * Get visualisation callgraph
 *
 * Get visualisation callgraph for the repository
 */
export const useVgSearch = (props: UseVgSearchProps) =>
  useGet<VisGraph, Error, VgSearchQueryParams, void>(`/vg`, { base: getConfig('ti-service'), ...props })
