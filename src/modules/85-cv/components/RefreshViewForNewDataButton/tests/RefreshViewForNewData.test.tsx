import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RefreshViewForNewData } from '../RefreshForNewData'

describe('Unit tests for RefreshForNewButton', () => {
  test('Ensure button is clickable and passed in func is called', async () => {
    const onClickFn = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <RefreshViewForNewData onClick={onClickFn} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('refresh')).not.toBeNull())
    fireEvent.click(container.querySelector('[class*="main"]')!)
    await waitFor(() => expect(onClickFn).toHaveBeenCalled())
  })
})
