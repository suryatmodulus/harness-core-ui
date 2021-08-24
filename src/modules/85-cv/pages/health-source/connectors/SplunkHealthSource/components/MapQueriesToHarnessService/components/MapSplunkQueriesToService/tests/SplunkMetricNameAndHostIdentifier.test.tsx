import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SplunkMetricNameAndHostIdentifier } from '../SplunkMetricNameAndHostIdentifier'

describe('Unit tests for MapSplunkQueriesToService', () => {
  const initialProps = {
    onChange: jest.fn(),
    sampleRecord: null,
    isQueryExecuted: true,
    loading: false
  }
  test('Ensure that query name is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SplunkMetricNameAndHostIdentifier {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.queryNameLabel')).not.toBeNull())
  })

  test('Ensure that service instance field is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SplunkMetricNameAndHostIdentifier {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.serviceInstance')).not.toBeNull())
  })
})
