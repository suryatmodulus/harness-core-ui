import React from 'react'
import { fireEvent, screen, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { MetricsToolbar } from '../MetricsToolbar'

describe('MetricsToolbar Tests', () => {
  const renderComponent = (onSelectedDateRangeChangeMock = jest.fn()): void => {
    const start = new Date()
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)

    const end = new Date()
    end.setHours(23, 59, 59, 999)
    render(
      <TestWrapper>
        <MetricsToolbar startDate={start} endDate={end} onSelectedDateRangeChange={onSelectedDateRangeChangeMock} />
      </TestWrapper>
    )
  }

  test('it renders the date picker', () => {
    renderComponent()

    expect(screen.getByText('common.last7days')).toBeInTheDocument()
  })

  test('its calls callback and passes correct dates when "today" selected', () => {
    const onSelectedDateRangeChangeMock = jest.fn()

    renderComponent(onSelectedDateRangeChangeMock)
    const expectedStartDate = new Date()
    expectedStartDate.setHours(0, 0, 0, 0)

    const expectedEndDate = new Date()
    expectedEndDate.setHours(23, 59, 59, 999)

    expect(screen.getByText('common.last7days')).toBeInTheDocument()
    fireEvent.click(screen.getByText('common.last7days'))
    fireEvent.click(screen.getByText('Today'))

    expect(onSelectedDateRangeChangeMock).toBeCalledWith([expectedStartDate, expectedEndDate])
  })

  test('it calls callback and passes correct dates when "yesterday" selected', () => {
    const onSelectedDateRangeChangeMock = jest.fn()

    renderComponent(onSelectedDateRangeChangeMock)

    const today = new Date()
    const expectedStartDate = new Date()
    expectedStartDate.setDate(today.getDate() - 1)
    expectedStartDate.setHours(0, 0, 0, 0)

    const expectedEndDate = new Date()
    expectedEndDate.setDate(today.getDate() - 1)
    expectedEndDate.setHours(23, 59, 59, 999)

    expect(screen.getByText('common.last7days')).toBeInTheDocument()
    fireEvent.click(screen.getByText('common.last7days'))
    fireEvent.click(screen.getByText('Yesterday'))

    expect(onSelectedDateRangeChangeMock).toBeCalledWith([expectedStartDate, expectedEndDate])
  })

  test('it calls callback and passes correct dates when date range selected', () => {
    const onSelectedDateRangeChangeMock = jest.fn()

    renderComponent(onSelectedDateRangeChangeMock)

    const today = new Date()
    const expectedStartDate = new Date()
    expectedStartDate.setDate(today.getDate() - 6)
    expectedStartDate.setHours(0, 0, 0, 0)

    const expectedEndDate = new Date()
    expectedEndDate.setHours(23, 59, 59, 999)

    expect(screen.getByText('common.last7days')).toBeInTheDocument()
    fireEvent.click(screen.getByText('common.last7days'))
    fireEvent.click(screen.getByText('Past week'))

    expect(onSelectedDateRangeChangeMock).toBeCalledWith([expectedStartDate, expectedEndDate])
  })
})
