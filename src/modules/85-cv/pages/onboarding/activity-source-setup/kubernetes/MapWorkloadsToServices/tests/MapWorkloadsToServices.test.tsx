import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { Classes } from '@blueprintjs/core'
import * as cvService from 'services/cv'
import * as cdService from 'services/cd-ng'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { MapWorkloadsToServices } from '../MapWorkloadsToServices'
import type { KubernetesActivitySourceInfo } from '../../KubernetesActivitySourceUtils'

const MockData: KubernetesActivitySourceInfo = {
  identifier: 'kubeActivity',
  name: 'kubeActivity',
  selectedNamespaces: ['namespace1', 'namespace2'],
  connectorRef: { value: 'kubeConnector2', label: 'kubeConnector2' },
  selectedWorkloads: new Map(),
  connectorType: 'Kubernetes'
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVActivitySourceSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: 'loading',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_ORG'
  }
}

describe('Unit tests for MapWorkloadsToServices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const useGetEnvSpy = jest.spyOn(cdService, 'useGetEnvironmentListForProject')
    useGetEnvSpy.mockReturnValue({
      data: {
        content: [
          {
            identifier: 'env_1',
            name: 'env_1'
          },
          {
            identifier: 'env_2',
            name: 'env_2'
          }
        ]
      }
    } as UseGetReturn<any, any, any, any>)

    const useGetServiceSpy = jest.spyOn(cdService, 'useGetServiceListForProject')
    useGetServiceSpy.mockReturnValue({
      data: {
        content: [
          {
            identifier: 'service_1',
            name: 'service_1'
          },
          {
            identifier: 'service_2',
            name: 'service_2'
          }
        ]
      }
    } as UseGetReturn<any, any, any, any>)
  })

  test('Ensure that table renders in loading state', async () => {
    const useGetWorkloadSpy = jest.spyOn(cvService, 'useGetWorkloads')
    useGetWorkloadSpy.mockReturnValue({
      loading: true
    } as UseGetReturn<any, any, any, unknown>)
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <MapWorkloadsToServices onSubmit={jest.fn()} onPrevious={jest.fn()} data={MockData} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="workloadTable"]')))
    expect(container.querySelectorAll(`[class*='${Classes.SKELETON}']`).length).toBe(24)
  })

  test('Ensure that when api errors out error card is rendered', async () => {
    const refetchMock = jest.fn()
    const useGetWorkloadSpy = jest.spyOn(cvService, 'useGetWorkloads')
    useGetWorkloadSpy.mockReturnValue({
      error: { data: { message: 'error' } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <MapWorkloadsToServices onSubmit={jest.fn()} onPrevious={jest.fn()} data={MockData} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="workloadTable"]')).not.toBeNull())
    expect(container.querySelector('[class*="noWorkloads"]')).toBeNull()

    const button = container.querySelector('button')
    if (!button) {
      throw new Error('Button did not render.')
    }

    fireEvent.click(button)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('Ensure that when no data is returned, no data is rendered', async () => {
    const refetchMock = jest.fn()
    const useGetWorkloadSpy = jest.spyOn(cvService, 'useGetWorkloads')
    useGetWorkloadSpy.mockReturnValue({
      data: { data: { content: [] } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <MapWorkloadsToServices onSubmit={jest.fn()} onPrevious={jest.fn()} data={MockData} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="noWorkloads"]')).not.toBeNull())
    const button = container.querySelector('button')
    if (!button) {
      throw new Error('Button did not render.')
    }

    fireEvent.click(button)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('Ensure that clicking on namespace updates the table with correct data', async () => {
    const refetchMock = jest.fn()
    const useGetWorkloadSpy = jest.spyOn(cvService, 'useGetWorkloads')
    useGetWorkloadSpy.mockReturnValue({
      data: { data: { content: ['workload1', 'workload2'] } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <MapWorkloadsToServices
          onSubmit={jest.fn()}
          onPrevious={jest.fn()}
          data={{
            ...MockData,
            selectedWorkloads: new Map([
              [
                'namespace1',
                new Map([
                  [
                    'workload1',
                    {
                      environmentIdentifier: { label: 'env_1', value: 'env_1' },
                      serviceIdentifier: { label: 'service_1', value: 'service_1' },
                      selected: true,
                      workload: 'workload1'
                    }
                  ]
                ])
              ],
              [
                'namespace2',
                new Map([
                  [
                    'workload2',
                    {
                      environmentIdentifier: { label: 'env_2', value: 'env_2' },
                      serviceIdentifier: { label: 'service_2', value: 'service_2' },
                      selected: true,
                      workload: 'workload2'
                    }
                  ]
                ])
              ]
            ])
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="workloadTable"]')).not.toBeNull())
    expect(container.querySelectorAll('[role="row"]').length).toBe(3)

    expect(getByText('workload2')).not.toBeNull()
    expect(getByText('workload1')).not.toBeNull()
    expect(container.querySelector('input[value="service_1"]')).not.toBeNull()
    expect(container.querySelector('input[value="env_1"]')).not.toBeNull()

    const serviceDropDown = container.querySelector('[data-icon="chevron-down"]')
    if (!serviceDropDown) {
      throw new Error('service was not found.')
    }

    fireEvent.click(serviceDropDown)
    await waitFor(() => expect(document.body.querySelector(`[class*="bp3-menu"]`)).not.toBeNull())
    expect(getByText('+ Add New')).not.toBeNull()

    fireEvent.click(getByText('namespace2'))
    await waitFor(() => expect(container.querySelector('input[value="service_2"]')).not.toBeNull())
    expect(container.querySelector('input[value="env_2"]')).not.toBeNull()
  })

  test('Ensure that when  clicking on new env, the modal is displayed', async () => {
    const refetchMock = jest.fn()
    const useGetWorkloadSpy = jest.spyOn(cvService, 'useGetWorkloads')
    useGetWorkloadSpy.mockReturnValue({
      data: { data: { content: ['workload1', 'workload2', 'workload3'] } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const createEnvMock = jest.fn()
    const useCreateEnvironmentSpy = jest.spyOn(cdService, 'useCreateEnvironment')
    useCreateEnvironmentSpy.mockReturnValue({
      mutate: createEnvMock.mockReturnValue({
        status: 'SUCCESS',
        data: {
          name: 'solo-dolo-5',
          identifier: 'solo-dolo-5'
        }
      }) as unknown
    } as UseMutateReturn<any, any, any, any, any>)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <MapWorkloadsToServices
          onSubmit={jest.fn()}
          onPrevious={jest.fn()}
          data={{
            ...MockData,
            selectedWorkloads: new Map([
              [
                'namespace1',
                new Map([
                  [
                    'workload1',
                    {
                      environmentIdentifier: { label: 'env_1', value: 'env_1' },
                      serviceIdentifier: { label: 'service_1', value: 'service_1' },
                      selected: true,
                      workload: 'workload1'
                    }
                  ],
                  [
                    'workload3',
                    {
                      environmentIdentifier: { label: 'env_1', value: 'env_1' },
                      serviceIdentifier: { label: 'service_1', value: 'service_1' },
                      selected: true,
                      workload: 'workload3'
                    }
                  ]
                ])
              ],
              [
                'namespace2',
                new Map([
                  [
                    'workload2',
                    {
                      environmentIdentifier: { label: 'env_2', value: 'env_2' },
                      serviceIdentifier: { label: 'service_2', value: 'service_2' },
                      selected: true,
                      workload: 'workload2'
                    }
                  ]
                ])
              ]
            ])
          }}
        />
      </TestWrapper>
    )

    // click on drop down caret to bring up enu of drop down options
    await waitFor(() => expect(container.querySelector('[class*="workloadTable"]')).not.toBeNull())
    const envDropdown = container.querySelectorAll('.bp3-input-action [data-icon="chevron-down"]')
    if (!envDropdown[1]) {
      throw new Error('env was not found.')
    }
    fireEvent.click(envDropdown[1])
    await waitFor(() => expect(document.body.querySelector(`[class*="bp3-menu"]`)).not.toBeNull())

    const menu = document.body.querySelector(`[class*="bp3-menu"]`)
    if (!menu) {
      throw new Error('brp3 menu not rendered.')
    }

    // click on add new env option
    fireEvent.click(menu.children[0])

    //expect modal to be visibl and fill modal content
    await waitFor(() => expect(document.body.querySelector('[class*="bp3-dialog-container"]')).not.toBeNull())

    const input = document.body.querySelector('input[name="name"]')
    if (!input) {
      throw Error('Modal was not rendered.')
    }

    fireEvent.change(input, { target: { value: 'solo-dolo-5' } })
    await waitFor(() => expect(document.body.querySelector('input[value="solo-dolo-5"]')).not.toBeNull())

    const submitButton = document.body.querySelector('[class*="bp3-dialog-container"] button[type="submit"]')
    if (!submitButton) {
      throw new Error('submit button was not rendered.')
    }

    fireEvent.click(submitButton)
    await waitFor(() => expect(createEnvMock).toHaveBeenCalledTimes(1))
    fireEvent.click(document.body)

    // expect modal to have disappeared and the newly created option to be selected
    await waitFor(() => expect(document.body.querySelector('[class*="bp3-dialog-container"]')).toBeNull())
    await waitFor(() => expect(container.querySelector('input[value="solo-dolo-5"]')).not.toBeNull())

    // ensure created option is in all dropdowns for env for each table row
    fireEvent.click(container.querySelectorAll('.bp3-input-action [data-icon="chevron-down"]')[3])
    await waitFor(() => expect(document.body.querySelector(`[class*="bp3-menu"]`)).not.toBeNull())

    const menu2 = document.body.querySelector(`[class*="bp3-menu"]`)
    if (!menu2) {
      throw new Error('brp3 menu not rendered.')
    }
    expect(menu2.children[1]?.innerHTML).toEqual(
      '<p style="--text-line-clamp: 1;" class="StyledProps--font Text--lineclamp StyledProps--main Select--menuItemLabel">solo-dolo-5</p>'
    )
  })

  test('Ensure that validation message is displayed when no workloads are selected', async () => {
    const refetchMock = jest.fn()
    const useGetWorkloadSpy = jest.spyOn(cvService, 'useGetWorkloads')
    useGetWorkloadSpy.mockReturnValue({
      data: { data: { content: ['workload1', 'workload2'] } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <MapWorkloadsToServices
          onSubmit={jest.fn()}
          onPrevious={jest.fn()}
          data={{
            ...MockData
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="workloadTable"]')).not.toBeNull())
    fireEvent.click(getByText('next'))
    await waitFor(() => expect(getByText('cv.activitySources.kubernetes.missingWorkloadMapping')).not.toBeNull())
  })
})
