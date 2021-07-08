import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FetchPerspectiveTimeSeriesDocument,
  FetchPerspectiveDetailsSummaryDocument,
  FetchViewFieldsDocument
} from 'services/ce/services'
import PerspectiveDetailsPage from '../PerspectiveDetailsPage'

import ChartResponseData from './ChartDataResponse.json'
import SummaryResponseData from './SummaryResponse.json'
import ViewFieldResponseData from './ViewFieldResponse.json'

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test cases for Perspective details Page', () => {
  test('should be able to render the details page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <PerspectiveDetailsPage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
