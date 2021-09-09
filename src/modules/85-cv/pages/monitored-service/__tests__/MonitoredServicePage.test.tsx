import React from 'react'
import { render } from '@testing-library/react'
import { Container, Button } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import * as cvServices from 'services/cv'
import { yamlResponse } from './MonitoreService.mock'
import MonitoredServicePage from '../MonitoredServicePage'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org',
    identifier: 'monitored-service'
  }
}

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  HarnessServiceAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
      </Container>
    )
  },
  HarnessEnvironmentAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
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

describe('Unit tests for createting monitored source', () => {
  beforeAll(() => {
    jest.spyOn(cvServices, 'useGetMonitoredService').mockImplementation(
      () =>
        ({
          data: {
            createdAt: 1625571657044,
            lastModifiedAt: 1625627957333,
            monitoredService: {
              orgIdentifier: 'default',
              projectIdentifier: 'Demo',
              identifier: 'monitored-service',
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
        } as any)
    )
    jest.spyOn(cvServices, 'useGetMonitoredServiceYamlTemplate').mockImplementation(
      () =>
        ({
          data: yamlResponse,
          refetch: jest.fn()
        } as any)
    )
  })
  test('Health source table and environment services compoenet renders ', async () => {
    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <MonitoredServicePage />
      </TestWrapper>
    )
    expect(getByText('cv.monitoredServices.title')).toBeDefined()
    expect(getByText('cv.monitoredServices.addNewMonitoredServices')).toBeDefined()

    expect(getByText('cv.monitoredServices.monitoredServiceName')).toBeDefined()

    // Table cv.healthSource.defineYourSource
    expect(getByText('cv.healthSource.defineYourSource')).toBeDefined()

    expect(container).toMatchSnapshot()
  })
})
