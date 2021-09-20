import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { CIStageDetails } from '../CIStageDetails'
import pipelineExecutionSummaryMock from './mocks/execution-context.json'
import reportSummaryMock from './mocks/report-summary.json'

jest.mock('services/ti-service', () => ({
  useReportSummary: () => ({
    data: reportSummaryMock,
    refetch: jest.fn()
  }),
  useGetToken: () => ({
    data: 'some-token'
  })
}))

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: () => pipelineExecutionSummaryMock
}))

describe('<CIStageDetails /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
      >
        <CIStageDetails stage={{ nodeIdentifier: 'openjdkportalfeature' } as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
