/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { FilterTypes } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'
import ServiceDependencyGraph from '../MonitoredServiceGraphView'
import {
  testWrapperProps,
  errorMessage,
  pathParams,
  serviceDependencyData,
  serviceCountData
} from './ServiceDependencyGraph.mock'

jest.mock('services/cv', () => ({
  useGetServiceDependencyGraph: jest.fn().mockImplementation(() => ({
    refetch: jest.fn()
  })),
  useSetHealthMonitoringFlag: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteMonitoredService: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Service Dependency Graph', () => {
  // Card view
  test('No data', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph serviceIdentifier="" environmentIdentifier="" />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.monitoredServices.noAvailableData')).toBeInTheDocument()
  })

  test('Loading', () => {
    jest.spyOn(cvService, 'useGetServiceDependencyGraph').mockReturnValue({ loading: true, refetch: jest.fn() } as any)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph serviceIdentifier="" environmentIdentifier="" />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Error', () => {
    const refetch = jest.fn()

    jest
      .spyOn(cvService, 'useGetServiceDependencyGraph')
      .mockReturnValue({ error: { message: errorMessage }, refetch } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph serviceIdentifier="service_identifier" environmentIdentifier="environment_identifier" />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    userEvent.click(screen.getByText('Retry'))

    waitFor(() =>
      expect(refetch).toBeCalledWith({
        ...pathParams,
        serviceIdentifier: 'service_identifier',
        environmentIdentifier: 'environment_identifier',
        servicesAtRiskFilter: false
      })
    )
  })

  test('Data available', () => {
    jest
      .spyOn(cvService, 'useGetServiceDependencyGraph')
      .mockReturnValue({ data: serviceDependencyData, refetch: jest.fn() } as any)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph serviceIdentifier="" environmentIdentifier="" />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.monitoredServices.noAvailableData')).not.toBeInTheDocument()
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    expect(container.querySelector('[data-icon="steps-spinner"]')).not.toBeInTheDocument()
  })

  // PageView view
  test('No data', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph isPageView />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.monitoredServices.youHaveNoMonitoredServices')).toBeInTheDocument()
  })

  test('Loading', () => {
    jest.spyOn(cvService, 'useGetServiceDependencyGraph').mockReturnValue({ loading: true, refetch: jest.fn() } as any)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph isPageView />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('Error', () => {
    const refetch = jest.fn()
    const refetchServiceCountData = jest.fn()

    jest
      .spyOn(cvService, 'useGetServiceDependencyGraph')
      .mockReturnValue({ error: { message: errorMessage }, refetch } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph
          isPageView
          selectedFilter={FilterTypes.RISK}
          refetchServiceCountData={refetchServiceCountData}
        />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    userEvent.click(screen.getByText('Retry'))

    waitFor(() =>
      expect(refetch).toBeCalledWith({
        ...pathParams,
        servicesAtRiskFilter: true
      })
    )
    expect(refetchServiceCountData).not.toBeCalled()
  })

  test('Service count API error', () => {
    const refetch = jest.fn()
    const refetchServiceCountData = jest.fn()

    jest.spyOn(cvService, 'useGetServiceDependencyGraph').mockReturnValue({ refetch } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph
          isPageView
          selectedFilter={FilterTypes.RISK}
          serviceCountErrorMessage={errorMessage}
          refetchServiceCountData={refetchServiceCountData}
        />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    userEvent.click(screen.getByText('Retry'))

    waitFor(() => expect(refetchServiceCountData).toBeCalledTimes(1))
    expect(refetch).not.toBeCalled()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Service count data available', () => {
    jest
      .spyOn(cvService, 'useGetServiceDependencyGraph')
      .mockReturnValue({ data: serviceDependencyData, refetch: jest.fn() } as any)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ServiceDependencyGraph isPageView serviceCountData={serviceCountData} />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.monitoredServices.youHaveNoMonitoredServices')).not.toBeInTheDocument()
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    expect(container.querySelector('[data-icon="steps-spinner"]')).not.toBeInTheDocument()
  })
})
