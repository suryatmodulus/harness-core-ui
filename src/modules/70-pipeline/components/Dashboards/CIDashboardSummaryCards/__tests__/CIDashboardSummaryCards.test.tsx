/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CIDashboardSummaryCards from '../CIDashboardSummaryCards'

const mockData = {
  data: {
    builds: {
      total: {
        count: 7,
        rate: -22.22222222222222
      },
      success: {
        count: 3,
        rate: 10
      },
      failed: {
        count: 2,
        rate: 0.0
      }
    }
  }
}

jest.mock('services/ci', () => ({
  useGetBuildHealth: () => ({
    loading: false,
    data: mockData
  })
}))

jest.mock('highcharts-react-official', () => () => <div />)

describe('CIDashboardSummaryCards', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <CIDashboardSummaryCards />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
