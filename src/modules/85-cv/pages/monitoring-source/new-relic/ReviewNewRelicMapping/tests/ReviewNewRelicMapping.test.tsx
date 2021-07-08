import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseMutateReturn } from 'restful-react'
import {
  SetupSourceTabs,
  SetupSourceTabsProps
} from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import * as toaster from '@common/components/Toaster/useToaster'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { ReviewNewRelicMapping } from '../ReviewNewRelicMapping'

const MockTabsData = {
  monitoringSourceName: 'MyNewRelicSourceharness_test-raghu_p',
  accountId: '1234_accountId',
  orgIdentifier: 'harness_test',
  projectIdentifier: 'raghu_p',
  isEdit: false,
  productName: 'apm',
  identifier: 'MyNewRelicSourceharness_test-raghu_p',
  type: 'NEW_RELIC',
  mappedServicesAndEnvs: new Map([
    [
      '1805869',
      {
        applicationId: '1805869',
        applicationName: 'My Application',
        service: { label: 'gateway', value: 'GATEWAY' },
        environment: { label: 'prod', value: 'Production' }
      }
    ]
  ]),
  connectorRef: {
    label: 'newRelic',
    value: 'newRelic',
    scope: 'project',
    live: true,
    connector: {
      name: 'newRelic',
      identifier: 'newRelic',
      description: null,
      orgIdentifier: 'harness_test',
      projectIdentifier: 'raghu_p',
      tags: {},
      type: 'NewRelic',
      spec: {
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/',
        apiKeyRef: 'anothernewrelicsecret'
      },
      status: {
        status: 'SUCCESS',
        errorSummary: null,
        errors: null,
        testedAt: 1616192931967,
        lastTestedAt: 0,
        lastConnectedAt: 1616192931967
      }
    }
  },
  selectedMetricPacks: [
    {
      uuid: '1234_id',
      accountId: '1234_accountId',
      orgIdentifier: 'harness_test',
      projectIdentifier: 'raghu_p',
      dataSourceType: 'NEW_RELIC',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Errors per Minute',
          type: 'ERROR',
          path: 'SELECT count(`apm.service.transaction.error.count`) FROM Metric FACET transactionName TIMESERIES',
          validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute',
          jsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          type: 'RESP_TIME',
          path: "SELECT average('apm.service.transaction.duration') FROM Metric",
          validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)',
          jsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Calls per Minute',
          type: 'THROUGHPUT',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute',
          jsonPath: null,
          thresholds: [],
          included: true
        }
      ],
      thresholds: null
    }
  ]
}

