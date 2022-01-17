import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useGetUsageAndLimit from '@auth-settings/hooks/useGetUsageAndLimit'
import CCMUsageInfo from '../overview/CCMUsageInfo'

const useGetUsageAndLimitReturnMock = {
  limitData: {
    limit: {
      ccm: {
        totalSpendLimit: 250000
      }
    }
  },
  usageData: {
    usage: {
      ccm: {
        activeSpend: {
          count: 200000,
          displayName: ''
        }
      }
    }
  }
}

jest.spyOn(useGetUsageAndLimit, 'useGetUsageAndLimit').mockReturnValue(useGetUsageAndLimitReturnMock)

describe('CCMUsageInfo', () => {
  test('CCMUsageInfo', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CCMUsageInfo />
      </TestWrapper>
    )
    expect(getByText('common.subscriptions.usage.cloudSpend')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
