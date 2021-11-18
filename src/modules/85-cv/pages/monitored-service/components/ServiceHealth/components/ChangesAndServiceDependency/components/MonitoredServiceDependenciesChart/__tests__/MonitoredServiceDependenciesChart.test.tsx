import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { mockedServiceDependencies } from './MonitoredServiceDependenciesChart.mock'
import MonitoredServiceDependenciesChart from '../MonitoredServiceDependenciesChart'

jest.mock('services/cv', () => ({
  useGetServiceDependencyGraph: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
describe('MonitoredServiceDependenciesChart Tests', () => {
  const initialProps = {
    serviceIdentifier: 'service-1',
    envIdentifier: 'env-1'
  }
  test('should render with no data', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <MonitoredServiceDependenciesChart {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoredServices.noAvailableData')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })
  test('should render with loading state', async () => {
    jest.spyOn(cvService, 'useGetServiceDependencyGraph').mockImplementation(
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
        <MonitoredServiceDependenciesChart {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('span[data-icon="steps-spinner"]')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('should render with error state', async () => {
    const refetch = jest.fn()
    jest.spyOn(cvService, 'useGetServiceDependencyGraph').mockImplementation(
      () =>
        ({
          data: null,
          refetch,
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <MonitoredServiceDependenciesChart {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText('We cannot perform your request at the moment. Please try again.')).toBeTruthy()
    )
    act(() => {
      fireEvent.click(getByText('Retry'))
    })

    await waitFor(() =>
      expect(refetch).toHaveBeenLastCalledWith({
        queryParams: {
          accountId: undefined,
          environmentIdentifier: 'env-1',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          serviceIdentifier: 'service-1',
          servicesAtRiskFilter: false
        }
      })
    )

    expect(container).toMatchSnapshot()
  })
  test('should render with service dependencies', () => {
    jest.spyOn(cvService, 'useGetServiceDependencyGraph').mockImplementation(
      () =>
        ({
          data: mockedServiceDependencies,
          refetch: jest.fn(),
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <MonitoredServiceDependenciesChart {...initialProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
