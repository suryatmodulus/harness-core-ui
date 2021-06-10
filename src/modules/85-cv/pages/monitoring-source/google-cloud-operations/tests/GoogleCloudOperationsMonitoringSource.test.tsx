import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { DSConfig } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { projectPathProps, accountPathProps } from '@common/utils/routeUtils'
import { GoogleCloudOperationsMonitoringSource } from '../GoogleCloudOperationsMonitoringSource'
import { formatJSON, GCODSConfig } from '../GoogleCloudOperationsMonitoringSourceUtils'
import { transformGetResponseForStackDriver, transformGetResponseForStackDriverLogs } from '../utils'
import type { GCOLogsDSConfig } from '../MapQueriesToHarnessService/types'

const MockResponseDataCloudMetrics = {
  metaData: {},
  resource: {
    accountId: '1234_accountId',
    orgIdentifier: 'harness_test',
    projectIdentifier: 'raghu_p',
    connectorIdentifier: 'gcpProd2',
    identifier: 'MyGoogleCloudOperationsSource',
    monitoringSourceName: 'MyGoogleCloudOperationsSource',
    metricConfigurations: [
      {
        metricDefinition: {
          dashboardName: ' Mongo Custom Metrics 2 - prod',
          dashboardPath: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc',
          metricName: 'custom.googleapis.com/user/x_mongo_prod_prune_queues_count',
          jsonMetricDefinition: JSON.parse(
            '{"dataSets":[{"timeSeriesQuery":{"timeSeriesFilter":{"filter":"metric.type=\\"custom.googleapis.com/user/x_mongo_prod_prune_queues_count\\" resource.type=\\"global\\"","aggregation":{"perSeriesAligner":"ALIGN_MEAN"},"secondaryAggregation":{}},"unitOverride":"1"}}]}'
          ),
          metricTags: ['Prune Queues Count'],
          riskProfile: { category: 'Performance', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] },
          manualQuery: false
        },
        serviceIdentifier: 'ci',
        envIdentifier: 'Prod'
      },
      {
        metricDefinition: {
          dashboardName: ' Mongo Custom Metrics 2 - prod',
          dashboardPath: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc',
          metricName: 'custom.googleapis.com/user/x_mongo_prod_resource_constraint_instances_count',
          jsonMetricDefinition: JSON.parse(
            '{"dataSets":[{"timeSeriesQuery":{"timeSeriesFilter":{"filter":"metric.type=\\"custom.googleapis.com/user/x_mongo_prod_resource_constraint_instances_count\\" resource.type=\\"global\\"","aggregation":{"perSeriesAligner":"ALIGN_MEAN"},"secondaryAggregation":{}},"unitOverride":"1"}}]}'
          ),
          metricTags: ['Resource Constraint Instances Count'],
          riskProfile: { category: 'Performance', metricType: 'THROUGHPUT', thresholdTypes: ['ACT_WHEN_HIGHER'] },
          manualQuery: false
        },
        serviceIdentifier: 'ci',
        envIdentifier: 'Qa'
      }
    ],
    type: 'STACKDRIVER'
  },
  responseMessages: []
}

const MockResponseCloudLogs = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'Newproject',
  productName: '',
  connectorIdentifier: 'Teststack',
  identifier: 'end_to_end_test',
  monitoringSourceName: 'end to end test',
  logConfigurations: [
    {
      logDefinition: {
        name: 'GCO Logs Query updated 61',
        query:
          'resource.type="k8s_container"\nresource.labels.project_id="prod-setup-205416"\nresource.labels.location="us-west1"\nresource.labels.cluster_name="prod-private-uswest1-primary"\nresource.labels.namespace_name="harness"\nlabels.k8s-pod/app="verification-svc"\nresource.labels.pod_name="verification-svc-5b5f4ff7cc-twt9e"',
        messageIdentifier: 'test-1',
        serviceInstanceIdentifier: 'test'
      },
      serviceIdentifier: 's2',
      envIdentifier: 'e2'
    },
    {
      logDefinition: {
        name: 'GCO Logs Query updated 71',
        query:
          'resource.type="k8s_container"\nresource.labels.project_id="prod-setup-205416"\nresource.labels.location="us-west1"\nresource.labels.cluster_name="prod-private-uswest1-primary"\nresource.labels.namespace_name="harness"\nlabels.k8s-pod/app="verification-svc"',
        messageIdentifier: 'labels.managerHost',
        serviceInstanceIdentifier: 'resource.labels.project_id'
      },
      serviceIdentifier: 's2',
      envIdentifier: 'e2'
    }
  ],
  type: 'STACKDRIVER_LOG'
}

