import React from 'react'
import { render } from '@testing-library/react'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { TestWrapper } from '@common/utils/testUtils'
import ReportsSummaryMock from './mock/reports-summary.json'
import OverviewMock from './mock/overview.json'
import TestSuiteMock from './mock/reports-test-suites.json'
import TestCaseMock from './mock/reports-test-cases.json'
import BuildsMock from './mock/builds.json'
import TotalTestsZero from './mock/total-tests-zero.json'
import BuildTests from '../BuildTests'

jest.mock('services/ti-service', () => ({
  useReportsInfo: () => ({ data: [{ stage: '0', step: '0' }], refetch: jest.fn() }),
  useTestInfo: () => ({ data: [{ stage: '0', step: '0' }], refetch: jest.fn() }),
  useReportSummary: jest
    .fn()
    .mockReturnValueOnce({
      data: ReportsSummaryMock,
      refetch: jest.fn()
    })
    .mockReturnValueOnce({
      data: TotalTestsZero,
      refetch: jest.fn()
    })
    .mockReturnValueOnce({
      data: ReportsSummaryMock,
      refetch: jest.fn()
    })
    .mockReturnValueOnce({
      data: TotalTestsZero,
      refetch: jest.fn()
    }),
  useTestOverview: jest
    .fn()
    .mockReturnValueOnce({
      data: OverviewMock,
      refetch: jest.fn()
    })
    .mockReturnValueOnce({
      data: OverviewMock,
      refetch: jest.fn()
    })
    .mockReturnValueOnce({
      data: TotalTestsZero,
      refetch: jest.fn()
    })
    .mockReturnValueOnce({
      data: TotalTestsZero,
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

// eslint-disable-next-line jest/no-disabled-tests
xdescribe('BuildTests snapshot test', () => {
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
        <BuildTests />
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
        <BuildTests />
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
        <BuildTests />
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
        <BuildTests />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
