import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
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
    data: mockedLogAnalysisData.resource.content as LogAnalysisRowData[],
    fetchLogsDataForCluster: jest.fn()
  }
  test('Verify if Logs Record Table is rendered correctly', async () => {
    render(<WrapperComponent {...initialProps} />)
    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(mockedLogAnalysisData.resource.content.length)
    )
  })
})
