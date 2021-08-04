import React from 'react'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { LogAnalysisRow } from '../LogAnalysisRow'
import { mockedLogAnalysisData } from './LogAnalysisRow.mocks'
import type { LogAnalysisRowData, LogAnalysisRowProps } from '../LogAnalysisRow.types'

const WrapperComponent = (props: LogAnalysisRowProps): JSX.Element => {
  return (
    <TestWrapper>
      <LogAnalysisRow {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for LogAnalysisRow', () => {
  const initialProps = {
    data: mockedLogAnalysisData.resource.content as LogAnalysisRowData[]
  }
  test('Verify if Logs Record Table is rendered correctly', async () => {
    render(<WrapperComponent {...initialProps} />)
    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(mockedLogAnalysisData.resource.content.length)
    )
  })

  test('Verify if Filtering by cluster type works correctly', async () => {
    const { container, getByText, getAllByText } = render(<WrapperComponent {...initialProps} />)

    const clusterTypeFilterDropdown = container.querySelector(
      'input[placeholder="pipeline.verification.logs.filterByClusterType"]'
    ) as HTMLInputElement

    expect(clusterTypeFilterDropdown).toBeTruthy()

    // Clicking the filter dropdown
    const selectCaret = container
      .querySelector(`[placeholder="pipeline.verification.logs.filterByClusterType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })

    // Selecting Known event cluster type
    const typeToSelect = await getByText('pipeline.verification.logs.knownEvent')
    act(() => {
      fireEvent.click(typeToSelect)
    })
    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.knownEvent')

    // Verifying if correct number of records are shown for Known event type.
    const knownClusterTypeMockedData = mockedLogAnalysisData.resource.content.filter(el => el.clusterType === 'KNOWN')
    await waitFor(() => expect(getAllByText('Known')).toHaveLength(knownClusterTypeMockedData.length))

    // Selecting UnKnown event cluster type
    const unknownEventTypeSelected = await getByText('pipeline.verification.logs.unknownEvent')
    act(() => {
      fireEvent.click(unknownEventTypeSelected)
    })
    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.unknownEvent')

    // Verifying if correct number of records are shown for unKnown event type.
    const unknownClusterTypeMockedData = mockedLogAnalysisData.resource.content.filter(
      el => el.clusterType === 'UNKNOWN'
    )
    await waitFor(() => expect(getAllByText('Unknown')).toHaveLength(unknownClusterTypeMockedData.length))
  })
})
