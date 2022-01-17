/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FetchWorkloadGridDocument,
  FetchNodeSummaryDocument,
  FetchWorkloadTimeSeriesDocument
} from 'services/ce/services'

import NodeDetailsPage from '../NodeDetailsPage'
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

describe('test cases for Node details Page', () => {
  test('should be able to render the details page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchWorkloadGridDocument) {
          return fromValue(GridResponseData)
        }
        if (query === FetchNodeSummaryDocument) {
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
          <NodeDetailsPage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
