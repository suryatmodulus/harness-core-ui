import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { projectPathProps, accountPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { MetricAnalysisView, generatePointsForTimeSeries } from '../MetricAnalysisView'

const MockAnomalousData: cvService.RestResponsePageTimeSeriesMetricDataDTO = {
  metaData: {},
  resource: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 0,
    pageSize: 10,
    content: [
      {
        projectIdentifier: 'cv_sanity',
        orgIdentifier: 'CV_Stable',
        metricType: 'ERROR',
        groupName: 'NullPointerException',
        metricName: 'Number of Errors',
        metricDataList: [
          {
            risk: 'HIGH',
            timestamp: 1609208400000,
            value: 100
          },
          {
            risk: 'HIGH',
            timestamp: 1609208460000,
            value: 108
          }
        ]
      }
    ],
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}

describe('Unit tests for Metric Analysis view', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure transform function returns correct value', () => {
    expect(generatePointsForTimeSeries(MockAnomalousData, 1609206900000, 1609206900000 + 1000 * 60)).toEqual({
      metaData: {},
      resource: {
        content: [
          {
            groupName: 'NullPointerException',
            metricDataList: [{ timestamp: 1609206900000, value: undefined }],
            metricName: 'Number of Errors',
            metricType: 'ERROR',
            orgIdentifier: 'CV_Stable',
            projectIdentifier: 'cv_sanity'
          }
        ],
        empty: false,
        pageIndex: 0,
        pageItemCount: 0,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1
      },
      responseMessages: []
    })
  })

  test('Ensure that when api returns no data, no data state is rendered', async () => {
    const useGetMetricDataSpy = jest.spyOn(cvService, 'useGetMetricData')
    const useGetAnomalousMetricDashboardData = jest.spyOn(cvService, 'useGetAnomalousMetricDashboardData')
    const anomalousRefetch = jest.fn()
    const nonAnomalousRefetch = jest.fn()
    useGetMetricDataSpy.mockReturnValue({
      data: { resource: { content: [] } },
      refetch: nonAnomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)

    useGetAnomalousMetricDashboardData.mockReturnValue({
      data: { resource: { content: [] } },
      refetch: anomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper
        path={routes.toCVServices({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <MetricAnalysisView startTime={1609206900000} endTime={1609221300000} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() => expect(nonAnomalousRefetch).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[class*="noDataCard"]')).not.toBeNull()

    // switch from non anomalous to anomalous view
    const caretDown = container.querySelector('[data-icon="chevron-down"]')
    if (!caretDown) {
      throw Error('Select is not rendered.')
    }
    fireEvent.click(caretDown)
    await waitFor(() => expect(container.querySelector('[class*="menuItem"]')).not.toBeNull())

    const menuItem = document.querySelectorAll('[class*="menuItem"]')
    if (!menuItem) {
      throw Error('Menu item was not rendered.')
    }

    fireEvent.click(menuItem[0])
    await waitFor(() => expect(anomalousRefetch).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[class*="noDataCard"]')).not.toBeNull()
  })

  test('Ensure that when api returns error, error state is rendered', async () => {
    const useGetMetricDataSpy = jest.spyOn(cvService, 'useGetMetricData')
    const useGetAnomalousMetricDashboardData = jest.spyOn(cvService, 'useGetAnomalousMetricDashboardData')
    const anomalousRefetch = jest.fn()
    const nonAnomalousRefetch = jest.fn()
    useGetMetricDataSpy.mockReturnValue({
      data: MockAnomalousData,
      refetch: nonAnomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)

    useGetAnomalousMetricDashboardData.mockReturnValue({
      data: { resource: { content: [] } },
      refetch: anomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVServices({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <MetricAnalysisView startTime={1609206900000} endTime={1609221300000} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="highcharts"]')).not.toBeNull())

    // switch from non anomalous to anomalous view
    const caretDown = container.querySelector('[data-icon="chevron-down"]')
    if (!caretDown) {
      throw Error('Select is not rendered.')
    }
    fireEvent.click(caretDown)
    await waitFor(() => expect(container.querySelector('[class*="menuItem"]')).not.toBeNull())

    const menuItem = document.querySelectorAll('[class*="menuItem"]')
    if (!menuItem) {
      throw Error('Menu item was not rendered.')
    }

    useGetAnomalousMetricDashboardData.mockReturnValue({
      error: { message: 'mockErrorMessage' },
      refetch: anomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    fireEvent.click(menuItem[0])
    await waitFor(() => expect(anomalousRefetch).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(getByText('mockErrorMessage')).not.toBeNull())

    fireEvent.click(getByText('Retry'))
    await waitFor(() => expect(anomalousRefetch).toHaveBeenCalledTimes(2))
  })

  test('Ensure that filter sticks to selected value after error happens', async () => {
    const useGetMetricDataSpy = jest.spyOn(cvService, 'useGetMetricData')
    const useGetAnomalousMetricDashboardData = jest.spyOn(cvService, 'useGetAnomalousMetricDashboardData')
    const anomalousRefetch = jest.fn()
    const nonAnomalousRefetch = jest.fn()
    useGetMetricDataSpy.mockReturnValue({
      data: MockAnomalousData,
      refetch: nonAnomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)

    useGetAnomalousMetricDashboardData.mockReturnValue({
      data: { resource: [] },
      refetch: anomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText, rerender } = render(
      <TestWrapper
        path={routes.toCVServices({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <MetricAnalysisView startTime={1609206900000} endTime={1609221300000} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="highcharts"]')).not.toBeNull())

    // switch from non anomalous to anomalous view
    const caretDown = container.querySelector('[data-icon="chevron-down"]')
    if (!caretDown) {
      throw Error('Select is not rendered.')
    }
    fireEvent.click(caretDown)
    await waitFor(() => expect(container.querySelector('[class*="menuItem"]')).not.toBeNull())

    const menuItem = document.querySelectorAll('[class*="menuItem"]')
    if (!menuItem) {
      throw Error('Menu item was not rendered.')
    }

    useGetAnomalousMetricDashboardData.mockReturnValue({
      error: { message: 'mockErrorMessage' },
      refetch: anomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    fireEvent.click(menuItem[0])
    await waitFor(() => expect(nonAnomalousRefetch).toHaveBeenCalledTimes(1))
    expect(getByText('mockErrorMessage')).not.toBeNull()

    // return a value so error disappears and filter drop down is rendered
    useGetAnomalousMetricDashboardData.mockReturnValue({
      data: MockAnomalousData,
      refetch: nonAnomalousRefetch as any,
      cancel: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)

    // re-render while error is there and ensure that all metrics is still the option in the drop down
    rerender(
      <TestWrapper
        path={routes.toCVServices({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <MetricAnalysisView startTime={1609221300000} endTime={1609221300000 + 60 * 1000} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="highcharts"]')).not.toBeNull())
    expect(container.querySelector(`input[value="cv.anomalousMetrics"]`)).not.toBeNull()
  })
})
