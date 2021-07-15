import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdService from 'services/cd-ng'
import * as cvService from 'services/cv'
import * as portalService from 'services/portal'
import SelectServices from '../SelectServices'
import mockServiceCD from './mockServices-CD1.json'
import mockServices from './mockServices.json'

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

describe('Select Services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('render services for application', async () => {
    const useGetServiceListForProjectSpy = jest.spyOn(cdService, 'useGetServiceListForProject')
    const useCreateServiceSpy = jest.spyOn(cdService, 'useCreateService')
    const useGetListServicesSpy = jest.spyOn(portalService, 'useGetListServices')

    useGetServiceListForProjectSpy.mockReturnValue(mockServices as unknown as UseGetReturn<any, any, any, any>)
    useCreateServiceSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<any, any, any, any, any>)
    useGetListServicesSpy.mockReturnValue({ data: mockServiceCD, refetch: jest.fn() as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectServices initialValues={{ applications: { '1234_appId': 'appName' } }} onPrevious={jest.fn()} />
        </TestWrapper>
      </MemoryRouter>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('Ensure that when user provides filter, it is propagated to api call', async () => {
    const useGetServiceListForProjectSpy = jest.spyOn(cdService, 'useGetServiceListForProject')
    const useCreateServiceSpy = jest.spyOn(cdService, 'useCreateService')
    const useGetListServicesSpy = jest.spyOn(portalService, 'useGetListServices')

    useGetServiceListForProjectSpy.mockReturnValue(mockServices as unknown as UseGetReturn<any, any, any, any>)
    useCreateServiceSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<any, any, any, any, any>)
    useGetListServicesSpy.mockReturnValue({ data: mockServiceCD, refetch: jest.fn() as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectServices initialValues={{ applications: { '1234_appId': 'appName' } }} onPrevious={jest.fn()} />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const filterComponent = container.querySelector('.filterComponent')
    if (!filterComponent) {
      throw Error('Filter component was not rendered.')
    }

    fireEvent.click(filterComponent)
    await waitFor(() => expect(useGetListServicesSpy).toHaveBeenCalledTimes(3))
    expect(useGetListServicesSpy).toHaveBeenNthCalledWith(3, {
      queryParamStringifyOptions: {
        arrayFormat: 'repeat'
      },
      queryParams: {
        appId: ['1234_appId'],
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
    const useGetServiceListForProjectSpy = jest.spyOn(cdService, 'useGetServiceListForProject')
    const useCreateServiceSpy = jest.spyOn(cdService, 'useCreateService')
    const useGetListServicesSpy = jest.spyOn(portalService, 'useGetListServices')

    useGetServiceListForProjectSpy.mockReturnValue(mockServices as unknown as UseGetReturn<any, any, any, any>)
    useCreateServiceSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<any, any, any, any, any>)
    useGetListServicesSpy.mockReturnValue({ data: mockServiceCD, refetch: jest.fn() as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    const onSubmitMock = jest.fn()
    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectServices
            initialValues={{ applications: { appId: 'someApp' } }}
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
    await waitFor(() => expect(useGetListServicesSpy).toHaveBeenCalledTimes(3))
    expect(secondButton[1].getAttribute('class')).toContain('primary')

    // click on environment option and submit
    const selectCaret = container.querySelector(`[class*="bp3-input-action"] [data-icon="caret-down"]`)
    if (!selectCaret) {
      throw Error('Drop down was not rendered.')
    }

    fireEvent.click(selectCaret)

    await waitFor(() => expect(document.body.querySelectorAll('[class*="menuItem"]')).not.toBeNull())
    const options = document.body.querySelectorAll('[class*="menuItem"]')
    fireEvent.click(options[1])
    await waitFor(() => expect(container.querySelector('input[value="bvhj"]')).not.toBeNull())

    // select a table row
    const tableRows = container.querySelectorAll('[role="row"]')
    expect(tableRows.length).toBe(3)
    fireEvent.click(tableRows[1])

    await waitFor(() => expect(tableRows[1].querySelector('input[checked=""]')).not.toBeNull())

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not found.')
    }

    fireEvent.click(submitButton)
    await waitFor(() =>
      expect(onSubmitMock).toHaveBeenCalledWith({
        services: {
          uuid1: {
            appId: 'appId',
            appName: 'someApp',
            id: 'uuid1',
            name: 'Archive',
            selected: true,
            service: {
              label: 'bvhj',
              value: 'bvhj'
            }
          }
        },
        sourceType: 'CHANGE_SOURCE',
        type: 'HARNESS_CD10'
      })
    )
  })

  test('Ensure that when save api throws error it is displayed using toaster', async () => {
    const useGetServiceListForProjectSpy = jest.spyOn(cdService, 'useGetServiceListForProject')
    const useCreateServiceSpy = jest.spyOn(cdService, 'useCreateService')
    const useGetListServicesSpy = jest.spyOn(portalService, 'useGetListServices')

    useGetServiceListForProjectSpy.mockReturnValue(mockServices as unknown as UseGetReturn<any, any, any, any>)
    useCreateServiceSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<any, any, any, any, any>)
    useGetListServicesSpy.mockReturnValue({ data: mockServiceCD, refetch: jest.fn() as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    jest.spyOn(cvService, 'useCreateActivitySource').mockReturnValue({
      mutate: jest.fn().mockRejectedValue({ data: { detailedMessage: 'some error' } }) as unknown
    } as UseMutateReturn<any, any, any, any, any>)

    const onSubmitMock = jest.fn()
    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectServices
            initialValues={{ applications: { '1234_appId': 'appName' } }}
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
    await waitFor(() => expect(useGetListServicesSpy).toHaveBeenCalledTimes(3))
    expect(secondButton[1].getAttribute('class')).toContain('primary')

    // click on environment option and submit
    const selectCaret = container.querySelector(`[class*="bp3-input-action"] [data-icon="caret-down"]`)
    if (!selectCaret) {
      throw Error('Drop down was not rendered.')
    }

    fireEvent.click(selectCaret)

    await waitFor(() => expect(document.body.querySelectorAll('[class*="menuItem"]')).not.toBeNull())
    const options = document.body.querySelectorAll('[class*="menuItem"]')
    fireEvent.click(options[1])
    await waitFor(() => expect(container.querySelector('input[value="bvhj"]')).not.toBeNull())

    // select a table row
    const tableRows = container.querySelectorAll('[role="row"]')
    expect(tableRows.length).toBe(3)
    fireEvent.click(tableRows[1])

    await waitFor(() => expect(tableRows[1].querySelector('input[checked=""]')).not.toBeNull())

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not found.')
    }

    fireEvent.click(submitButton)
    await waitFor(() => expect(onSubmitMock).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(document.body.querySelector('[class*="bp3-toast-message"]')?.innerHTML).toEqual('some error')
    )
  })

  test('Ensure validation message is displayed when no apps are selected', async () => {
    const useGetServiceListForProjectSpy = jest.spyOn(cdService, 'useGetServiceListForProject')
    const useCreateServiceSpy = jest.spyOn(cdService, 'useCreateService')
    const useGetListServicesSpy = jest.spyOn(portalService, 'useGetListServices')

    useGetServiceListForProjectSpy.mockReturnValue(mockServices as unknown as UseGetReturn<any, any, any, any>)
    useCreateServiceSpy.mockReturnValue({ mutate: jest.fn() as unknown } as UseMutateReturn<any, any, any, any, any>)
    useGetListServicesSpy.mockReturnValue({ data: mockServiceCD, refetch: jest.fn() as unknown } as UseGetReturn<
      any,
      any,
      any,
      any
    >)

    const onSubmitMock = jest.fn()
    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectServices
            initialValues={{ applications: { '1234_appId': 'appName' } }}
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
    await waitFor(() => expect(getByText('cv.activitySources.harnessCD.validation.serviceValidation')))
  })
})
