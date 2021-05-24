import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseMutateReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  SetupSourceTabs,
  SetupSourceTabsProps
} from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import * as cvService from 'services/cv'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import * as toaster from '@common/components/Toaster/useToaster'
import { ReviewPrometheusMapping } from '../ReviewPrometheusMappings'

const EditMockData = {
  monitoringSourceName: 'Prometheus',
  accountId: '1234_accountId',
  orgIdentifier: 'harness_test',
  projectIdentifier: 'raghu_p',
  isEdit: true,
  productName: 'apm',
  identifier: 'Prometheus',
  type: 'PROMETHEUS',
  mappedServicesAndEnvs: new Map([
    [
      'metric1',
      {
        metricName: 'metric1',
        serviceIdentifier: { label: 'cvng', value: 'CVNG' },
        envIdentifier: { label: 'qa', value: 'QA' },
        prometheusMetric: 'count_seconds_cpu',
        query: '(solo-dolo) dsfs',
        isManualQuery: false,
        serviceFilter: [{ label: 'serviceLabel:serviceValue', value: 'service' }],
        envFilter: [{ label: 'envLabel:envValue', value: 'env' }],
        additionalFilter: [],
        riskCategory: 'Performance/ResponseTime',
        serviceInstance: 'some_service_instance_value',
        lowerBaselineDeviation: true,
        higherBaselineDeviation: true,
        groupName: { label: 'group1', value: 'group1' }
      }
    ],
    [
      'metric2',
      {
        metricName: 'metric2',
        serviceIdentifier: { label: 'delegate', value: 'DELEGATE' },
        envIdentifier: { label: 'qb', value: 'QB' },
        prometheusMetric: 'count_seconds_cpu_qad',
        query: '(solo-dfgdgfdgdg) toryrt9867',
        isManualQuery: true,
        riskCategory: 'Performance/ResponseTime',
        serviceInstance: 'some_service_instance_value',
        lowerBaselineDeviation: true,
        higherBaselineDeviation: true,
        groupName: { label: 'group2', value: 'group2' }
      }
    ],
    [
      'metric5',
      {
        metricName: 'metric5',
        serviceIdentifier: { label: 'CD', value: 'cd' },
        envIdentifier: { label: 'qc', value: 'QC' },
        prometheusMetric: 'count_seconds_cpu_dfde',
        query: '(solo-dolo) dsfs',
        isManualQuery: false,
        serviceFilter: [{ label: 'serviceLabel:serviceValue', value: 'service' }],
        envFilter: [{ label: 'envLabel:envValue', value: 'env' }],
        additionalFilter: [{ label: 'additional:additionalFilter', value: 'additionalFilter' }],
        riskCategory: 'Performance/ResponseTime',
        serviceInstance: 'some_service_instance_value',
        aggregator: 'max',
        lowerBaselineDeviation: true,
        higherBaselineDeviation: false,
        groupName: { label: 'group2', value: 'group2' }
      }
    ]
  ]),
  connectorRef: {
    label: 'prometheusConnector',
    value: 'prometheusConnector',
    scope: 'project',
    live: true,
    connector: {
      name: 'prometheusConnector',
      identifier: 'prometheusConnector',
      description: null,
      orgIdentifier: 'harness_test',
      projectIdentifier: 'raghu_p',
      tags: {},
      type: 'Prometheus',
      spec: {
        url: 'https://126.78.98.34:8080.com/'
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
  }
}

const CreateMockTabsData = {
  monitoringSourceName: 'Prometheus',
  accountId: '1234_accountId',
  orgIdentifier: 'harness_test',
  projectIdentifier: 'raghu_p',
  isEdit: false,
  productName: 'apm',
  identifier: 'Prometheus',
  type: 'PROMETHEUS',
  mappedServicesAndEnvs: new Map([
    [
      'metric1',
      {
        metricName: 'metric1',
        serviceIdentifier: { label: 'cvng', value: 'CVNG' },
        envIdentifier: { label: 'qa', value: 'QA' },
        prometheusMetric: 'count_seconds_cpu',
        query: '(solo-dolo) dsfs',
        isManualQuery: false,
        serviceFilter: [{ label: 'serviceLabel:serviceValue', value: 'service' }],
        envFilter: [{ label: 'envLabel:envValue', value: 'env' }],
        additionalFilter: [],
        riskCategory: 'Performance/ResponseTime',
        serviceInstance: 'some_service_instance_value',
        lowerBaselineDeviation: true,
        higherBaselineDeviation: true,
        groupName: { label: 'group1', value: 'group1' }
      }
    ]
  ]),
  connectorRef: {
    label: 'prometheusConnector',
    value: 'prometheusConnector',
    scope: 'project',
    live: true,
    connector: {
      name: 'prometheusConnector',
      identifier: 'prometheusConnector',
      description: null,
      orgIdentifier: 'harness_test',
      projectIdentifier: 'raghu_p',
      tags: {},
      type: 'Prometheus',
      spec: {
        url: 'https://126.78.98.34:8080.com/'
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
  }
}

function WrapperComponent<PrometheusSetupSource>(
  props: Pick<SetupSourceTabsProps<PrometheusSetupSource>, 'data'>
): JSX.Element {
  return (
    <TestWrapper>
      <SetupSourceTabs {...props} tabTitles={['Review']} determineMaxTab={() => 0}>
        <ReviewPrometheusMapping />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Unit tests for ReeviewPrometheusMapping', () => {
  test('Ensure create api is called with correct payload', async () => {
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

    const { getByText } = render(<WrapperComponent data={CreateMockTabsData} />)
    await waitFor(() => expect(getByText('metric1')).not.toBeNull())
    getByText('cvng')
    getByText('qa')
    getByText('group1')

    fireEvent.click(getByText('submit'))
    await waitFor(() =>
      expect(createFuncMock).toHaveBeenCalledWith({
        accountId: '1234_accountId',
        connectorIdentifier: 'prometheusConnector',
        identifier: 'Prometheus',
        metricDefinitions: [
          {
            additionalFilters: [],
            aggregation: undefined,
            envFilter: [
              {
                labelName: 'envLabel',
                labelValue: 'envValue'
              }
            ],
            envIdentifier: 'QA',
            groupName: 'group1',
            isManualQuery: false,
            metricName: 'metric1',
            prometheusMetric: 'count_seconds_cpu',
            query: '(solo-dolo) dsfs',
            riskProfile: {
              category: 'Performance',
              metricType: 'ResponseTime',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            serviceFilter: [
              {
                labelName: 'serviceLabel',
                labelValue: 'serviceValue'
              }
            ],
            serviceIdentifier: 'CVNG',
            serviceInstanceFieldName: 'some_service_instance_value'
          }
        ],
        monitoringSourceName: 'Prometheus',
        orgIdentifier: 'harness_test',
        productName: 'apm',
        projectIdentifier: 'raghu_p',
        type: 'PROMETHEUS'
      })
    )
  })

  test('Ensure edit api is called with updated values', async () => {
    const editMockFunc = jest.fn()
    jest.spyOn(cvService, 'useUpdateDSConfig').mockReturnValue({
      mutate: editMockFunc as any
    } as UseMutateReturn<any, any, any, any, any>)

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })

    const { getByText } = render(<WrapperComponent data={EditMockData} />)
    await waitFor(() => expect(getByText('metric1')).not.toBeNull())
    getByText('cvng')
    getByText('qa')
    getByText('group1')

    getByText('delegate')
    getByText('qb')

    getByText('CD')
    getByText('qc')

    fireEvent.click(getByText('submit'))
    await waitFor(() =>
      expect(editMockFunc).toHaveBeenCalledWith({
        accountId: '1234_accountId',
        connectorIdentifier: 'prometheusConnector',
        identifier: 'Prometheus',
        metricDefinitions: [
          {
            additionalFilters: [],
            aggregation: undefined,
            envFilter: [
              {
                labelName: 'envLabel',
                labelValue: 'envValue'
              }
            ],
            envIdentifier: 'QA',
            groupName: 'group1',
            isManualQuery: false,
            metricName: 'metric1',
            prometheusMetric: 'count_seconds_cpu',
            query: '(solo-dolo) dsfs',
            riskProfile: {
              category: 'Performance',
              metricType: 'ResponseTime',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            serviceFilter: [
              {
                labelName: 'serviceLabel',
                labelValue: 'serviceValue'
              }
            ],
            serviceIdentifier: 'CVNG',
            serviceInstanceFieldName: 'some_service_instance_value'
          },
          {
            additionalFilters: [],
            aggregation: undefined,
            envFilter: [],
            envIdentifier: 'QB',
            groupName: 'group2',
            isManualQuery: true,
            metricName: 'metric2',
            prometheusMetric: 'count_seconds_cpu_qad',
            query: '(solo-dfgdgfdgdg) toryrt9867',
            riskProfile: {
              category: 'Performance',
              metricType: 'ResponseTime',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            serviceFilter: [],
            serviceIdentifier: 'DELEGATE',
            serviceInstanceFieldName: 'some_service_instance_value'
          },
          {
            additionalFilters: [
              {
                labelName: 'additional',
                labelValue: 'additionalFilter'
              }
            ],
            aggregation: 'max',
            envFilter: [
              {
                labelName: 'envLabel',
                labelValue: 'envValue'
              }
            ],
            envIdentifier: 'QC',
            groupName: 'group2',
            isManualQuery: false,
            metricName: 'metric5',
            prometheusMetric: 'count_seconds_cpu_dfde',
            query: '(solo-dolo) dsfs',
            riskProfile: {
              category: 'Performance',
              metricType: 'ResponseTime',
              thresholdTypes: ['ACT_WHEN_LOWER']
            },
            serviceFilter: [
              {
                labelName: 'serviceLabel',
                labelValue: 'serviceValue'
              }
            ],
            serviceIdentifier: 'cd',
            serviceInstanceFieldName: 'some_service_instance_value'
          }
        ],
        monitoringSourceName: 'Prometheus',
        orgIdentifier: 'harness_test',
        productName: 'apm',
        projectIdentifier: 'raghu_p',
        type: 'PROMETHEUS'
      })
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

    const { container, getByText } = render(<WrapperComponent data={CreateMockTabsData} />)
    await waitFor(() => expect(container.querySelectorAll('[role="row"]').length).toBe(2))
    expect(getByText('metric1')).not.toBeNull()
    expect(getByText('group1')).not.toBeNull()
    expect(getByText('qa')).not.toBeNull()

    fireEvent.click(getByText('submit'))
    await waitFor(() => expect(showErrorMock).toHaveBeenCalledWith('mockError', 7000))
  })
})
