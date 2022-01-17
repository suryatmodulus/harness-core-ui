/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { render } from '@testing-library/react'
import { FetchBudgetSummaryDocument, FetchBudgetsGridDataDocument } from 'services/ce/services'
import { TestWrapper } from '@common/utils/testUtils'
import ResponseData from './SummaryData.json'
import GridData from './GridData.json'
import BudgetDetails from '../BudgetDetails'

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')
jest.mock('services/ce', () => ({
  useDeleteBudget: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useGetPerspective: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  }))
}))

const params = {
  accountId: 'TEST_ACC',
  budgetId: 'budgetId',
  budgetName: 'budgetName'
}

describe('test cases for Budgets List Page', () => {
  test('should be able to render the budget list page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchBudgetSummaryDocument) {
          return fromValue(ResponseData)
        }
        if (query === FetchBudgetsGridDataDocument) {
          return fromValue(GridData)
        }
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <BudgetDetails />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
