import { fireEvent, render, waitFor } from '@testing-library/react'
import React, { useEffect } from 'react'
import type { UseGetReturn } from 'restful-react'
import { Button, Container } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import * as Tabs from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { MapNewRelicAppsToServicesAndEnvs } from '../MapNewRelicAppsToServicesAndEnvs'

const MockApplicationsResponse = {
  status: 'SUCCESS',
  data: [
    { applicationName: 'My Application', applicationId: 107019083 },
    { applicationName: 'My Application2', applicationId: 107039083 },
    { applicationName: 'My Application3', applicationId: 107049083 }
  ],
  metaData: null,
  correlationId: '2f58555c-1982-4b46-bfda-d57d4bdcc238'
}

const SuccessValidationResponse = {
  status: 'SUCCESS',
  data: {
    metricValidationResponses: [
      { metricName: 'Errors per Minute', value: 2.5078806695728937, status: 'SUCCESS' },
      { metricName: 'Apdex', value: 0.0025216007110385828, status: 'SUCCESS' },
      { metricName: 'Calls per Minute', value: 97887.0, status: 'SUCCESS' },
      { metricName: 'Average Response Time (ms)', value: 0.0, status: 'SUCCESS' }
    ],
    metricPackName: null,
    overallStatus: 'SUCCESS'
  },
  metaData: null,
  correlationId: '201a0cb8-68ef-4842-9106-c5bea9032d77'
}

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <Tabs.SetupSourceTabs
        data={{
          connectorRef: {
            value: 'sadad'
          }
        }}
        tabTitles={['Tab1']}
        determineMaxTab={() => 1}
      >
        <MapNewRelicAppsToServicesAndEnvs />
      </Tabs.SetupSourceTabs>
    </TestWrapper>
  )
}

jest.mock('@wings-software/uicore', () => ({
  ...(jest.requireActual('@wings-software/uicore') as object),
  Utils: {
    randomId: () => '31231'
  }
}))

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [{ label: 'service1', value: 'service1' }]
  }),
  HarnessService: function Mock1(props: any) {
    return (
      <Container
        className="serviceThing"
        onClick={() => {
          props.onSelect({ label: 'service1', value: 'service1' })
        }}
      >
        {props.item ? JSON.stringify(props.item) : null}
      </Container>
    )
  },
  HarnessEnvironment: function Mock2(props: any) {
    return (
      <Container className="environment" onClick={() => props.onSelect({ label: 'env1', value: 'env1' })}>
        {props.item ? JSON.stringify(props.item) : null}
      </Container>
    )
  },
  useGetHarnessEnvironments: () => {
    return { environmentOptions: [{ label: 'env1', value: 'env1' }] }
  }
}))

jest.mock('@cv/pages/monitoring-source/SelectMetricPack/SelectMetricPack', () => ({
  ...(jest.requireActual('@cv/pages/monitoring-source/SelectMetricPack/SelectMetricPack') as object),
  SelectMetricPack: function Mock(props: any) {
    useEffect(() => {
      props.onSelectMetricPack([
        {
          uuid: '12312',
          accountId: '123123',
          orgIdentifier: 'harness_test',
          projectIdentifier: 'raghu_p',
          dataSourceType: 'NEW_RELIC',
          identifier: 'Performance',
          category: 'Performance',
          metrics: [
            {
              name: 'Calls per Minute',
              type: 'THROUGHPUT',
              path:
                'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
              validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute',
              thresholds: [],
              included: true
            },
            {
              name: 'Average Response Time (ms)',
              type: 'RESP_TIME',
              path: "SELECT average('apm.service.transaction.duration') FROM Metric",
              validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)',
              thresholds: [],
              included: true
            },
            {
              name: 'Errors per Minute',
              type: 'ERROR',
              path: 'SELECT count(`apm.service.transaction.error.count`) FROM Metric FACET transactionName TIMESERIES',
              validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute',
              thresholds: [],
              included: true
            }
          ],
          thresholds: null
        }
      ])
    }, [])
    return (
      <Container>
        <Button className="checkPerformance" />
        <Button className="removeAllSelectedMetrics" onClick={() => props.onSelectMetricPack([])} />
      </Container>
    )
  }
}))

