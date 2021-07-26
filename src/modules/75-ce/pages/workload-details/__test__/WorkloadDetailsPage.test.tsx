import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FetchWorkloadGridDocument,
  FetchWorkloadSummaryDocument,
  FetchWorkloadTimeSeriesDocument
} from 'services/ce/services'

import WorkloadDetailsPage from '../WorkloadDetailsPage'
import ChartResponseData from './ChartResponseData.json'
import SummaryResponseData from './SummaryDataResponse.json'
import GridResponseData from './GridDataResponse.json'

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')

const params = {
  accountId: 'TEST_ACC',
  clusterName: 'clusterName',
  namespace: 'namespace',
  workloadName: 'workloadName'
}

describe('test cases for Workload details Page', () => {
  test('should be able to render the details page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchWorkloadGridDocument) {
          return fromValue(GridResponseData)
        }
        if (query === FetchWorkloadSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchWorkloadTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <WorkloadDetailsPage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
