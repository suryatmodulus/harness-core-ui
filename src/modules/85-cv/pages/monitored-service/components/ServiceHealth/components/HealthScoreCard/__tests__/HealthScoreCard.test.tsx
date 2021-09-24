import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import HealthScoreCard from '../HealthScoreCard'

jest.mock('services/cv', () => ({
  useGetMonitoredServiceScoresFromServiceAndEnvironment: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
describe('HealthScoreCard Tests', () => {
  const initialProps = {
    serviceIdentifier: 'service-1',
    environmentIdentifier: 'env-1'
  }
  test('should render HealthScoreCard with no data', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoredServices.healthScoreDataNotAvailable')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('should render HealthScoreCard with loading state', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceScoresFromServiceAndEnvironment').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { message: '' },
          loading: true
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('span[data-icon="spinner"]')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('should render HealthScoreCard when healthscore is present', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceScoresFromServiceAndEnvironment').mockImplementation(
      () =>
        ({
          data: {
            data: {
              currentHealthScore: {
                healthScore: 2,
                riskStatus: 'LOW_RISK',
                timeRangeParams: [1632383374121, 1632383385396]
              }
            }
          },
          refetch: jest.fn(),
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <HealthScoreCard {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('2')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })
})
