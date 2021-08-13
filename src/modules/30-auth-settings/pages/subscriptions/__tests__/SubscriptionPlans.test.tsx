import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'urql'
import type { DocumentNode } from 'graphql'
import { fromValue } from 'wonka'
import { ModuleName } from 'framework/types/ModuleName'
import { TestWrapper } from '@common/utils/testUtils'
import { FetchPlansDocument } from 'services/common/services'
import SubscriptionPlans from '../plans/SubscriptionPlans'
import { plansData } from './plansData'

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ text: '' })
  })
)

const responseState = {
  executeQuery: ({ query }: { query: DocumentNode }) => {
    if (query === FetchPlansDocument) {
      return fromValue(plansData)
    }
    return fromValue({})
  }
}

describe('Subscription Plans', () => {
  test('should render the plans', async () => {
    await act(async () => {
      const { container } = render(
        <TestWrapper>
          <Provider value={responseState as any}>
            <SubscriptionPlans module={ModuleName.CI} />
          </Provider>
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })

  test('should expand feature comparison when click on arrow', async () => {
    await act(async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <Provider value={responseState as any}>
            <SubscriptionPlans module={ModuleName.CI} />
          </Provider>
        </TestWrapper>
      )
      fireEvent.click(getByText('common.plans.featureComparison'))
      await waitFor(() => expect(container).toMatchSnapshot())
    })
  })
})
