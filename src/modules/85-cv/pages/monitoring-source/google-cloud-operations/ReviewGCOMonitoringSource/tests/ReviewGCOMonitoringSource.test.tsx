import React from 'react'
import { waitFor, render, fireEvent } from '@testing-library/react'
import type { UseMutateReturn } from 'restful-react'
import * as cvService from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import type { GCOMonitoringSourceInfo } from '../../GoogleCloudOperationsMonitoringSourceUtils'
import { ReviewGCOMonitoringSource } from '../ReviewGCOMonitoringSource'
import { GCOProduct } from '../../GoogleCloudOperationsMonitoringSourceUtils'

const MockData: GCOMonitoringSourceInfo = {
  selectedDashboards: [],
  accountId: '1234_accountId',
  projectIdentifier: '1234_PROJECT',
  mappedServicesAndEnvs: new Map(),
  orgIdentifier: '1234_orgIdentifier',
  name: 'solo-dolo',
  identifier: 'semi-auto14',
  product: GCOProduct.CLOUD_METRICS,
  type: 'STACKDRIVER',
  connectorRef: { value: 'connectorRef', label: 'sdfsf' },
  selectedMetrics: new Map([
    [
      'metric_1',
      {
        service: { label: 'service_1', value: 'service_1' },
        environment: { label: 'env_1', value: 'env_1' },
        dashboardName: 'dashboard_1',
        dashboardPath: 'dashPath_1',
        metricName: 'metric_1',
        query: '{"asdads": "asdasd"}',
        metricTags: { 'solo-dolo': '' },
        riskCategory: 'Performance/THROUGHPUT',
        higherBaselineDeviation: true,
        lowerBaselineDeviation: false,
        isManualQuery: false
      }
    ],
    [
      'metric_2',
      {
        service: { label: 'service_1', value: 'service_1' },
        environment: { label: 'env_1', value: 'env_1' },
        dashboardName: 'dashboard_4',
        dashboardPath: 'dashPath_4',
        metricName: 'metric_2',
        query: '{"asdads": "asdasd"}',
        metricTags: { 'solo-dolo': '' },
        riskCategory: 'Performance/RESP_TIME',
        higherBaselineDeviation: true,
        lowerBaselineDeviation: true,
        isManualQuery: false
      }
    ],
    [
      'metric_3',
      {
        service: { label: 'service_2', value: 'service_2' },
        environment: { label: 'env_1', value: 'env_1' },
        dashboardName: 'dashboard_6',
        dashboardPath: 'dashPath_6',
        metricName: 'metric_4',
        query: '{"asdads": "asdasd"}',
        metricTags: { 'solo-dolo': '' },
        riskCategory: 'Errors/ERRORS',
        higherBaselineDeviation: true,
        lowerBaselineDeviation: true,
        isManualQuery: false
      }
    ]
  ])
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVActivitySourceSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: 'loading',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_ORG'
  }
}

const testEditModeWrapperProps: TestWrapperProps = {
  path: routes.toCVAdminSetupMonitoringSourceEdit({
    ...accountPathProps,
    ...projectPathProps,
    monitoringSource: ':monitoringSource',
    identifier: ':identifier'
  }),
  pathParams: {
    accountId: 'loading',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_ORG',
    identifier: 'identifier',
    monitoringSource: 'monitoringSource'
  }
}

