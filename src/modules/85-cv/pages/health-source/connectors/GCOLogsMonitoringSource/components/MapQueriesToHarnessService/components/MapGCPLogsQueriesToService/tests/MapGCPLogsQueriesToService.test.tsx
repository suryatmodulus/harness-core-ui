import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { MapGCPLogsQueriesToService } from '../MapGCPLogsQueriesToService'

describe('Unit tests for MapGCPLogsQueriesToService', () => {
  const initialProps = {
    onChange: jest.fn(),
    sampleRecord: null,
    isQueryExecuted: true,
    loading: false
  }
  test('Ensure that query name is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <MapGCPLogsQueriesToService {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.queryNameLabel')).not.toBeNull())
  })

  test('Ensure that service instance field is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <MapGCPLogsQueriesToService {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.serviceInstance')).not.toBeNull())
  })

  test('Ensure that message identifier field is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <MapGCPLogsQueriesToService {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.messageIdentifier')).not.toBeNull())
  })
})
