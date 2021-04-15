import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import CVActivitySourcesPage from '../CVActivitySourcesPage'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVActivitySourceSetup({ ...accountPathProps, ...projectPathProps, activitySource: ':activitySource' }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org',
    activitySource: '1234_activity'
  }
}
const MockData = {
  data: {
    content: [
      {
        identifier: '1234_uuid',
        name: 'kube_activitySource',
        createdAt: 1606846078440,
        lastUpdatedAt: 1606846078440,
        activitySourceConfigs: [
          {
            serviceIdentifier: '1234_ser',
            envIdentifier: '1234_env'
          },
          {
            serviceIdentifier: '5678_ser',
            envIdentifier: '1234_env'
          },
          {
            serviceIdentifier: '91011_ser',
            envIdentifier: '5678_env'
          }
        ]
      },
      {
        identifier: '5678_uuid',
        name: 'cd_1.0_source',
        createdAt: 1606932419572,
        lastUpdatedAt: 1606932419572,
        activitySourceConfigs: [
          {
            envIdentifier: '1234_env',
            serviceIdentifier: '5678_ser'
          }
        ]
      }
    ],
    totalItems: 2,
    totalPages: 1,
    pageSize: 10,
    pageIndex: 0
  }
}

describe('CVActivitySourcesPage unit tests', () => {
  test('Ensure when api returns data it is rendered correctly', async () => {
    const useListKubernetesSourcesSpy = jest.spyOn(cvService, 'useListActivitySources')
    const routeActivitySourceEditSetupSpy = jest.spyOn(routes, 'toCVActivitySourceEditSetup')
    useListKubernetesSourcesSpy.mockReturnValue({
      data: MockData,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <CVActivitySourcesPage />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const tableRows = container.querySelectorAll('[role="row"]')
    expect(tableRows.length).toBe(3)
    expect(container).toMatchSnapshot()

    fireEvent.click(tableRows[1])
    await waitFor(() => expect(routeActivitySourceEditSetupSpy).toHaveBeenCalledTimes(1))
  })

  test('Ensure row is deleted and get api is called after deletion', async () => {
    const useListKubernetesSourcesSpy = jest.spyOn(cvService, 'useListActivitySources')
    useListKubernetesSourcesSpy.mockReturnValue({
      data: MockData,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const mockMutateFn = jest.fn().mockReturnValue(Promise.resolve()) as unknown
    const useDeleteKubernetesSourceSpy = jest.spyOn(cvService, 'useDeleteKubernetesSource')
    useDeleteKubernetesSourceSpy.mockReturnValue({ mutate: mockMutateFn } as UseMutateReturn<any, any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <CVActivitySourcesPage />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const tableRows = container.querySelectorAll('[role="row"]')
    expect(tableRows.length).toBe(3)

    const threeDotMenu = tableRows[1].querySelector('.bp3-popover-target span')
    if (!threeDotMenu) {
      throw Error('No 3 dot menu')
    }

    fireEvent.click(threeDotMenu)
    await waitFor(() => expect(document.body.querySelector('[class*="bp3-menu-item"]')).not.toBeNull())

    const deleteOption = document.body.querySelectorAll('[class*="bp3-menu-item"]')
    if (!deleteOption) {
      throw Error('Delete option was not rendered')
    }
    fireEvent.click(deleteOption[1])
    await waitFor(() => expect(document.body.querySelector('[class*="bp3-dialog"]')).not.toBeNull())

    const confirmModalButtons = document.body.querySelectorAll('[class*="bp3-dialog"] button')
    expect(confirmModalButtons.length).toBe(3)
    fireEvent.click(confirmModalButtons[1])

    await waitFor(() => expect(mockMutateFn).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(useListKubernetesSourcesSpy).toHaveBeenCalledTimes(2))
  })

  test('Ensure refetch is called on click of retry for api error', async () => {
    const useListKubernetesSourcesSpy = jest.spyOn(cvService, 'useListActivitySources')
    const refetchMock = jest.fn() as unknown
    useListKubernetesSourcesSpy.mockReturnValue({
      error: { data: { message: 'mock error' } },
      refetch: refetchMock
    } as UseGetReturn<any, any, any, unknown>)

    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <CVActivitySourcesPage />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('mock error')).not.toBeNull())
    const retryButton = container.querySelector('button')
    if (!retryButton) {
      throw new Error('Retry button is missing.')
    }

    fireEvent.click(retryButton)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('Ensure that when you click on oadd activity resource, you are navigated to correct page', async () => {
    const useListKubernetesSourcesSpy = jest.spyOn(cvService, 'useListActivitySources')
    const routeCVAdminSetupSpy = jest.spyOn(routes, 'toCVAdminSetup')

    useListKubernetesSourcesSpy.mockReturnValue({
      data: MockData,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const { container, getByText } = render(
      <TestWrapper>
        <CVActivitySourcesPage />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    fireEvent.click(getByText('cv.admin.activitySources.addActivitySource'))
    await waitFor(() => expect(routeCVAdminSetupSpy).toHaveBeenCalledTimes(1))
  })

  test('Ensure that no data card is displayed when api returns no data', async () => {
    const useListKubernetesSourcesSpy = jest.spyOn(cvService, 'useListActivitySources')
    useListKubernetesSourcesSpy.mockReturnValue({
      data: { data: { content: [] } }
    } as UseGetReturn<any, any, any, unknown>)

    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <CVActivitySourcesPage />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('cv.admin.activitySources.noDataMessage')).not.toBeNull())
    const retryButton = getByText('cv.admin.activitySources.addActivitySource')
    if (!retryButton) {
      throw new Error('Retry button is missing.')
    }

    fireEvent.click(retryButton)
  })
})
