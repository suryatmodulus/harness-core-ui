import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import CIUsageInfo from '../overview/CIUsageInfo'

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
      ci: {
        totalDevelopers: 100
      }
    }
  },
  usageData: {
    usage: {
      ci: {
        activeCommitters: {
          count: 20,
          displayName: 'Last 30 Days'
        }
      }
    }
  }
}

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