describe('Unit tests for ReviewMonitoringSource', () => {
  test('Ensure payload is correct while creating depending on provided data', async () => {
    const useSaveDataSourceCVConfigsSpy = jest.spyOn(cvService, 'useCreateDataSource')
    const mutateMockFn = jest.fn()
    useSaveDataSourceCVConfigsSpy.mockReturnValue({
      mutate: mutateMockFn as any
    } as UseMutateReturn<any, any, any, any, any>)
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ReviewGCOMonitoringSource data={MockData} onSubmit={jest.fn()} onPrevious={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelectorAll('[role="row"]').length).toBe(4)
    expect(container).toMatchSnapshot()

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('submit button was not found')
    }
    fireEvent.click(submitButton)
    await waitFor(() => expect(mutateMockFn).toHaveBeenCalledTimes(1))
    expect(mutateMockFn).toHaveBeenCalledWith({
      accountId: MockData.accountId,
      connectorIdentifier: MockData.connectorRef?.value,
      identifier: 'semi-auto14',
      type: 'STACKDRIVER',
      monitoringSourceName: 'solo-dolo',
      orgIdentifier: MockData.orgIdentifier,
      projectIdentifier: MockData.projectIdentifier,
      metricConfigurations: [
        {
          envIdentifier: 'env_1',
          serviceIdentifier: 'service_1',
          metricDefinition: {
            dashboardName: 'dashboard_1',
            dashboardPath: 'dashPath_1',
            isManualQuery: false,
            jsonMetricDefinition: {
              asdads: 'asdasd'
            },
            metricName: 'metric_1',
            metricTags: ['solo-dolo'],
            riskProfile: {
              category: 'Performance',
              metricType: 'THROUGHPUT',
              thresholdTypes: ['ACT_WHEN_HIGHER']
            }
          }
        },
        {
          envIdentifier: 'env_1',
          serviceIdentifier: 'service_1',
          metricDefinition: {
            dashboardName: 'dashboard_4',
            dashboardPath: 'dashPath_4',
            isManualQuery: false,
            jsonMetricDefinition: {
              asdads: 'asdasd'
            },
            metricName: 'metric_2',
            metricTags: ['solo-dolo'],
            riskProfile: {
              category: 'Performance',
              metricType: 'RESP_TIME',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            }
          }
        },
        {
          envIdentifier: 'env_1',
          serviceIdentifier: 'service_2',
          metricDefinition: {
            dashboardName: 'dashboard_6',
            dashboardPath: 'dashPath_6',
            isManualQuery: false,
            jsonMetricDefinition: {
              asdads: 'asdasd'
            },
            metricName: 'metric_4',
            metricTags: ['solo-dolo'],
            riskProfile: {
              category: 'Errors',
              metricType: 'ERRORS',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            }
          }
        }
      ]
    })
  })

  test('Ensure payload is correct while editing depending on provided data', async () => {
    const useUpdateDataSourceCVConfigsSpy = jest.spyOn(cvService, 'useUpdateDSConfig')
    const mutateMockFn = jest.fn()
    useUpdateDataSourceCVConfigsSpy.mockReturnValue({
      mutate: mutateMockFn as any
    } as UseMutateReturn<any, any, any, any, any>)
    const { container } = render(
      <TestWrapper {...testEditModeWrapperProps}>
        <ReviewGCOMonitoringSource data={MockData} onSubmit={jest.fn()} onPrevious={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelectorAll('[role="row"]').length).toBe(4)
    expect(container).toMatchSnapshot()

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('submit button was not found')
    }
    fireEvent.click(submitButton)
    await waitFor(() => expect(mutateMockFn).toHaveBeenCalledTimes(1))
    expect(mutateMockFn).toHaveBeenCalledWith({
      accountId: MockData.accountId,
      connectorIdentifier: MockData.connectorRef?.value,
      identifier: 'semi-auto14',
      type: 'STACKDRIVER',
      monitoringSourceName: 'solo-dolo',
      orgIdentifier: MockData.orgIdentifier,
      projectIdentifier: MockData.projectIdentifier,
      metricConfigurations: [
        {
          envIdentifier: 'env_1',
          serviceIdentifier: 'service_1',
          metricDefinition: {
            dashboardName: 'dashboard_1',
            dashboardPath: 'dashPath_1',
            isManualQuery: false,
            jsonMetricDefinition: {
              asdads: 'asdasd'
            },
            metricName: 'metric_1',
            metricTags: ['solo-dolo'],
            riskProfile: {
              category: 'Performance',
              metricType: 'THROUGHPUT',
              thresholdTypes: ['ACT_WHEN_HIGHER']
            }
          }
        },
        {
          envIdentifier: 'env_1',
          serviceIdentifier: 'service_1',
          metricDefinition: {
            dashboardName: 'dashboard_4',
            dashboardPath: 'dashPath_4',
            isManualQuery: false,
            jsonMetricDefinition: {
              asdads: 'asdasd'
            },
            metricName: 'metric_2',
            metricTags: ['solo-dolo'],
            riskProfile: {
              category: 'Performance',
              metricType: 'RESP_TIME',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            }
          }
        },
        {
          envIdentifier: 'env_1',
          serviceIdentifier: 'service_2',
          metricDefinition: {
            dashboardName: 'dashboard_6',
            dashboardPath: 'dashPath_6',
            isManualQuery: false,
            jsonMetricDefinition: {
              asdads: 'asdasd'
            },
            metricName: 'metric_4',
            metricTags: ['solo-dolo'],
            riskProfile: {
              category: 'Errors',
              metricType: 'ERRORS',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            }
          }
        }
      ]
    })
  })
})
