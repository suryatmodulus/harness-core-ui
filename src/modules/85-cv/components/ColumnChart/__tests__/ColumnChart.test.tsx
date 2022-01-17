/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { Classes } from '@blueprintjs/core'
import { TestWrapper } from '@common/utils/testUtils'
import { RiskValues } from '@cv/utils/CommonUtils'
import ColumnChart from '../ColumnChart'
import type { ColumnChartProps } from '../ColumnChart.types'
import { mockSeriesData } from './ColumnChart.mock'
import * as chartUtils from '../ColumnChart.utils'
import { LOADING_COLUMN_HEIGHTS } from '../ColumnChart.constants'

const WrapperComponent = (props: ColumnChartProps): JSX.Element => {
  return (
    <TestWrapper>
      <ColumnChart {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for ColumnChart', () => {
  test('Verify if all the fields are rendered correctly inside ColumnChart', async () => {
    const { container } = render(<WrapperComponent data={mockSeriesData.data} />)
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(container.querySelectorAll('[class*="column"]').length).toBe(4))
  })

  test('Ensure that loading state is rendered', async () => {
    jest
      .spyOn(chartUtils, 'getLoadingColumnPositions')
      .mockReturnValue(Array(LOADING_COLUMN_HEIGHTS.length).fill(Math.random() * 56))
    const { container } = render(<WrapperComponent isLoading={true} data={[]} />)
    await waitFor(() =>
      expect(container.querySelectorAll(`[class*="${Classes.SKELETON}"]`).length).toBe(LOADING_COLUMN_HEIGHTS.length)
    )
  })

  test('Ensure that error state is rendered', async () => {
    const mockErrorRefetch = jest.fn()
    const { getByText } = render(
      <WrapperComponent
        error={{ message: '', data: { message: 'mockError' } }}
        data={[]}
        refetchOnError={mockErrorRefetch}
      />
    )
    await waitFor(() => expect(getByText('mockError')).not.toBeNull())
    fireEvent.click(getByText('Retry'))
    await waitFor(() => expect(mockErrorRefetch).toHaveBeenCalled())
  })

  test('Ensure that no data state is rendered', async () => {
    const { container } = render(<WrapperComponent data={[]} />)
    await waitFor(() => expect(container.querySelector('[class*="noDataImage"]')).not.toBeNull())
  })

  test('Ensure no data is rendered when all data is 0', async () => {
    const { container } = render(
      <WrapperComponent
        data={[
          {
            height: 0,
            timeRange: { startTime: 123213, endTime: 4535 },
            color: 'var(--white)',
            riskStatus: RiskValues.NEED_ATTENTION
          }
        ]}
      />
    )
    await waitFor(() => expect(container.querySelector('[class*="noDataImage"]')).not.toBeNull())
  })
})
