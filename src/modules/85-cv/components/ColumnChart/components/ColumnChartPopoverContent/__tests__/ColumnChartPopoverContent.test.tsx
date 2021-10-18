import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ColumnChartPopoverContent from '../ColumnChartPopoverContent'
import type { ColumnChartPopoverContentProps } from '../ColumnChartPopoverContent.types'

function WrapperComponent(props: ColumnChartPopoverContentProps) {
  return (
    <TestWrapper>
      <ColumnChartPopoverContent {...props} />
    </TestWrapper>
  )
}

describe('Unittests for ColumnChartPopover', () => {
  test('Ensure no data state is rendered correctly', async () => {
    const { container, getByText } = render(
      <WrapperComponent
        cell={{
          timeRange: {
            startTime: 12313123,
            endTime: 2342423
          },
          color: 'var(--grey-100)',
          riskStatus: 'NO_DATA',
          height: 1
        }}
      />
    )

    await waitFor(() => expect(getByText('noData')).not.toBeNull())
    expect(container.querySelector('[class*="healthScore"]')).toBeNull()
  })

  test('Ensure valid data state is rendered correctly', async () => {
    const { container, getByText } = render(
      <WrapperComponent
        cell={{
          timeRange: {
            startTime: 12313123,
            endTime: 2342423
          },
          color: 'var(--black)',
          healthScore: 2,
          riskStatus: 'HIGH',
          height: 45
        }}
      />
    )

    await waitFor(() => expect(getByText('cv.healthScore:')).not.toBeNull())
    expect(container.querySelector('[class*="healthScore"]')).not.toBeNull()
  })
})
