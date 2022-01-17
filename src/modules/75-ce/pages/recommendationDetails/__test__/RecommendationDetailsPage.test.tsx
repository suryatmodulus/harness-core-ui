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
import { TestWrapper } from '@common/utils/testUtils'

import RecommendationDetailsPage from '../RecommendationDetailsPage'
import ResponseData from './DetailsData.json'

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')

const params = {
  accountId: 'TEST_ACC',
  recommendation: 'RECOMMENDATION_ID'
}

describe('test cases for Recommendation List Page', () => {
  test('should be able to render the list page', async () => {
    const responseState = {
      executeQuery: () => fromValue(ResponseData)
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <RecommendationDetailsPage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
