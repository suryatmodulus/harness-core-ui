import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cv from 'services/cv'
import { mockRiskValue } from '@cv/pages/monitored-service/components/ServiceHealth/__tests__/ServiceHealth.mock'
import ChangeEventServiceHealth from '../ChangeEventServiceHealth'

describe('Unit tests for ChangeEventServiceHealth', () => {
  beforeAll(() => {
    jest.spyOn(cv, 'useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv').mockReturnValue({
      data: { data: { healthScores: mockRiskValue } },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)
  })
  test('Ensure that component renders correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <ChangeEventServiceHealth
          eventType="K8sCluster"
          envIdentifier="1234_iden"
          serviceIdentifier="1234_service"
          startTime={123123}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="column"]')).not.toBeNull())
  })
})
