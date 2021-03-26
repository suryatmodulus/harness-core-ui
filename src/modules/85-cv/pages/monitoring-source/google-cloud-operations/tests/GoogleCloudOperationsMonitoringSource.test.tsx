import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { DSConfig } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { projectPathProps, accountPathProps } from '@common/utils/routeUtils'
import { GoogleCloudOperationsMonitoringSource, transformGetResponse } from '../GoogleCloudOperationsMonitoringSource'
import { formatJSON, GCODSConfig } from '../GoogleCloudOperationsMonitoringSourceUtils'

const MockResponseData = {
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

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockImplementation(() => {
    return { isInitializingDB: false, dbInstance: { get: jest.fn() } }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('../../SelectProduct/SelectProduct', () => ({
  ...(jest.requireActual('../../SelectProduct/SelectProduct') as object),
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

  test('Ensure edit state works', async () => {
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
        <GoogleCloudOperationsMonitoringSource dsConfig={MockResponseData.resource as DSConfig} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="SelectProduct"]')).not.toBeNull())
    expect(
      transformGetResponse(MockResponseData.resource as GCODSConfig, {
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
            isManualQuery: undefined,
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
            isManualQuery: undefined,
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
})
