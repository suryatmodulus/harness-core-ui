import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ValidateMappingCell } from '../ValidateMappingCell'

describe('Tests for Validate Mapping cell', () => {
  test('Ensure that when in progress is passed spinner is displayed', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ValidateMappingCell validationStatus="LOADING" onCellClick={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.appD.verificationsInProgress')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
  test('Ensure that when error state is passed error state is displayed', async () => {
    const retryFn = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <ValidateMappingCell validationStatus="FAILED" onCellClick={jest.fn()} onRetry={retryFn} />{' '}
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.appD.validationsFailed')).not.toBeNull())
    expect(container).toMatchSnapshot()
    const retry = container.querySelector('button')
    if (!retry) {
      throw Error('button was not rendered')
    }

    fireEvent.click(retry)
    await waitFor(() => expect(retryFn).toHaveBeenCalled())
  })
  test('Ensure that when success is passed check is displayed', async () => {
    const onClickFn = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <ValidateMappingCell validationStatus="SUCCESS" onCellClick={onClickFn} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.appD.validationsPassed')).not.toBeNull())
    const text = container.querySelector('p')
    if (!text) {
      throw Error('Text has not been rendered.')
    }
    fireEvent.click(text)
    await waitFor(() => expect(onClickFn).toHaveBeenCalled())
    expect(container).toMatchSnapshot()
  })
  test('Ensure that when no data is available minus is displayed', async () => {
    const onClickFn = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <ValidateMappingCell validationStatus="NO_DATA" onCellClick={onClickFn} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.appD.noData')).not.toBeNull())
    const text = container.querySelector('p')
    if (!text) {
      throw Error('Text has not been rendered.')
    }
    fireEvent.click(text)
    await waitFor(() => expect(onClickFn).toHaveBeenCalled())
    expect(container).toMatchSnapshot()
  })
  test('Ensure that when api error is passed api error is displayed', async () => {
    const { container, getByText } = render(<ValidateMappingCell apiError="mockError" onCellClick={jest.fn()} />)
    await waitFor(() => expect(getByText('mockError')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
  test('Ensure that when no status is passed nothing is displayed', async () => {
    const { container } = render(<ValidateMappingCell validationStatus="NO_STATUS" onCellClick={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })
})
