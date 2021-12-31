import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { items } from './mock'
import SLOsIconGrid from '../SLOsIconGrid'

describe('SLOsIconGrid', () => {
  test('Default render', async () => {
    const { container } = render(
      <TestWrapper>
        <SLOsIconGrid items={items} iconProps={{ name: 'symbol-square' }} />
      </TestWrapper>
    )

    // Max items
    expect(container.querySelectorAll('[data-icon="symbol-square"]')).toHaveLength(items.length)

    // + should not be present
    expect(screen.queryByText('+')).not.toBeInTheDocument()

    fireEvent.mouseOver(container.querySelectorAll('[data-icon="symbol-square"]')[0])
    await waitFor(() =>
      expect(
        screen.queryByText(`${Number(items[0].errorBudgetRemainingPercentage || 0).toFixed(2)}%`)
      ).toBeInTheDocument()
    )
  })

  test('Without max prop', () => {
    const defaultMax = 8
    const doubledItems = [...items, ...items]

    const { container } = render(
      <TestWrapper>
        <SLOsIconGrid items={doubledItems} iconProps={{ name: 'symbol-square' }} />
      </TestWrapper>
    )

    // Max items
    expect(container.querySelectorAll('[data-icon="symbol-square"]')).toHaveLength(defaultMax)

    // +2 text after limit
    expect(screen.queryByText(`+${doubledItems.length - defaultMax}`)).toBeInTheDocument()
  })

  test('With max prop', () => {
    const max = 4

    const { container } = render(
      <TestWrapper>
        <SLOsIconGrid items={items} iconProps={{ name: 'symbol-square' }} max={max} />
      </TestWrapper>
    )

    // Max items
    expect(container.querySelectorAll('[data-icon="symbol-square"]')).toHaveLength(max)

    // +1 text after limit
    expect(screen.queryByText(`+${items.length - max}`)).toBeInTheDocument()
  })
})
