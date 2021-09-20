import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import * as cvServices from 'services/cv'
import CVMonitoredServiceListingPage from '../CVMonitoredServiceListingPage'
import { monitoredServicelist, mockDeleteData } from './MonitoreService.mock'

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
    jest.spyOn(cvServices, 'useDeleteMonitoredService').mockImplementation(
      () =>
        ({
          data: {},
          mutate: jest.fn()
        } as any)
    )
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
            ...monitoredServicelist,
            loading: false,
            refetch: jest.fn(),
            error: {}
          },
          loading: false,
          refetch: jest.fn(),
          error: {}
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
        /account/1234_accountId/cv/orgs/1234_org/projects/1234_project/monitoredserviceconfigurations/edit/delete_me_test
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

  test('delete flow works correctly', async () => {
    jest.spyOn(cvServices, 'useListMonitoredService').mockImplementation(
      () =>
        ({
          data: { ...mockDeleteData },
          loading: false,
          refetch: jest.fn(),
          error: {}
        } as any)
    )
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <CVMonitoredServiceListingPage />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.context-menu-mock-delete')!)
    await waitFor(() => expect(container.querySelectorAll('.body [role="row"]').length).toEqual(2))
  })
})
