/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Highcharts from 'highcharts'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import type { TestReportSummary } from 'services/ti-service'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { TestWrapper } from '@common/utils/testUtils'
import * as tiService from 'services/ti-service'
import ReportsSummaryMock from './mock/reports-summary.json'
import OverviewMock from './mock/overview.json'
import TestSuiteMock from './mock/reports-test-suites.json'
import TestCaseMock from './mock/reports-test-cases.json'
import BuildsMock from './mock/builds.json'
import TotalTestsZeroMock from './mock/total-tests-zero.json'
import InfoMock from './mock/info.json'
import CallGraphMock from './mock/callgraph.json'
import BuildTests from '../BuildTests'

import { TestsCallgraph } from '../TestsCallgraph'

if (process.env.NODE_ENV === 'test') {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  Highcharts.useSerialIds(true)
}

jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: () => ({
    pipelineExecutionDetail: {
      pipelineExecutionSummary: BuildsMock
    }
  })
}))

describe('BuildTests snapshot test', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render TI+Reports UI', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)

    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <BuildTests reportSummaryMock={ReportsSummaryMock as TestReportSummary} testOverviewMock={OverviewMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render TI UI', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <BuildTests reportSummaryMock={TotalTestsZeroMock as TestReportSummary} testOverviewMock={OverviewMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render Reports UI', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <BuildTests />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render ungrouped Reports UI ', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)

    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <BuildTests />
      </TestWrapper>
    )

    const chevronDownButton = container.querySelector('[class*="expanded"] [data-icon="chevron-down"]')

    if (!chevronDownButton) {
      throw Error('Cannot find chevron down button')
    }
    expect(document.querySelector('[class*="sortBySelect"]')).not.toBeNull()
    expect(document.querySelector('[class*="activeGroupedIcon"] [data-icon="list-view"]')).toBeNull()

    const ungroupedButton = container.querySelector('[data-icon="list-view"]')
    if (!ungroupedButton) {
      throw Error('Cannot find ungrouped button')
    }
    fireEvent.click(ungroupedButton)
    await waitFor(() => expect(() => container.querySelector('data-icon="spinner"')).not.toBeNull())
    await waitFor(() =>
      expect(() => document.querySelector('[class*="activeGroupedIcon"] [data-icon="list-view"]')).not.toBeNull()
    )
    await waitFor(() =>
      expect(() =>
        queryByText(document.body, 'testShouldCollectData_logsMoreThan60MinSinceLastCollectionWithinBuffer')
      ).not.toBeNull()
    )
    expect(document.querySelector('[class*="sortBySelect"]')).toBeNull()
  })

  test('should render ungrouped Reports UI with caret down for ASC test name data ', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)

    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <BuildTests reportSummaryMock={ReportsSummaryMock as TestReportSummary} testOverviewMock={TotalTestsZeroMock} />
      </TestWrapper>
    )

    const chevronDownButton = container.querySelector('[class*="expanded"] [data-icon="chevron-down"]')

    if (!chevronDownButton) {
      throw Error('Cannot find chevron down button')
    }
    const ungroupedButton = container.querySelector('[data-icon="list-view"]')
    if (!ungroupedButton) {
      throw Error('Cannot find ungrouped button')
    }
    fireEvent.click(ungroupedButton)
    await waitFor(() => expect(() => container.querySelector('data-icon="spinner"')).not.toBeNull())
    await waitFor(() =>
      expect(() =>
        queryByText(document.body, 'testShouldCollectData_logsMoreThan60MinSinceLastCollectionWithinBuffer')
      ).not.toBeNull()
    )
    const testNameColumnHeader = container.querySelectorAll('[class*="testSuiteTable"] [role="columnheader"]')?.[1]
    if (!testNameColumnHeader) {
      throw Error('Cannot find testNameColumnHeader button')
    }

    fireEvent.click(testNameColumnHeader)

    await waitFor(() => expect(() => container.querySelector('data-icon="spinner"')).not.toBeNull())

    await waitFor(() =>
      expect(() => document.body.querySelector('[class*="testSuiteTable"] [data-icon="caret-down"]')).not.toBeNull()
    )
  })

  test('should render ZeroState UI', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <BuildTests reportSummaryMock={TotalTestsZeroMock as TestReportSummary} testOverviewMock={TotalTestsZeroMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Call Graph preview should be renderred properly', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    const { container } = render(
      <TestsCallgraph
        preview
        selectedClass="io.harness.jhttp.functional.HttpClientTest"
        graph={CallGraphMock}
        onNodeClick={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Call Graph full view should be renderred properly', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    const { container } = render(
      <TestsCallgraph
        selectedClass="io.harness.jhttp.functional.HttpClientTest"
        graph={CallGraphMock}
        onNodeClick={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Call Graph full view should handle search properly', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    const { container } = render(
      <TestsCallgraph
        selectedClass="io.harness.jhttp.functional.HttpClientTest"
        graph={CallGraphMock}
        onNodeClick={jest.fn()}
        searchTerm="testStaticFile"
      />
    )
    expect(container).toMatchSnapshot()
  })
})
