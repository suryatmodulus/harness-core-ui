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
  FetchPerspectiveTimeSeriesDocument,
  FetchPerspectiveDetailsSummaryDocument,
  FetchViewFieldsDocument,
  ViewChartType,
  FetchperspectiveGridDocument
} from 'services/ce/services'

import ChartResponseData from '@ce/pages/perspective-details/__test__/ChartDataResponse.json'
import SummaryResponseData from '@ce/pages/perspective-details/__test__/SummaryResponse.json'
import ViewFieldResponseData from '@ce/pages/perspective-details/__test__/ViewFieldResponse.json'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview'

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

const props = {
  groupBy: DEFAULT_GROUP_BY,
  setGroupBy: jest.fn(),
  chartType: ViewChartType.StackedLineChart,
  setChartType: jest.fn,
  formValues: {}
}

describe('test cases for Perspective details Page', () => {
  test('should be able to render the details page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        if (query === FetchperspectiveGridDocument) {
          return fromValue({})
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <PerspectiveBuilderPreview {...props} />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
