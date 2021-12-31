import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import * as cvservice from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import MetricChart from '../MetricChart'

describe('Unit tests for MetricChart', () => {
  test('Ensure data is rendered', async () => {
    const refetchFn = jest.fn()
    jest
      .spyOn(cvservice, 'useGetAppdynamicsMetricDataByPath')
      .mockReturnValue({ data: [{ timestamp: 32234, value: 3 }], refetch: refetchFn as any } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    render(
      <TestWrapper>
        <MetricChart connectorIdentifier="123123" tier="1231" metricPath="werwer" appName="sdddf" baseFolder="adsf" />
      </TestWrapper>
    )

    await waitFor(() => expect(refetchFn).toHaveBeenCalled())
  })
})
