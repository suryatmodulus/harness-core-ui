import React from 'react'
import { queryByText, render, waitFor, fireEvent, getByText } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'

import { TestWrapper } from '@common/utils/testUtils'
import { RecommendationFiltersDocument, RecommendationsDocument } from 'services/ce/services'

import RecommendationList from '../RecommendationList'
import ResponseData from './ListData.json'
import FilterResponseData from './FiltersData.json'

const params = { accountId: 'TEST_ACC', orgIdentifier: 'TEST_ORG', projectIdentifier: 'TEST_PROJECT' }

describe('test cases for Recommendation List Page', () => {
  test('should be able to render the list page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === RecommendationFiltersDocument) {
          return fromValue(FilterResponseData)
        }
        if (query === RecommendationsDocument) {
          return fromValue(ResponseData)
        }
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <RecommendationList />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const filterHereText = queryByText(container, 'ce.recommendation.listPage.filterHereText')
    fireEvent.click(filterHereText!)
    await waitFor(() => {
      expect(getByText(container, 'ce.recommendation.listPage.filters.namespace')).toBeInTheDocument()
    })
  })

  test('should be able to render empty page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === RecommendationFiltersDocument) {
          return fromValue(FilterResponseData)
        }
        if (query === RecommendationsDocument) {
          return fromValue({
            data: {
              recommendationStatsV2: { totalMonthlyCost: 0, totalMonthlySaving: 0 },
              recommendationsV2: {
                items: []
              }
            }
          })
        }
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <RecommendationList />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