function WrapperComponent<NewRelicSetupSource>(
  props: Pick<SetupSourceTabsProps<NewRelicSetupSource>, 'data'>
): JSX.Element {
  return (
    <TestWrapper>
      <SetupSourceTabs {...props} tabTitles={['Review']} determineMaxTab={() => 0}>
        <ReviewNewRelicMapping />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Unit tests for ReviewNewRelicMapping', () => {
  test('Ensure that correct data is displayed based on contextual data, expect craetion api to be called on submit', async () => {
    const createFuncMock = jest.fn()
    jest.spyOn(cvService, 'useCreateDataSource').mockReturnValue({
      mutate: createFuncMock as any
    } as UseMutateReturn<any, any, any, any, any>)

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })

    const { container, getByText } = render(<WrapperComponent data={MockTabsData} />)
    await waitFor(() => expect(container.querySelectorAll('[role="row"]').length).toBe(2))
    expect(getByText('My Application')).not.toBeNull()
    expect(getByText('gateway')).not.toBeNull()
    expect(getByText('prod')).not.toBeNull()

    fireEvent.click(getByText('submit'))
    await waitFor(() =>
      expect(createFuncMock).toHaveBeenCalledWith(
        {
          accountId: undefined,
          connectorIdentifier: 'newRelic',
          identifier: 'MyNewRelicSourceharness_test-raghu_p',
          monitoringSourceName: 'MyNewRelicSourceharness_test-raghu_p',
          newRelicServiceConfigList: [
            {
              applicationId: '1805869',
              applicationName: 'My Application',
              envIdentifier: 'Production',
              metricPacks: [
                {
                  accountId: '1234_accountId',
                  category: 'Performance',
                  dataSourceType: 'NEW_RELIC',
                  identifier: 'Performance',
                  metrics: [
                    {
                      included: true,
                      jsonPath: null,
                      name: 'Errors per Minute',
                      path: 'SELECT count(`apm.service.transaction.error.count`) FROM Metric FACET transactionName TIMESERIES',
                      thresholds: [],
                      type: 'ERROR',
                      validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute'
                    },
                    {
                      included: true,
                      jsonPath: null,
                      name: 'Average Response Time (ms)',
                      path: "SELECT average('apm.service.transaction.duration') FROM Metric",
                      thresholds: [],
                      type: 'RESP_TIME',
                      validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)'
                    },
                    {
                      included: true,
                      jsonPath: null,
                      name: 'Calls per Minute',
                      path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
                      thresholds: [],
                      type: 'THROUGHPUT',
                      validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute'
                    }
                  ],
                  orgIdentifier: 'harness_test',
                  projectIdentifier: 'raghu_p',
                  thresholds: null,
                  uuid: '1234_id'
                }
              ],
              serviceIdentifier: 'GATEWAY'
            }
          ],
          orgIdentifier: undefined,
          productName: 'apm',
          projectIdentifier: undefined,
          type: 'NEW_RELIC'
        },
        { queryParams: { accountId: undefined } }
      )
    )
  })

  test('Ensure that correct data is displayed based on contextual data, expect edit api to be called on submit', async () => {
    const updateFuncMock = jest.fn()
    jest.spyOn(cvService, 'useUpdateDSConfig').mockReturnValue({
      mutate: updateFuncMock as any
    } as UseMutateReturn<any, any, any, any, any>)

    const putMock = jest.fn()
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: putMock,
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })

    const { container, getByText } = render(<WrapperComponent data={{ ...MockTabsData, isEdit: true }} />)
    await waitFor(() => expect(container.querySelectorAll('[role="row"]').length).toBe(2))
    expect(getByText('My Application')).not.toBeNull()
    expect(getByText('gateway')).not.toBeNull()
    expect(getByText('prod')).not.toBeNull()

    fireEvent.click(getByText('submit'))
    await waitFor(() =>
      expect(updateFuncMock).toHaveBeenCalledWith(
        {
          accountId: undefined,
          connectorIdentifier: 'newRelic',
          identifier: 'MyNewRelicSourceharness_test-raghu_p',
          monitoringSourceName: 'MyNewRelicSourceharness_test-raghu_p',
          newRelicServiceConfigList: [
            {
              applicationId: '1805869',
              applicationName: 'My Application',
              envIdentifier: 'Production',
              metricPacks: [
                {
                  accountId: '1234_accountId',
                  category: 'Performance',
                  dataSourceType: 'NEW_RELIC',
                  identifier: 'Performance',
                  metrics: [
                    {
                      included: true,
                      jsonPath: null,
                      name: 'Errors per Minute',
                      path: 'SELECT count(`apm.service.transaction.error.count`) FROM Metric FACET transactionName TIMESERIES',
                      thresholds: [],
                      type: 'ERROR',
                      validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute'
                    },
                    {
                      included: true,
                      jsonPath: null,
                      name: 'Average Response Time (ms)',
                      path: "SELECT average('apm.service.transaction.duration') FROM Metric",
                      thresholds: [],
                      type: 'RESP_TIME',
                      validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)'
                    },
                    {
                      included: true,
                      jsonPath: null,
                      name: 'Calls per Minute',
                      path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
                      thresholds: [],
                      type: 'THROUGHPUT',
                      validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute'
                    }
                  ],
                  orgIdentifier: 'harness_test',
                  projectIdentifier: 'raghu_p',
                  thresholds: null,
                  uuid: '1234_id'
                }
              ],
              serviceIdentifier: 'GATEWAY'
            }
          ],
          orgIdentifier: undefined,
          productName: 'apm',
          projectIdentifier: undefined,
          type: 'NEW_RELIC'
        },
        { queryParams: { accountId: undefined } }
      )
    )
  })

  test('Ensure that toaster displays message when api throws error', async () => {
    const createMockFn = jest.fn().mockRejectedValue({ data: { message: 'mockError' } })

    jest.spyOn(cvService, 'useCreateDataSource').mockReturnValue({
      mutate: createMockFn as any
    } as UseMutateReturn<any, any, any, any, any>)

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })

    const showErrorMock = jest.fn()
    jest.spyOn(toaster, 'useToaster').mockReturnValue({
      clear: jest.fn(),
      showError: showErrorMock
    } as any)

    const { container, getByText } = render(<WrapperComponent data={MockTabsData} />)
    await waitFor(() => expect(container.querySelectorAll('[role="row"]').length).toBe(2))
    expect(getByText('My Application')).not.toBeNull()
    expect(getByText('gateway')).not.toBeNull()
    expect(getByText('prod')).not.toBeNull()

    fireEvent.click(getByText('submit'))
    await waitFor(() => expect(showErrorMock).toHaveBeenCalledWith('mockError', 7000))
  })
})
