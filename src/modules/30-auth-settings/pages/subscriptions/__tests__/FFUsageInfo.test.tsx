import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useGetLicenseUsage } from 'services/cf'

import FFUsageInfo from '../overview/FFUsageInfo'

jest.mock('services/cd-ng')
const useGetLicensesAndSummaryMock = useGetLicensesAndSummary as jest.MockedFunction<any>
useGetLicensesAndSummaryMock.mockImplementation(() => {
  return {
    data: {
      data: {
        totalClientMAUs: 100,
        totalFeatureFlagUnits: 200
      },
      status: 'SUCCESS'
    }
  }
})
jest.mock('services/cf')
const useGetLicenseUsageMock = useGetLicenseUsage as jest.MockedFunction<any>
useGetLicenseUsageMock.mockImplementation(() => {
  return {
    data: {
      data: {
        activeClientMAUs: {
          count: 23,
          displayName: 'Last 30 Days'
        }
      },
      status: 'SUCCESS'
    }
  }
})

describe('FFUsageInfo', () => {
  test('FFUsageInfo', () => {
    const { container } = render(
      <TestWrapper>
        <FFUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
