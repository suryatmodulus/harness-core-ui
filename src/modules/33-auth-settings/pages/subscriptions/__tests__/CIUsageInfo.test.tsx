/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
