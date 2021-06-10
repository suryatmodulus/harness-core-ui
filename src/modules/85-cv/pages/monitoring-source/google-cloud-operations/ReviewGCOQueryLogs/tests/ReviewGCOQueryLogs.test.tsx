import React from 'react'
import { waitFor, render, fireEvent } from '@testing-library/react'
import type { UseMutateReturn } from 'restful-react'
import * as cvService from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import type { GCOMonitoringSourceInfo } from '../../GoogleCloudOperationsMonitoringSourceUtils'
import { ReviewGCOQueryLogs } from '../ReviewGCOQueryLogs'

const mockDataCreateFlow: GCOMonitoringSourceInfo = {
  name: 'MyGoogleCloudOperationsSource',
  identifier: 'MyGoogleCloudOperationsSource',
  connectorRef: {
    label: 'Test-stack',
    value: 'Teststack'
  },
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'Newproject',
  product: 'Cloud Logs',
  selectedDashboards: [],
  selectedMetrics: new Map(),
  mappedServicesAndEnvs: new Map([
    [
      'GCO Logs Query',
      {
        metricName: 'GCO Logs Query',
        serviceIdentifier: {
          label: 's2',
          value: 's2'
        },
        envIdentifier: {
          label: 'e2',
          value: 'e2'
        },
        query: 'test',
        recordCount: 0,
        serviceInstance: 'labels.source',
        messageIdentifier: 'labels.accountId'
      }
    ]
  ]),
  type: 'STACKDRIVER_LOG',
  isEdit: false
}

const mockDataEditFlow: GCOMonitoringSourceInfo = {
  name: 'end to end test',
  identifier: 'end_to_end_test',
  connectorRef: {
    label: 'Teststack',
    value: 'Teststack'
  },
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'Newproject',
  product: 'Cloud Logs',
  selectedDashboards: [],
  selectedMetrics: new Map(),
  type: 'STACKDRIVER_LOG',
  mappedServicesAndEnvs: new Map([
    [
      'GCO Logs Query updated 61',
      {
        metricName: 'GCO Logs Query updated 61',
        serviceIdentifier: {
          label: 's2',
          value: 's2'
        },
        envIdentifier: {
          label: 'e2',
          value: 'e2'
        },
        serviceInstance: 'test',
        messageIdentifier: 'test-1',
        query:
          'resource.type="k8s_container"\nresource.labels.project_id="prod-setup-205416"\nresource.labels.location="us-west1"\nresource.labels.cluster_name="prod-private-uswest1-primary"\nresource.labels.namespace_name="harness"\nlabels.k8s-pod/app="verification-svc"\nresource.labels.pod_name="verification-svc-5b5f4ff7cc-twt9e"'
      }
    ],
    [
      'GCO Logs Query updated 71',
      {
        metricName: 'GCO Logs Query updated 71',
        serviceIdentifier: {
          label: 's2',
          value: 's2'
        },
        envIdentifier: {
          label: 'e2',
          value: 'e2'
        },
        serviceInstance: 'resource.labels.project_id',
        messageIdentifier: 'labels.managerHost',
        query:
          'resource.type="k8s_container"\nresource.labels.project_id="prod-setup-205416"\nresource.labels.location="us-west1"\nresource.labels.cluster_name="prod-private-uswest1-primary"\nresource.labels.namespace_name="harness"\nlabels.k8s-pod/app="verification-svc"'
      }
    ]
  ]),
  isEdit: true
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVActivitySourceSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: 'loading',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_ORG'
  }
}

describe('Unit tests for ReviewGCOQueryLogs', () => {
  test('Ensure output payload is correct while creating GCO Logs monitoring source', async () => {
    const useSaveDataSourceCVConfigsSpy = jest.spyOn(cvService, 'useCreateDataSource')
    const mutateMockFn = jest.fn()
    useSaveDataSourceCVConfigsSpy.mockReturnValue({
      mutate: mutateMockFn as any
    } as UseMutateReturn<any, any, any, any, any>)
    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <ReviewGCOQueryLogs data={mockDataCreateFlow} onSubmit={jest.fn()} onPrevious={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelectorAll('[role="row"]').length).toBe(2)
    expect(container).toMatchSnapshot()

    const submitButton = getByText('submit')
    if (!submitButton) {
      throw Error('submit button was not found')
    }
    fireEvent.click(submitButton)
    await waitFor(() => expect(mutateMockFn).toHaveBeenCalledTimes(1))
    expect(mutateMockFn).toHaveBeenCalledWith({
      connectorIdentifier: 'Teststack',
      type: 'STACKDRIVER_LOG',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      projectIdentifier: 'Newproject',
      orgIdentifier: 'default',
      identifier: 'MyGoogleCloudOperationsSource',
      monitoringSourceName: 'MyGoogleCloudOperationsSource',
      logConfigurations: [
        {
          envIdentifier: 'e2',
          serviceIdentifier: 's2',
          logDefinition: {
            name: 'GCO Logs Query',
            query: 'test',
            serviceInstanceIdentifier: 'labels.source',
            messageIdentifier: 'labels.accountId'
          }
        }
      ]
    })
  })

  test('Ensure output payload is correct while editing GCO Logs monitoring source', async () => {
    const useUpdateDataSourceCVConfigsSpy = jest.spyOn(cvService, 'useUpdateDSConfig')

    const mutateMockFn = jest.fn()

    useUpdateDataSourceCVConfigsSpy.mockReturnValue({
      mutate: mutateMockFn as any
    } as UseMutateReturn<any, any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <ReviewGCOQueryLogs data={mockDataEditFlow} onSubmit={jest.fn()} onPrevious={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelectorAll('[role="row"]').length).toBe(3)
    expect(container).toMatchSnapshot()

    const submitButton = getByText('submit')
    if (!submitButton) {
      throw Error('submit button was not found')
    }
    fireEvent.click(submitButton)

    await waitFor(() => expect(mutateMockFn).toHaveBeenCalledTimes(1))
    expect(mutateMockFn).toHaveBeenCalledWith({
      connectorIdentifier: 'Teststack',
      type: 'STACKDRIVER_LOG',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      projectIdentifier: 'Newproject',
      orgIdentifier: 'default',
      identifier: 'end_to_end_test',
      monitoringSourceName: 'end to end test',
      logConfigurations: [
        {
          envIdentifier: 'e2',
          serviceIdentifier: 's2',
          logDefinition: {
            name: 'GCO Logs Query updated 61',
            query:
              'resource.type="k8s_container"\nresource.labels.project_id="prod-setup-205416"\nresource.labels.location="us-west1"\nresource.labels.cluster_name="prod-private-uswest1-primary"\nresource.labels.namespace_name="harness"\nlabels.k8s-pod/app="verification-svc"\nresource.labels.pod_name="verification-svc-5b5f4ff7cc-twt9e"',
            serviceInstanceIdentifier: 'test',
            messageIdentifier: 'test-1'
          }
        },
        {
          envIdentifier: 'e2',
          serviceIdentifier: 's2',
          logDefinition: {
            name: 'GCO Logs Query updated 71',
            query:
              'resource.type="k8s_container"\nresource.labels.project_id="prod-setup-205416"\nresource.labels.location="us-west1"\nresource.labels.cluster_name="prod-private-uswest1-primary"\nresource.labels.namespace_name="harness"\nlabels.k8s-pod/app="verification-svc"',
            serviceInstanceIdentifier: 'resource.labels.project_id',
            messageIdentifier: 'labels.managerHost'
          }
        }
      ]
    })
  })
})
