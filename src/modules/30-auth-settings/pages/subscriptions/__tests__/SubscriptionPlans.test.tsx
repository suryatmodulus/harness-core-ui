import React from 'react'
import { cloneDeep } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { render, fireEvent } from '@testing-library/react'
import { Provider } from 'urql'
import type { DocumentNode } from 'graphql'
import { fromValue } from 'wonka'
import { ModuleName } from 'framework/types/ModuleName'
import { TestWrapper } from '@common/utils/testUtils'
import { FetchPlansDocument } from 'services/common/services'
import { useGetLicensesAndSummary, useStartTrialLicense } from 'services/cd-ng'
import SubscriptionPlans from '../plans/SubscriptionPlans'
import { plansData } from './plansData'

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ text: '' })
  })
)
const startTrialMock = jest.fn()
jest.mock('services/cd-ng')
const useGetLicensesAndSummaryMock = useGetLicensesAndSummary as jest.MockedFunction<any>
const useStartTrialLicenseMock = useStartTrialLicense as jest.MockedFunction<any>
useStartTrialLicenseMock.mockImplementation(() => ({
  mutate: startTrialMock,
  loading: false
}))

describe('Subscription Plans', () => {
  test('should render the plans for CI', async () => {
    const data = cloneDeep(plansData)
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPlansDocument) {
          return fromValue(data)
        }
        return fromValue({})
      }
    }
    await act(async () => {
      useGetLicensesAndSummaryMock.mockImplementation(() => {
        return {
          data: {
            data: {},
            status: 'SUCCESS'
          },
          refetch: jest.fn(),
          loading: false
        }
      })
      const { container, getByText } = render(
        <TestWrapper>
          <Provider value={responseState as any}>
            <SubscriptionPlans module={ModuleName.CI} />
          </Provider>
        </TestWrapper>
      )
      expect(getByText('common.deactivate')).toBeDefined()
      expect(container).toMatchSnapshot()
    })
  })

  test('should render the plans for CCM', async () => {
    const data = cloneDeep(plansData)
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPlansDocument) {
          return fromValue(data)
        }
        return fromValue({})
      }
    }
    await act(async () => {
      useGetLicensesAndSummaryMock.mockImplementation(() => {
        return {
          data: {
            data: {},
            status: 'SUCCESS'
          },
          refetch: jest.fn(),
          loading: false
        }
      })
      const { container, getByText } = render(
        <TestWrapper>
          <Provider value={responseState as any}>
            <SubscriptionPlans module={ModuleName.CE} />
          </Provider>
        </TestWrapper>
      )
      expect(getByText('common.deactivate')).toBeDefined()
      expect(container).toMatchSnapshot()
    })
  })

  test('should render the plans for CD', async () => {
    const data = cloneDeep(plansData)
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPlansDocument) {
          return fromValue(data)
        }
        return fromValue({})
      }
    }
    await act(async () => {
      useGetLicensesAndSummaryMock.mockImplementation(() => {
        return {
          data: {
            data: {},
            status: 'SUCCESS'
          },
          refetch: jest.fn(),
          loading: false
        }
      })
      const { container, getByText } = render(
        <TestWrapper>
          <Provider value={responseState as any}>
            <SubscriptionPlans module={ModuleName.CD} />
          </Provider>
        </TestWrapper>
      )
      expect(getByText('common.deactivate')).toBeDefined()
      expect(container).toMatchSnapshot()
    })
  })

  test('should render the plans for FF', async () => {
    const data = cloneDeep(plansData)
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPlansDocument) {
          return fromValue(data)
        }
        return fromValue({})
      }
    }
    await act(async () => {
      useGetLicensesAndSummaryMock.mockImplementation(() => {
        return {
          data: {
            data: {},
            status: 'SUCCESS'
          },
          refetch: jest.fn(),
          loading: false
        }
      })
      const { container, getByText } = render(
        <TestWrapper>
          <Provider value={responseState as any}>
            <SubscriptionPlans module={ModuleName.CF} />
          </Provider>
        </TestWrapper>
      )
      expect(getByText('common.deactivate')).toBeDefined()
      expect(container).toMatchSnapshot()
    })
  })

  test('should expand feature comparison when click on arrow', async () => {
    const data = cloneDeep(plansData)
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPlansDocument) {
          return fromValue(data)
        }
        return fromValue({})
      }
    }
    await act(async () => {
      useGetLicensesAndSummaryMock.mockImplementation(() => {
        return {
          data: {
            data: {},
            status: 'SUCCESS'
          },
          refetch: jest.fn(),
          loading: false
        }
      })
      const { container, getByText } = render(
        <TestWrapper>
          <Provider value={responseState as any}>
            <SubscriptionPlans module={ModuleName.CI} />
          </Provider>
        </TestWrapper>
      )
      fireEvent.click(getByText('common.plans.featureComparison'))
      expect(container).toMatchSnapshot()
    })
  })

  test('should be able to call start trial when no license', async () => {
    const data = cloneDeep(plansData)
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPlansDocument) {
          return fromValue(data)
        }
        return fromValue({})
      }
    }
    await act(async () => {
      useGetLicensesAndSummaryMock.mockImplementation(() => {
        return {
          data: {
            data: null,
            status: 'SUCCESS'
          },
          refetch: jest.fn(),
          loading: false
        }
      })
      const { getByText } = render(
        <TestWrapper>
          <Provider value={responseState as any}>
            <SubscriptionPlans module={ModuleName.CI} />
          </Provider>
        </TestWrapper>
      )
      expect(getByText('Try Now')).toBeInTheDocument()
      fireEvent.click(getByText('Try Now'))
      expect(startTrialMock).toBeCalled()
    })
  })
})
