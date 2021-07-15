import React from 'react'
import { render } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import AddAndUpdateMonitoredService from '../AddAndUpdateMonitoredService'

const response = {
  createdAt: 1625571657044,
  lastModifiedAt: 1625627957333,
  monitoredService: {
    orgIdentifier: 'default',
    projectIdentifier: 'Demo',
    identifier: 'Monitoring_service_101',
    name: 'Monitoring service 102 new',
    type: 'Application',
    description: '',
    serviceRef: 'AppDService101',
    environmentRef: 'AppDTestEnv1',
    sources: {
      healthSources: [
        {
          name: 'new hs old',
          identifier: 'new_hs',
          type: 'AppDynamics',
          spec: {
            connectorRef: 'AppD_Connector_102',
            feature: 'Application Monitoring',
            appdApplicationName: '700712',
            appdTierName: '1181911',
            metricPacks: [
              {
                identifier: 'Errors'
              }
            ]
          }
        },
        {
          name: 'Health Source 101',
          identifier: 'Health_Source_101',
          type: 'AppDynamics',
          spec: {
            connectorRef: 'AppD_Connector_102',
            feature: 'Application Monitoring',
            appdApplicationName: '700015',
            appdTierName: '1180990',
            metricPacks: [
              {
                identifier: 'Performance'
              },
              {
                identifier: 'Errors'
              }
            ]
          }
        }
      ]
    }
  }
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  HarnessService: function Mock1(props: any) {
    return (
      <Container
        className="serviceThing"
        onClick={() => {
          props.onSelect({ label: 'AppDService101', value: 'AppDService101' })
        }}
      >
        {props.item ? JSON.stringify(props.item) : null}
      </Container>
    )
  },
  HarnessEnvironment: function Mock2(props: any) {
    return (
      <Container
        className="environment"
        onClick={() => props.onSelect({ label: 'AppDTestEnv1', value: 'AppDTestEnv1' })}
      >
        {props.item ? JSON.stringify(props.item) : null}
      </Container>
    )
  },
  useGetHarnessEnvironments: () => {
    return {
      environmentOptions: [
        { label: 'env1', value: 'env1' },
        { label: 'AppDTestEnv1', value: 'AppDTestEnv1' }
      ]
    }
  }
}))

jest.mock('services/cv', () => ({
  useGetMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: response, refetch: jest.fn() })),
  useUpdateMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: response, refetch: jest.fn() }))
}))

describe('Unit tests for createting monitored source', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test('Health source table and environment services compoenet renders', async () => {
    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <AddAndUpdateMonitoredService />
      </TestWrapper>
    )

    expect(getByText('cv.monitoredServices.monitoredServiceDetails')).toBeDefined()
    expect(getByText('cv.monitoredServices.monitoredServiceName')).toBeDefined()

    // Servie and environment
    expect(getByText('cv.monitoredServices.serviceAndEnvironment')).toBeDefined()

    // Table cv.healthSource.defineYourSource
    expect(getByText('cv.healthSource.defineYourSource')).toBeDefined()

    expect(container).toMatchSnapshot()
  })
})
