import React from 'react'
import {
  act,
  fireEvent,
  getByText,
  queryAllByText,
  queryByText,
  render,
  RenderResult,
  waitFor
} from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { accountPathProps, serviceAccountProps } from '@common/utils/routeUtils'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import type { ResponseBoolean } from 'services/cd-ng'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import {
  serviceAccountsAggregate,
  apiKeyListAggregate,
  tokenListAggregate,
  mockResponse
} from './ServiceAccountDetailsMock'
import ServiceAccountDetails from '../ServiceAccountDetails'

const deleteApiKey = jest.fn()
const deleteApiKeyMock = (): ResponseBoolean => {
  deleteApiKey()
  return mockResponse
}

const deleteTokens = jest.fn()
const deleteTokensMock = (): ResponseBoolean => {
  deleteTokens()
  return mockResponse
}

const createApiKey = jest.fn()
const createApiKeyMock = (): ResponseBoolean => {
  createApiKey()
  return mockResponse
}

const createToken = jest.fn()
const createTokenMock = (): ResponseBoolean => {
  createToken()
  return mockResponse
}

const updateToken = jest.fn()
const updateTokenMock = (): ResponseBoolean => {
  updateToken()
  return mockResponse
}

const updateApiKey = jest.fn()
const updateApiKeyMock = (): ResponseBoolean => {
  updateApiKey()
  return mockResponse
}

jest.mock('services/cd-ng', () => ({
  useListAggregatedServiceAccounts: jest.fn().mockImplementation(() => {
    return { data: serviceAccountsAggregate, refetch: jest.fn(), error: null, loading: false }
  }),
  useListAggregatedApiKeys: jest.fn().mockImplementation(() => {
    return { data: apiKeyListAggregate, refetch: jest.fn(), error: null, loading: false }
  }),
  useListAggregatedTokens: jest.fn().mockImplementation(() => {
    return { data: tokenListAggregate, refetch: jest.fn(), error: null, loading: false }
  }),
  useDeleteApiKey: jest.fn().mockImplementation(() => ({ mutate: deleteApiKeyMock })),
  useCreateApiKey: jest.fn().mockImplementation(() => ({ mutate: createApiKeyMock })),
  useUpdateApiKey: jest.fn().mockImplementation(() => ({ mutate: updateApiKeyMock })),
  useDeleteToken: jest.fn().mockImplementation(() => ({ mutate: deleteTokensMock })),
  useCreateToken: jest.fn().mockImplementation(() => ({ mutate: createTokenMock })),
  useUpdateToken: jest.fn().mockImplementation(() => ({ mutate: updateTokenMock }))
}))

describe('Service Account Details Page Test', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toServiceAccountDetails({ ...accountPathProps, ...serviceAccountProps })}
        pathParams={{ accountId: 'testAcc', serviceAccountIdentifier: 'serviceAccountId' }}
      >
        <ServiceAccountDetails />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    getByTestId = renderObj.getByTestId
    await waitFor(() => getAllByText('accessControl'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Create New API key', async () => {
      createApiKey.mockReset()
      const newAPIkey = getByTestId('createNewApiKey')
      expect(newAPIkey).toBeTruthy()
      act(() => {
        fireEvent.click(newAPIkey)
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fillAtForm([{ container: form!, type: InputTypes.TEXTFIELD, value: 'New Api Key', fieldId: 'name' }])
      await act(async () => {
        clickSubmit(form!)
      })
      expect(createApiKey).toBeCalled()
      form = findDialogContainer()
      expect(form).toBeFalsy()
    }),
    test('Edit API key', async () => {
      updateApiKey.mockReset()
      const menu = getByTestId('apiKey-menu-api_key')
      fireEvent.click(menu)
      const popover = findPopoverContainer()
      const edit = queryAllByText(popover as HTMLElement, 'edit')[0]
      act(() => {
        fireEvent.click(edit)
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fillAtForm([{ container: form!, type: InputTypes.TEXTFIELD, value: 'Edited Api Key', fieldId: 'name' }])
      await act(async () => {
        clickSubmit(form!)
      })
      expect(updateApiKey).toBeCalled()
      form = findDialogContainer()
      expect(form).toBeFalsy()
    }),
    test('Delete Api Key', async () => {
      deleteApiKey.mockReset()
      const menu = getByTestId('apiKey-menu-api_key')
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const deleteMenu = getByText(popover as HTMLElement, 'delete')
      await act(async () => {
        fireEvent.click(deleteMenu!)
        await waitFor(() => getByText(document.body, 'rbac.apiKey.confirmDeleteTitle'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        const deleteBtn = queryByText(form as HTMLElement, 'delete')
        fireEvent.click(deleteBtn!)
        expect(deleteApiKey).toBeCalled()
      })
    }),
    test('Create New token', async () => {
      const tokens = getByTestId('tokens-api_key')
      await act(async () => {
        fireEvent.click(tokens!)
      })
      const newToken = getByTestId('new_token-api_key')
      act(() => {
        fireEvent.click(newToken!)
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fillAtForm([{ container: form!, type: InputTypes.TEXTFIELD, value: 'New Api Key', fieldId: 'name' }])
      await act(async () => {
        clickSubmit(form!)
      })
      const close = getByText(form!, 'close')
      act(() => {
        fireEvent.click(close!)
      })
      form = findDialogContainer()
      expect(form).toBeFalsy()
    })
})