describe('Unit tests for MapNewRelicAppsToServiceAndEnvs', () => {
  test('Ensure that when api returns values, the correct table is rendered', async () => {
    jest.spyOn(cvService, 'useGetNewRelicApplications').mockReturnValue({
      data: MockApplicationsResponse
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(<WrapperComponent />)
    await waitFor(() =>
      expect(container.querySelectorAll('div[role="row"]').length).toBe(MockApplicationsResponse.data.length + 1)
    )

    expect(getByText(MockApplicationsResponse.data[0].applicationName)).not.toBeNull()
    expect(getByText(MockApplicationsResponse.data[1].applicationName)).not.toBeNull()
    expect(getByText(MockApplicationsResponse.data[2].applicationName)).not.toBeNull()
  })

  test('Ensure that when submit is clicked the correct data is passed', async () => {
    jest.spyOn(cvService, 'useGetNewRelicApplications').mockReturnValue({
      data: MockApplicationsResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })

    const validationSpy = jest
      .spyOn(cvService, 'getNewRelicMetricDataPromise')
      .mockResolvedValue(SuccessValidationResponse as any)

    const { container, getByText } = render(<WrapperComponent />)
    await waitFor(() =>
      expect(container.querySelectorAll('div[role="row"]').length).toBe(MockApplicationsResponse.data.length + 1)
    )
    const envDropdown = container.querySelector('[class*="environment"]')
    if (!envDropdown) {
      throw Error('env drop down not rendered')
    }

    fireEvent.click(envDropdown)
    await waitFor(() => expect(getByText('{"label":"env1","value":"env1"}')))

    const serviceDropdown = container.querySelector('[class*="serviceThing"]')
    if (!serviceDropdown) {
      throw Error('service drop down not rendered')
    }

    fireEvent.click(serviceDropdown)
    await waitFor(() => expect(getByText('{"label":"service1","value":"service1"}')))

    await waitFor(() =>
      expect(validationSpy).toHaveBeenCalledWith({
        body: [
          {
            accountId: '123123',
            category: 'Performance',
            dataSourceType: 'NEW_RELIC',
            identifier: 'Performance',
            metrics: [
              {
                included: true,
                name: 'Calls per Minute',
                path:
                  'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
                thresholds: [],
                type: 'THROUGHPUT',
                validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute'
              },
              {
                included: true,
                name: 'Average Response Time (ms)',
                path: "SELECT average('apm.service.transaction.duration') FROM Metric",
                thresholds: [],
                type: 'RESP_TIME',
                validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)'
              },
              {
                included: true,
                name: 'Errors per Minute',
                path:
                  'SELECT count(`apm.service.transaction.error.count`) FROM Metric FACET transactionName TIMESERIES',
                thresholds: [],
                type: 'ERROR',
                validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute'
              }
            ],
            orgIdentifier: 'harness_test',
            projectIdentifier: 'raghu_p',
            thresholds: null,
            uuid: '12312'
          }
        ],
        queryParams: {
          accountId: undefined,
          appId: '107019083',
          appName: 'My Application',
          connectorIdentifier: 'sadad',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          requestGuid: '31231'
        }
      })
    )
    fireEvent.click(getByText('next'))
  })

  test('Ensure modal is displayed when noo metricpacks are selected', async () => {
    jest.spyOn(cvService, 'useGetNewRelicApplications').mockReturnValue({
      data: MockApplicationsResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })

    const { container, getByText } = render(<WrapperComponent />)
    await waitFor(() =>
      expect(container.querySelectorAll('div[role="row"]').length).toBe(MockApplicationsResponse.data.length + 1)
    )
    const envDropdown = container.querySelector('[class*="environment"]')
    if (!envDropdown) {
      throw Error('env drop down not rendered')
    }

    fireEvent.click(envDropdown)
    await waitFor(() => expect(getByText('{"label":"env1","value":"env1"}')))

    const serviceDropdown = container.querySelector('[class*="serviceThing"]')
    if (!serviceDropdown) {
      throw Error('service drop down not rendered')
    }

    fireEvent.click(serviceDropdown)
    await waitFor(() => expect(getByText('{"label":"service1","value":"service1"}')))

    const clearSelectedPacksButton = container.querySelector('[class*="removeAllSelectedMetrics"]')
    if (!clearSelectedPacksButton) {
      throw Error('clear button was not rendered.')
    }

    fireEvent.click(clearSelectedPacksButton)
    fireEvent.click(getByText('next'))
    await waitFor(() =>
      expect(document.body.querySelector('.bp3-dialog-header h4')?.innerHTML).toEqual(
        'cv.monitoringSources.oneMetricPackValidation'
      )
    )
  })

  test('Ensure modal is displayed when no applications are selected', async () => {
    jest.spyOn(cvService, 'useGetNewRelicApplications').mockReturnValue({
      data: MockApplicationsResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })

    const { container, getByText } = render(<WrapperComponent />)
    await waitFor(() =>
      expect(container.querySelectorAll('div[role="row"]').length).toBe(MockApplicationsResponse.data.length + 1)
    )

    fireEvent.click(getByText('next'))
    await waitFor(() =>
      expect(document.body.querySelector('.bp3-dialog-header h4')?.innerHTML).toEqual(
        'cv.monitoringSources.oneMetricMappingValidation'
      )
    )
  })
})
