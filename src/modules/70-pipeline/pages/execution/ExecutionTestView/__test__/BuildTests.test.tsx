import React from 'react'
import { render } from '@testing-library/react'
import type { TestReportSummary, SelectionOverview } from 'services/ti-service'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { TestWrapper } from '@common/utils/testUtils'
import ReportsSummaryMock from './mock/reports-summary.json'
import OverviewMock from './mock/overview.json'
import TestSuiteMock from './mock/reports-test-suites.json'
import TestCaseMock from './mock/reports-test-cases.json'
import BuildsMock from './mock/builds.json'
import TotalTestsZeroMock from './mock/total-tests-zero.json'
import InfoMock from './mock/info.json'
import BuildTests from '../BuildTests'

jest.mock('services/ti-service', () => ({
  useReportsInfo: () => ({ data: InfoMock, refetch: jest.fn() }),
  useTestInfo: () => ({ data: InfoMock, refetch: jest.fn() }),
  useReportSummary: ({ mock: { data } }: { mock: { data: TestReportSummary } }) => ({
    data,
    refetch: jest.fn()
  }),
  useTestOverview: ({ mock: { data } }: { mock: { data: SelectionOverview } }) => ({
    data,
    refetch: jest.fn()
  }),
  useTestSuiteSummary: () => ({
    data: TestSuiteMock,
    refetch: jest.fn()
  }),
  useTestCaseSummary: () => ({
    data: TestCaseMock,
    refetch: jest.fn()
  }),
  useGetToken: () => ({
    data: 'some-token'
  })
}))

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
    expect(container).toMatchSnapshot()
  })

  test('should render ZeroState UI', async () => {
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
})
