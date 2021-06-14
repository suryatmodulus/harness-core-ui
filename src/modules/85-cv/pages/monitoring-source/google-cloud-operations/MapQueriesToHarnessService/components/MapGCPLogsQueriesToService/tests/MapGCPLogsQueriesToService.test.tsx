import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { MapGCPLogsQueriesToService } from '../MapGCPLogsQueriesToService'

describe('Unit tests for MapGCPLogsQueriesToService', () => {
  const initialProps = {
    onChange: jest.fn(),
    serviceValue: { label: 'service-1', value: 'service-1' },
    environmentValue: { label: 'env-1', value: 'env-1' },
    serviceOptions: [{ label: 'service-1', value: 'service-1' }],
    setServiceOptions: jest.fn(),
    environmentOptions: [{ label: 'env-1', value: 'env-1' }],
    setEnvironmentOptions: jest.fn(),
    sampleRecord: null,
    isQueryExecuted: true,
    loading: false
  }
  test('Ensure that service is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <MapGCPLogsQueriesToService {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('service')).not.toBeNull())
  })

  test('Ensure that env is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <MapGCPLogsQueriesToService {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('environment')).not.toBeNull())
  })
})
