import React from 'react'
import { act, fireEvent, getByText, queryByText, render, RenderResult, waitFor } from '@testing-library/react'

import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import type { ResponseBoolean } from 'services/cd-ng'
import { clickSubmit } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { activeUserMock, mockResponse, resourceGroupsMockData, roleMockData, usersMockData } from './mock'
import UsersPage from '../UsersPage'

jest.useFakeTimers()

const deleteActiveUser = jest.fn()
const unlockActiveUser = jest.fn()
const deleteActiveUserMock = (): ResponseBoolean => {
  deleteActiveUser()
  return mockResponse
}
const unlockActiveUserMock = (): ResponseBoolean => {
  unlockActiveUser()
  return mockResponse
}

const createUser = jest.fn()
const createUserMock = (): ResponseBoolean => {
  createUser()
  return mockResponse
}

const createRole = jest.fn()
const createRoleMock = (): ResponseBoolean => {
  createRole()
  return mockResponse
}

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => {
    return { data: roleMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useCreateRoleAssignments: jest.fn().mockImplementation(() => ({ mutate: createRoleMock })),
  useDeleteRoleAssignment: jest.fn().mockImplementation(() => ({ mutate: mockResponse }))
}))

jest.mock('services/resourcegroups', () => ({
  useGetResourceGroupList: jest.fn().mockImplementation(() => {
    return { data: resourceGroupsMockData, refetch: jest.fn(), error: null }
  })
}))

jest.mock('@common/hooks/useMutateAsGet', () => ({
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: activeUserMock, refetch: jest.fn(), error: null }
  })
}))

jest.mock('services/cd-ng', () => ({
  useRemoveUser: jest.fn().mockImplementation(() => ({ mutate: deleteActiveUserMock })),
  useUnlockUser: jest.fn().mockImplementation(() => ({ mutate: unlockActiveUserMock })),
  useSendInvite: jest.fn().mockImplementation(() => ({ mutate: createUserMock })),
  useGetCurrentGenUsers: jest.fn().mockImplementation(() => {
    return { data: usersMockData, refetch: jest.fn(), error: null }
  })
}))

jest.useFakeTimers()

describe('UsersPage Test', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path={routes.toUsers(accountPathProps)} pathParams={{ accountId: 'testAcc' }}>
        <UsersPage />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText('rbac.user'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  })
  test('Invite a User', async () => {
    createUser.mockReset()
    const addUser = getByText(container, 'rbac.user')
    expect(addUser).toBeTruthy()
    fireEvent.click(addUser!)
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    const selectCaret = document.body.querySelector('[data-icon="chevron-down"]')
    expect(selectCaret).toBeTruthy()
    fireEvent.click(selectCaret!)
    const popover = findPopoverContainer()
    fireEvent.click(getByText(popover!, 'admin@harness.io'))
    await act(async () => {
      clickSubmit(form!)
    })
    expect(createUser).toBeCalled()
  })
  test('Delete Active User', async () => {
    deleteActiveUser.mockReset()
    const menu = container.querySelector(`[data-testid="menu-${activeUserMock.data?.content?.[0].user.uuid}"]`)
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const deleteMenu = getByText(popover as HTMLElement, 'delete')
    await act(async () => {
      fireEvent.click(deleteMenu)
      await waitFor(() => getByText(document.body, 'rbac.usersPage.deleteTitle'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'delete')
      fireEvent.click(deleteBtn!)
      expect(deleteActiveUser).toBeCalled()
    })
  })
  test('Add Roles', async () => {
    createRole.mockReset()
    const addRole = container.querySelector(`[data-testid="addRole-${activeUserMock.data?.content?.[0].user.uuid}"]`)
    expect(addRole).toBeTruthy()
    act(() => {
      fireEvent.click(addRole!)
    })
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    const addButton = form?.querySelector('button[data-id="btn-add"]')

    expect(addButton).toBeTruthy()

    act(() => {
      fireEvent.click(addButton!)
    })

    await act(async () => {
      clickSubmit(form!)
    })

    expect(form).toMatchSnapshot()
  })
  test('Unlock Active User', async () => {
    unlockActiveUser.mockReset()
    const menu = container.querySelector(`[data-testid="menu-${activeUserMock.data?.content?.[1].user.uuid}"]`)
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const unlockMenu = getByText(popover as HTMLElement, 'rbac.usersPage.unlockTitle')
    await act(async () => {
      fireEvent.click(unlockMenu)
      await waitFor(() => getByText(document.body, 'rbac.usersPage.unlockTitle'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const confirmBtn = queryByText(form as HTMLElement, 'confirm')
      fireEvent.click(confirmBtn!)
      expect(unlockActiveUser).toBeCalled()
    })
  })
})
