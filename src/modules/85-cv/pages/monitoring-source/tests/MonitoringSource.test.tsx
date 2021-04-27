import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { MonitoringSourceSetupRoutePaths } from '@cv/utils/routeUtils'
import * as cvService from 'services/cv'
import MonitoringSource from '../MonitoringSource'

jest.mock('../app-dynamics/AppDMonitoringSource', () => () => <Container className="appdynamics" />)
jest.mock('../google-cloud-operations/GoogleCloudOperationsMonitoringSource', () => ({
  ...(jest.requireActual('../google-cloud-operations/GoogleCloudOperationsMonitoringSource') as any),
  GoogleCloudOperationsMonitoringSource: function MockGOC({ dsConfig }: { dsConfig: any }) {
    return <Container className="gco">{dsConfig ? <Container className="hasData" /> : null}</Container>
  }
}))
jest.mock('../new-relic/NewRelicMonitoringSource', () => ({
  ...(jest.requireActual('../new-relic/NewRelicMonitoringSource') as any),
  NewRelicMonitoringSource: function MockNewRelic() {
    return <Container className="newrelic" />
  }
}))

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

describe('Unit tests for MonitoringSource', () => {
  test('Ensure appd is rendered based on url', async () => {
    // appd
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupMonitoringSource({
          ...accountPathProps,
          ...projectPathProps,
          monitoringSource: ':monitoringSource'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          monitoringSource: MonitoringSourceSetupRoutePaths.APP_DYNAMICS
        }}
      >
        <MonitoringSource />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="appdynamics"]')).not.toBeNull())
  })

  test('Ensure newrelic is rendered based on URL', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupMonitoringSource({
          ...accountPathProps,
          ...projectPathProps,
          monitoringSource: ':monitoringSource'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          monitoringSource: MonitoringSourceSetupRoutePaths.NEW_RELIC
        }}
      >
        <MonitoringSource />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="newrelic"]')).not.toBeNull())
  })

  test('Ensure gco is rendered based on URL', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupMonitoringSource({
          ...accountPathProps,
          ...projectPathProps,
          monitoringSource: ':monitoringSource'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          monitoringSource: MonitoringSourceSetupRoutePaths.GOOGLE_CLOUD_OPERATIONS
        }}
      >
        <MonitoringSource />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="gco"]')).not.toBeNull())
  })

  test('Ensure nothing is rendered based on URL', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupMonitoringSource({
          ...accountPathProps,
          ...projectPathProps,
          monitoringSource: ':monitoringSource'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          monitoringSource: 'skldfdsklf'
        }}
      >
        <MonitoringSource />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(container.querySelector('.pageDimensions [class*="pageBody"]')?.children?.length).toBe(0)
    )
  })

  test('Ensure that when api is called, data is passed to right place', async () => {
    const refetchMock = jest.fn()
    jest.spyOn(cvService, 'useGetDSConfig').mockReturnValue({
      data: MockResponseData,
      refetch: refetchMock as any,
      loading: false
    } as UseGetReturn<any, any, any, any>)
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupMonitoringSource({
          ...accountPathProps,
          ...projectPathProps,
          monitoringSource: ':monitoringSource'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          monitoringSource: MonitoringSourceSetupRoutePaths.GOOGLE_CLOUD_OPERATIONS
        }}
      >
        <MonitoringSource />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(container.querySelector('.pageDimensions [class*="pageBody"]')?.children?.length).toBe(1)
    )
    expect(container.querySelector('.hasData')).not.toBeNull()
  })
})
