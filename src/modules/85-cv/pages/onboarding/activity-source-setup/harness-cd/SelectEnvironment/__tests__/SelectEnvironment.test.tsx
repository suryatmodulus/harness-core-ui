import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdService from 'services/cd-ng'
import * as portalService from 'services/portal'
import SelectEnvironment from '../SelectEnvironment'
import mockEnv from './mockEnv-CD1.json'
import mockEnvironments from './mockEnvironments.json'

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: {
      accountId: 'testAcc'
    },
    query: {
      orgId: 'testOrg'
    }
  })
}))

jest.mock('@cv/components/TableFilter/TableFilter', () => ({
  ...(jest.requireActual('@cv/components/TableFilter/TableFilter') as any),
  TableFilter: function MockComponent(props: any) {
    return <Container className="filterComponent" onClick={() => props.onFilter('mockFilter')} />
  }
}))

describe('SelectEnvironment', () => {
  test('render', async () => {
    const useGetEnvironmentListForProjectSpy = jest.spyOn(cdService, 'useGetEnvironmentListForProject')
    const useCreateEnvironmentSpy = jest.spyOn(cdService, 'useCreateEnvironment')
    const useGetListEnvironmentsSpy = jest.spyOn(portalService, 'useGetListEnvironments')

    useGetEnvironmentListForProjectSpy.mockReturnValue(mockEnvironments as unknown as UseGetReturn<any, any, any, any>)
    useCreateEnvironmentSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    useGetListEnvironmentsSpy.mockReturnValue({ data: mockEnv, refetch: jest.fn() as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectEnvironment initialValues={{ applications: { appId: 'appName' } }} onPrevious={jest.fn()} />
        </TestWrapper>
      </MemoryRouter>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('Ensure api is called with filter provided by user', async () => {
    const useGetEnvironmentListForProjectSpy = jest.spyOn(cdService, 'useGetEnvironmentListForProject')
    const useCreateEnvironmentSpy = jest.spyOn(cdService, 'useCreateEnvironment')
    const useGetListEnvironmentsSpy = jest.spyOn(portalService, 'useGetListEnvironments')
    const refetchMock = jest.fn()
    useGetEnvironmentListForProjectSpy.mockReturnValue(mockEnvironments as unknown as UseGetReturn<any, any, any, any>)
    useCreateEnvironmentSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    useGetListEnvironmentsSpy.mockReturnValue({ data: mockEnv, refetch: refetchMock as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectEnvironment initialValues={{ applications: { appId: 'appName' } }} onPrevious={jest.fn()} />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    const filterComponent = container.querySelector('.filterComponent')
    if (!filterComponent) {
      throw Error('Filter component was not rendered.')
    }

    fireEvent.click(filterComponent)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(2))
    expect(refetchMock).toHaveBeenNthCalledWith(2, {
      queryParamStringifyOptions: {
        arrayFormat: 'repeat'
      },
      queryParams: {
        appId: ['appId'],
        limit: '7',
        offset: '0',
        'search[0]': [
          {
            field: 'keywords'
          },
          {
            op: 'CONTAINS'
          },
          {
            value: 'mockFilter'
          }
        ]
      }
    })
  })

  test('Ensure submit payload is correct and paginate view', async () => {
    const useGetEnvironmentListForProjectSpy = jest.spyOn(cdService, 'useGetEnvironmentListForProject')
    const useCreateEnvironmentSpy = jest.spyOn(cdService, 'useCreateEnvironment')
    const useGetListEnvironmentsSpy = jest.spyOn(portalService, 'useGetListEnvironments')
    const refetchMock = jest.fn()
    useGetEnvironmentListForProjectSpy.mockReturnValue(mockEnvironments as unknown as UseGetReturn<any, any, any, any>)
    useCreateEnvironmentSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    useGetListEnvironmentsSpy.mockReturnValue({ data: mockEnv, refetch: refetchMock as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    const onSubmitMock = jest.fn()
    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectEnvironment
            initialValues={{ applications: { appId: 'appName' } }}
            onPrevious={jest.fn()}
            onSubmit={onSubmitMock}
          />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // click on second page
    const secondButton = container.querySelectorAll('[class*="Pagination"] button[type="button"]')
    if (!secondButton) {
      throw Error('Pagination buttons were not rendered.')
    }

    // click on second page and expect 2 button to be highlighted
    fireEvent.click(secondButton[1])
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(2))
    expect(secondButton[1].getAttribute('class')).toContain('primary')

    // click on environment option and submit
    const selectCaret = container.querySelector(`[class*="bp3-input-action"] [data-icon="chevron-down"]`)
    if (!selectCaret) {
      throw Error('Drop down was not rendered.')
    }

    fireEvent.click(selectCaret)

    await waitFor(() => expect(document.body.querySelectorAll('[class*="menuItemLabel"]')).not.toBeNull())
    const options = document.body.querySelectorAll('[class*="menuItemLabel"]')
    fireEvent.click(options[1])
    await waitFor(() => expect(container.querySelector('input[value="ndbhjdh"]')).not.toBeNull())

    // select a table row
    const tableRows = container.querySelectorAll('[role="row"]')
    expect(tableRows.length).toBe(2)
    fireEvent.click(tableRows[1])

    await waitFor(() => expect(tableRows[1].querySelector('input[checked=""]')).not.toBeNull())

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not found.')
    }

    fireEvent.click(submitButton)
    await waitFor(() =>
      expect(onSubmitMock).toHaveBeenCalledWith({
        applications: {
          appId: 'appName'
        },
        environments: {
          'kODJb5-uuid': {
            appId: 'appId',
            appName: 'appName',
            environment: {
              label: 'ndbhjdh',
              value: 'ndbhjdh'
            },
            id: 'kODJb5-uuid',
            name: 'Test Env',
            selected: true
          }
        }
      })
    )
  })

  test('Ensure validation message is displayed when no apps are selected', async () => {
    const useGetEnvironmentListForProjectSpy = jest.spyOn(cdService, 'useGetEnvironmentListForProject')
    const useCreateEnvironmentSpy = jest.spyOn(cdService, 'useCreateEnvironment')
    const useGetListEnvironmentsSpy = jest.spyOn(portalService, 'useGetListEnvironments')
    const refetchMock = jest.fn()
    useGetEnvironmentListForProjectSpy.mockReturnValue(mockEnvironments as unknown as UseGetReturn<any, any, any, any>)
    useCreateEnvironmentSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    useGetListEnvironmentsSpy.mockReturnValue({ data: mockEnv, refetch: refetchMock as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    const onSubmitMock = jest.fn()
    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectEnvironment
            initialValues={{ applications: { appId: 'appName' } }}
            onPrevious={jest.fn()}
            onSubmit={onSubmitMock}
          />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(submitButton)
    await waitFor(() => expect(getByText('cv.activitySources.harnessCD.validation.environmentValidation')))
  })
})
