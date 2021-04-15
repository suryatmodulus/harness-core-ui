import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import CVServicesPage from '../CVServicesPage'

jest.mock('@cv/components/ActivitiesTimelineView/ActivitiesTimelineViewSection', () => () => (
  <Container className="drilldownview" />
))
jest.mock('../ServiceHeatMap/ServiceHeatMap', () => (props: any) => (
  <Container className="service-heatmap" onClick={() => props.onClickHeatMapCell(1613584152777, 1613585038139)} />
))

jest.mock('../analysis-drilldown-view/AnalysisDrillDownView', () => ({
  ...(jest.requireActual('../analysis-drilldown-view/AnalysisDrillDownView') as object),
  AnalysisDrillDownView: function MockDrillDown() {
    return <Container className="timeseriesCharts" />
  }
}))

const TEST_PATH = routes.toCVServices({ ...accountPathProps, ...projectPathProps })
const pathParams = {
  accountId: 'loading',
  projectIdentifier: '1234_project',
  orgIdentifier: '1234_ORG'
}

describe('Unit tests for CV service page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Ensure no data is rendered when there are no services', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    const useGetCategoryRiskMapSpy = jest.spyOn(cvService, 'useGetCategoryRiskMap')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: []
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)
    useGetCategoryRiskMapSpy.mockReturnValue({
      data: {
        metaData: {},
        resource: {
          startTimeEpoch: 1614136800000,
          endTimeEpoch: 1614137100000,
          hasConfigsSetup: false,
          categoryRisks: null
        },
        responseMessages: []
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <CVServicesPage />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="servicesPage"]')).not.toBeNull())
    expect(getByText('cv.getRiskAssessment')).not.toBeNull()
  })

  test('Ensure that when an error is encountered the error message is displayed', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    const useGetCategoryRiskMapSpy = jest.spyOn(cvService, 'useGetCategoryRiskMap')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: []
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)
    const refetchMock = jest.fn()
    useGetCategoryRiskMapSpy.mockReturnValue({
      data: undefined,
      error: { message: 'mock error' } as unknown,
      refetch: refetchMock as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <CVServicesPage />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="servicesPage"]')).toBeNull())
    expect(getByText('mock error')).not.toBeNull()
    const retryButton = getByText('Retry')
    fireEvent.click(retryButton)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('Ensure when a service is selected, api is called', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    const useGetCategoryRiskMapSpy = jest.spyOn(cvService, 'useGetCategoryRiskMap')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: [
          {
            orgIdentifier: 'harness_test',
            projectIdentifier: 'praveenproject',
            envIdentifier: 'Prod',
            envName: 'Production',
            risk: null,
            serviceRisks: [{ serviceIdentifier: 'manager', serviceName: 'Manager3', risk: -1 }]
          }
        ]
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    useGetCategoryRiskMapSpy.mockReturnValue({
      data: {
        startTimeEpoch: 1614136800000,
        endTimeEpoch: 1614137100000,
        hasConfigsSetup: true,
        categoryRisks: [
          { category: 'Errors', risk: -1 },
          { category: 'Performance', risk: -1 },
          { category: 'Infrastructure', risk: -1 }
        ]
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <CVServicesPage />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="servicesPage"]')).not.toBeNull())

    const envOption = container.querySelector('[class*="environmentRow"] p')
    if (!envOption) {
      throw Error('env option was not rendered.')
    }
    expect(useGetEnvServiceRiskSpy).toHaveBeenCalledTimes(1)
    expect(useGetCategoryRiskMapSpy).toHaveBeenCalledTimes(1)
    fireEvent.click(envOption)
    await waitFor(() => expect(useGetEnvServiceRiskSpy).toHaveBeenCalledTimes(2))
    expect(useGetCategoryRiskMapSpy).toHaveBeenCalledTimes(2)
  })

  test('Ensure that when time range drop down values are selected, and a heatmap cell is clicked the timeseries is rendered', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    const useGetCategoryRiskMapSpy = jest.spyOn(cvService, 'useGetCategoryRiskMap')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: [
          {
            orgIdentifier: 'harness_test',
            projectIdentifier: 'praveenproject',
            envIdentifier: 'Prod',
            risk: null,
            serviceRisks: [{ serviceIdentifier: 'manager', risk: -1 }]
          }
        ]
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    useGetCategoryRiskMapSpy.mockReturnValue({
      data: {
        resource: {
          endTimeEpoch: 1598338800000 + 15 * 1000 * 60,
          startTimeEpoch: 1598338800000,
          categoryRisks: [
            { category: 'Performance', risk: 45 },
            { category: 'Errors', risk: 100 },
            { category: 'Resources', risk: 25 }
          ]
        }
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const { container, getByText, getAllByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <CVServicesPage />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="servicesPage"]')).not.toBeNull())
    expect(getAllByText('100').length).toBe(2)

    expect(container.querySelector('[class*="drilldownview"]')).not.toBeNull()
    expect(container.querySelector('[class*="service-heatmap"]')).not.toBeNull()

    const dropdown = container.querySelector('[class*="bp3-icon-caret-down"]')
    if (!dropdown) {
      throw Error('No drop down rendred')
    }

    fireEvent.click(dropdown)
    let twelveHourOptions
    await waitFor(() => {
      twelveHourOptions = container.querySelector(`[class*="${Classes.MENU}"]`)
      expect(twelveHourOptions).not.toBeNull()
    })

    fireEvent.click(getByText('7 Days'))
    await waitFor(() =>
      expect(container.querySelector('[class*="rangeSelector"] input')?.getAttribute('value')).toEqual('7 Days')
    )

    const heatMap = container.querySelector('[class*="service-heatmap"]')
    if (!heatMap) {
      throw Error('heat map was not rendered.')
    }

    fireEvent.click(heatMap)
    await waitFor(() => expect(container.querySelector('[class*="timeseriesCharts"]')).not.toBeNull())
  })
})
