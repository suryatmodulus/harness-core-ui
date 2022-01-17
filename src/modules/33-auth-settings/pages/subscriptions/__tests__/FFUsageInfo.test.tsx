import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import FFUsageInfo from '../overview/FFUsageInfo'

jest.mock('@auth-settings/hooks/useGetUsageAndLimit', () => {
  return {
    useGetUsageAndLimit: () => {
      return useGetUsageAndLimitReturnMock
    }
  }
})
const useGetUsageAndLimitReturnMock = {
  limitData: {
    limit: {
      ff: {
        totalClientMAUs: 100,
        totalFeatureFlagUnits: 50
      }
    }
  },
  usageData: {
    usage: {
      ff: {
        activeClientMAUs: {
          count: 20,
          displayName: 'Last 30 Days'
        }
      }
    }
  }
}

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
