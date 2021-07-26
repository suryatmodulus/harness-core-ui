import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import * as cvServices from 'services/cv'
import CVMonitoredServiceListingPage from '../CVMonitoredServiceListingPage'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVMonitoringServices({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

jest.mock('@cv/components/ContextMenuActions/ContextMenuActions', () => (props: any) => {
  return (
    <>
      <div className="context-menu-mock-edit" onClick={props.onEdit} />
      <div className="context-menu-mock-delete" onClick={props.onDelete} />
    </>
  )
})

describe('Monitored Service list', () => {
  beforeAll(() => {
    jest.spyOn(cvServices, 'useDeleteMonitoredService').mockImplementation(() => ({} as any))
    jest.spyOn(cvServices, 'useGetMonitoredServiceListEnvironments').mockImplementation(
      () =>
        ({
          data: ['new_env_test', 'AppDTestEnv1', 'AppDTestEnv2']
        } as any)
    )
    jest.spyOn(cvServices, 'useListMonitoredService').mockImplementation(
      () =>
        ({
          data: {
            data: {
              totalPages: 1,
              totalItems: 3,
              pageItemCount: 3,
              pageSize: 10,
              content: [
                {
                  name: 'delete me test',
                  identifier: 'delete_me_test',
                  serviceRef: 'AppDService',
                  serviceName: 'ServiceName 1',
                  environmentName: 'EnvironmentName 1',
                  environmentRef: 'new_env_test',
                  type: 'Application',
                  healthMonitoringEnabled: true,
                  historicalTrend: {
                    healthScores: [{ riskStatus: 'NO_DATA', riskValue: -2 }]
                  },
                  currentHealthScore: { riskValue: 10, riskStatus: 'LOW' }
                },
                {
                  name: 'Monitoring service 102 new',
                  identifier: 'Monitoring_service_101',
                  serviceRef: 'AppDService101',
                  environmentRef: 'AppDTestEnv1',
                  serviceName: 'ServiceName 2',
                  environmentName: 'EnvironmentName 2',
                  type: 'Application',
                  healthMonitoringEnabled: true,
                  historicalTrend: {
                    healthScores: [{ riskStatus: 'NO_DATA', riskValue: -2 }]
                  },
                  tags: { tag1: '', tag2: '', tag3: '' },
                  currentHealthScore: { riskValue: 50, riskStatus: 'MEDIUM' }
                },
                {
                  name: 'new monitored service 101',
                  identifier: 'dadadasd',
                  serviceRef: 'test_service',
                  environmentRef: 'AppDTestEnv2',
                  serviceName: 'ServiceName 3',
                  environmentName: 'EnvironmentName 3',
                  type: 'Application',
                  healthMonitoringEnabled: true,
                  historicalTrend: {
                    healthScores: [{ riskStatus: 'NO_DATA', riskValue: -2 }]
                  },
                  currentHealthScore: { riskValue: 90, riskStatus: 'HIGH' }
                }
              ],
              pageIndex: 0,
              empty: false
            },
            loading: false,
            refetch: jest.fn(),
            error: {}
          }
        } as any)
    )
  })
  test('Service listing component renders', async () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <CVMonitoredServiceListingPage />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelectorAll('[role="row"]').length).toEqual(4))
  })

  test('edit flow works correctly', async () => {
    const { container, findByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <CVMonitoredServiceListingPage />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.context-menu-mock-edit')!)
    const path = await findByTestId('location')
    expect(path).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/1234_accountId/cv/orgs/1234_org/projects/1234_project/monitoringservices/edit/delete_me_test
      </div>
    `)
  })

  // TestCase for Checking Title + Chart + HealthScore + Tags render
  test('Test HealthSourceCard values', async () => {
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <CVMonitoredServiceListingPage />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('cv.monitoredServices.riskLabel.highRisk')).toBeDefined())
    await waitFor(() => expect(getByText('cv.monitoredServices.riskLabel.mediumRisk')).toBeDefined())
    await waitFor(() => expect(getByText('cv.monitoredServices.riskLabel.lowRisk')).toBeDefined())
  })

  test('Test Service and Environment names renders', async () => {
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <CVMonitoredServiceListingPage />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('ServiceName 1')).toBeDefined())
    await waitFor(() => expect(getByText('EnvironmentName 1')).toBeDefined())
    await waitFor(() => expect(getByText('ServiceName 2')).toBeDefined())
    await waitFor(() => expect(getByText('EnvironmentName 2')).toBeDefined())
    await waitFor(() => expect(getByText('ServiceName 3')).toBeDefined())
    await waitFor(() => expect(getByText('EnvironmentName 3')).toBeDefined())
  })

  test('Test tags renders', async () => {
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <CVMonitoredServiceListingPage />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('tag1')).toBeDefined())
    await waitFor(() => expect(getByText('tag2')).toBeDefined())
    await waitFor(() => expect(getByText('tag3')).toBeDefined())
  })
})
