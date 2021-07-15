import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import * as cvServices from 'services/cv'
import CVMonitoringServicesPage from '../CVMonitoringServicesPage'

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
                  environmentRef: 'new_env_test',
                  type: 'Application'
                },
                {
                  name: 'Monitoring service 102 new',
                  identifier: 'Monitoring_service_101',
                  serviceRef: 'AppDService101',
                  environmentRef: 'AppDTestEnv1',
                  type: 'Application'
                },
                {
                  name: 'new monitored service 101',
                  identifier: 'dadadasd',
                  serviceRef: 'test_service',
                  environmentRef: 'AppDTestEnv2',
                  type: 'Application'
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
        <CVMonitoringServicesPage />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelectorAll('[role="row"]').length).toEqual(4))
    expect(container).toMatchSnapshot()
  })

  test('edit flow works correctly', async () => {
    const { container, findByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <CVMonitoringServicesPage />
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
})
