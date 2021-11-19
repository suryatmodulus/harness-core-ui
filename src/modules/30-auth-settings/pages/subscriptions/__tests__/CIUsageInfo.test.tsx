import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useGetUsage } from 'services/ci'

import CIUsageInfo from '../overview/CIUsageInfo'

jest.mock('services/cd-ng')
const useGetLicensesAndSummaryMock = useGetLicensesAndSummary as jest.MockedFunction<any>
useGetLicensesAndSummaryMock.mockImplementation(() => {
  return {
    data: {
      data: {
        totalDevelopers: 100
      },
      status: 'SUCCESS'
    }
  }
})
jest.mock('services/ci')
const useGetLicenseUsageMock = useGetUsage as jest.MockedFunction<any>
useGetLicenseUsageMock.mockImplementation(() => {
  return {
    data: {
      data: {
        activeCommitters: {
          count: 23,
          displayName: 'Last 30 Days'
        }
      },
      status: 'SUCCESS'
    }
  }
})

describe('CIUsageInfo', () => {
  test('CIUsageInfo', () => {
    const { container } = render(
      <TestWrapper>
        <CIUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