const MockResponseManualQuery = {
  metaData: {},
  resource: {
    accountId: '1234_accountId',
    orgIdentifier: 'harness_test',
    projectIdentifier: 'raghu_p',
    connectorIdentifier: 'gcpProd2',
    identifier: 'MyGoogleCloudOperationsSource',
    monitoringSourceName: 'MyGoogleCloudOperationsSource',
    metricConfigurations: [
      {
        metricDefinition: {
          dashboardName: 'Manual_Query_Dashboard',
          dashboardPath: undefined,
          metricName: 'testQuery',
          jsonMetricDefinition: JSON.parse(
            '{"dataSets":[{"timeSeriesQuery":{"timeSeriesFilter":{"filter":"metric.type=\\"custom.googleapis.com/user/x_mongo_prod_prune_queues_count\\" resource.type=\\"global\\"","aggregation":{"perSeriesAligner":"ALIGN_MEAN"},"secondaryAggregation":{}},"unitOverride":"1"}}]}'
          ),
          metricTags: ['test'],
          riskProfile: { category: 'Performance', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] },
          manualQuery: true
        },
        serviceIdentifier: 'ci',
        envIdentifier: 'Prod'
      }
    ],
    type: 'STACKDRIVER'
  },
  responseMessages: []
}

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockImplementation(() => {
    return { isInitializingDB: false, dbInstance: { get: jest.fn() } }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('../../SelectProduct/SelectProduct', () => ({
  ...(jest.requireActual('../../SelectProduct/SelectProduct') as any),
  SelectProduct: function WrapperComponent() {
    return <Container className="SelectProduct" />
  }
}))

describe('Unit tests for GoogleCloudOperationsMonitoringSource', () => {
  test('Ensure all tabs are rendered, and tabs can be selected on demand', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <GoogleCloudOperationsMonitoringSource />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="SelectProduct"]')).not.toBeNull())
  })

  test('Ensure edit state works for Google Cloud Metrics', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupMonitoringSourceEdit({
          ...accountPathProps,
          ...projectPathProps,
          identifier: ':identifier',
          monitoringSource: ':monitoringSource'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          identifier: '1234_iden',
          monitoringSource: '1234_monitoringSource'
        }}
      >
        <GoogleCloudOperationsMonitoringSource dsConfig={MockResponseDataCloudMetrics.resource as DSConfig} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="SelectProduct"]')).not.toBeNull())
    expect(
      transformGetResponseForStackDriver(MockResponseDataCloudMetrics.resource as GCODSConfig, {
        accountId: '1234_account',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG',
        identifier: '1234_iden'
      })
    ).toEqual({
      accountId: '1234_accountId',
      connectorRef: {
        label: 'gcpProd2',
        value: 'gcpProd2'
      },
      identifier: 'MyGoogleCloudOperationsSource',
      isEdit: true,
      mappedServicesAndEnvs: new Map(),
      name: 'MyGoogleCloudOperationsSource',
      orgIdentifier: 'harness_test',
      product: 'Cloud Metrics',
      projectIdentifier: 'raghu_p',
      selectedMetrics: new Map([
        [
          'custom.googleapis.com/user/x_mongo_prod_prune_queues_count',
          {
            dashboardName: ' Mongo Custom Metrics 2 - prod',
            dashboardPath: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc',
            environment: {
              label: 'Prod',
              value: 'Prod'
            },
            higherBaselineDeviation: true,
            isManualQuery: false,
            lowerBaselineDeviation: false,
            metricName: 'custom.googleapis.com/user/x_mongo_prod_prune_queues_count',
            metricTags: {
              'Prune Queues Count': ''
            },
            query: formatJSON(
              '{"dataSets":[{"timeSeriesQuery":{"timeSeriesFilter":{"filter":"metric.type=\\"custom.googleapis.com/user/x_mongo_prod_prune_queues_count\\" resource.type=\\"global\\"","aggregation":{"perSeriesAligner":"ALIGN_MEAN"},"secondaryAggregation":{}},"unitOverride":"1"}}]}'
            ),
            riskCategory: 'Performance/ERROR',
            service: {
              label: 'ci',
              value: 'ci'
            }
          }
        ],
        [
          'custom.googleapis.com/user/x_mongo_prod_resource_constraint_instances_count',
          {
            dashboardName: ' Mongo Custom Metrics 2 - prod',
            dashboardPath: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc',
            environment: {
              label: 'Qa',
              value: 'Qa'
            },
            higherBaselineDeviation: true,
            isManualQuery: false,
            lowerBaselineDeviation: false,
            metricName: 'custom.googleapis.com/user/x_mongo_prod_resource_constraint_instances_count',
            metricTags: {
              'Resource Constraint Instances Count': ''
            },
            query: formatJSON(
              '{"dataSets":[{"timeSeriesQuery":{"timeSeriesFilter":{"filter":"metric.type=\\"custom.googleapis.com/user/x_mongo_prod_resource_constraint_instances_count\\" resource.type=\\"global\\"","aggregation":{"perSeriesAligner":"ALIGN_MEAN"},"secondaryAggregation":{}},"unitOverride":"1"}}]}'
            ),
            riskCategory: 'Performance/THROUGHPUT',
            service: {
              label: 'ci',
              value: 'ci'
            }
          }
        ]
      ]),
      selectedDashboards: [
        {
          name: ' Mongo Custom Metrics 2 - prod',
          path: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc'
        },
        {
          name: ' Mongo Custom Metrics 2 - prod',
          path: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc'
        }
      ],
      type: 'STACKDRIVER'
    })
  })

  test('Ensure transformGetResponseForStackDriver returns manual input query in edit mode', async () => {
    const res = transformGetResponseForStackDriver(MockResponseManualQuery.resource as GCODSConfig, {
      accountId: '1234_account',
      projectIdentifier: '1234_project',
      orgIdentifier: '1234_ORG',
      identifier: '1234_iden'
    })
    expect(res).toEqual({
      accountId: '1234_accountId',
      connectorRef: {
        label: 'gcpProd2',
        value: 'gcpProd2'
      },
      identifier: 'MyGoogleCloudOperationsSource',
      isEdit: true,
      mappedServicesAndEnvs: new Map(),
      name: 'MyGoogleCloudOperationsSource',
      orgIdentifier: 'harness_test',
      product: 'Cloud Metrics',
      projectIdentifier: 'raghu_p',
      selectedMetrics: new Map([
        [
          'testQuery',
          {
            dashboardName: 'Manual_Query_Dashboard',
            dashboardPath: undefined,
            environment: {
              label: 'Prod',
              value: 'Prod'
            },
            higherBaselineDeviation: true,
            isManualQuery: true,
            lowerBaselineDeviation: false,
            metricName: 'testQuery',
            metricTags: {
              test: ''
            },
            query: formatJSON(
              '{"dataSets":[{"timeSeriesQuery":{"timeSeriesFilter":{"filter":"metric.type=\\"custom.googleapis.com/user/x_mongo_prod_prune_queues_count\\" resource.type=\\"global\\"","aggregation":{"perSeriesAligner":"ALIGN_MEAN"},"secondaryAggregation":{}},"unitOverride":"1"}}]}'
            ),
            riskCategory: 'Performance/ERROR',
            service: {
              label: 'ci',
              value: 'ci'
            }
          }
        ]
      ]),
      selectedDashboards: [
        {
          name: 'Manual_Query_Dashboard',
          path: undefined
        }
      ],
      type: 'STACKDRIVER'
    })
  })

  test('Non Manual Input with incorrect payload', async () => {
    const copyMockResponseManualQuery = Object.assign({}, MockResponseManualQuery.resource)
    copyMockResponseManualQuery.metricConfigurations[0].metricDefinition.manualQuery = false
    const res = transformGetResponseForStackDriver(MockResponseManualQuery.resource as GCODSConfig, {
      accountId: '1234_account',
      projectIdentifier: '1234_project',
      orgIdentifier: '1234_ORG',
      identifier: '1234_iden'
    })
    expect(res).toEqual({
      accountId: '1234_accountId',
      connectorRef: {
        label: 'gcpProd2',
        value: 'gcpProd2'
      },
      identifier: 'MyGoogleCloudOperationsSource',
      isEdit: true,
      mappedServicesAndEnvs: new Map(),
      name: 'MyGoogleCloudOperationsSource',
      orgIdentifier: 'harness_test',
      product: 'Cloud Metrics',
      projectIdentifier: 'raghu_p',
      selectedDashboards: [],
      selectedMetrics: new Map([]),
      type: 'STACKDRIVER'
    })
  })

  test('Ensure edit state works for Google Cloud Logs', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupMonitoringSourceEdit({
          ...accountPathProps,
          ...projectPathProps,
          identifier: ':identifier',
          monitoringSource: ':monitoringSource'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          identifier: '1234_iden',
          monitoringSource: '1234_monitoringSource'
        }}
      >
        <GoogleCloudOperationsMonitoringSource dsConfig={MockResponseCloudLogs as DSConfig} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="SelectProduct"]')).not.toBeNull())
    expect(
      transformGetResponseForStackDriverLogs(MockResponseCloudLogs as GCOLogsDSConfig, {
        accountId: '1234_account',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG',
        identifier: '1234_iden'
      })
    ).toEqual({
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Newproject',
      identifier: 'end_to_end_test',
      product: 'Cloud Logs',
      name: 'end to end test',
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
      isEdit: true,
      connectorRef: {
        label: 'Teststack',
        value: 'Teststack'
      }
    })
  })
})
