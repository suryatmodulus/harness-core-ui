import React from 'react'
import { fireEvent, getByText, queryByText, render, RenderResult, waitFor, findAllByText } from '@testing-library/react'

import { act } from 'react-dom/test-utils'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { clickBack, clickSubmit, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import {
  orgMockData,
  getOrgMockData,
  createOrgMockData,
  getOrganizationAggregateDTOListMockData,
  roleMockData,
  invitesMockData,
  response,
  userMockData
} from './OrganizationsMockData'
import OrganizationsPage from '../OrganizationsPage'

const getOrganizationList = jest.fn()
const deleteOrganization = jest.fn()
const getOrg = jest.fn()
const editOrg = jest.fn()
const deleteOrganizationMock = (): Promise<{ status: string }> => {
  deleteOrganization()
  return Promise.resolve({ status: 'SUCCESS' })
}
jest.mock('services/cd-ng', () => ({
  usePostOrganization: jest.fn().mockImplementation(() => createOrgMockData),
  useGetOrganizationList: jest.fn().mockImplementation(args => {
    getOrganizationList(args)
    return { ...orgMockData, refetch: jest.fn(), error: null }
  }),
  useDeleteOrganization: jest.fn().mockImplementation(() => ({ mutate: deleteOrganizationMock })),
  usePutOrganization: jest.fn().mockImplementation(args => {
    editOrg(args)
    return createOrgMockData
  }),
  useGetOrganization: jest.fn().mockImplementation(args => {
    getOrg(args)
    return { ...getOrgMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetOrganizationAggregateDTOList: jest.fn().mockImplementation(() => {
    return { ...getOrganizationAggregateDTOListMockData, refetch: jest.fn(), error: null }
  }),
  useGetCurrentGenUsers: jest
    .fn()
    .mockImplementation(() => ({ data: userMockData, loading: false, refetch: jest.fn() })),
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useSendInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) }))
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

jest.useFakeTimers()

const organization = getOrganizationAggregateDTOListMockData.data.data.content[0].organizationResponse.organization

describe('Org Page List', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/admin/organizations"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <OrganizationsPage />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
  })

  test('Create New Org', async () => {
    expect(container).toMatchSnapshot()
    const newOrg = getAllByText?.('Organization')[0]
    await act(async () => {
      if (newOrg) fireEvent.click(newOrg)
      await waitFor(() => findAllByText(document.body, 'About the Organization'))
    })
    let form = findDialogContainer()
    expect(form).toBeTruthy()
    setFieldValue({ container: form as HTMLElement, type: InputTypes.TEXTFIELD, fieldId: 'name', value: 'dummyorg' })
    await act(async () => {
      clickSubmit(form as HTMLElement)
      await waitFor(() => findAllByText(document.body, 'Invite Collaborators'))
    })
    await act(async () => {
      clickBack(form as HTMLElement)
      await waitFor(() => findAllByText(document.body, 'Edit Organization'))
    })
    await act(async () => {
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
    })
    form = findDialogContainer()
    expect(form).not.toBeTruthy()
  }),
    test('Delete Organization From Menu', async () => {
      deleteOrganization.mockReset()
      const menu = container
        .querySelector(`[data-testid="org-card-${organization.identifier}"]`)
        ?.querySelector("[data-icon='Options']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const deleteMenu = getByText(popover as HTMLElement, 'Delete')
      await act(async () => {
        fireEvent.click(deleteMenu!)
        await waitFor(() => getByText(document.body, 'Delete Organization'))
      })
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'Delete')
      await act(async () => {
        fireEvent.click(deleteBtn!)
      })
      expect(deleteOrganization).toBeCalled()
    }),
    test('Edit Organization', async () => {
      const menu = container
        .querySelector(`[data-testid="org-card-${organization.identifier}"]`)
        ?.querySelector("[data-icon='Options']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const edit = getByText(popover as HTMLElement, 'Edit')
      await act(async () => {
        fireEvent.click(edit)
        await waitFor(() => getByText(document.body, 'Edit Organization'))
      })
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      await act(async () => {
        fireEvent.click(form?.querySelector('button[type="submit"]')!)
      })
      expect(editOrg).toHaveBeenCalled()
    }),
    test('Invite Collaborators', async () => {
      const menu = container
        .querySelector(`[data-testid="org-card-${organization.identifier}"]`)
        ?.querySelector("[data-icon='Options']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const invite = getByText(popover as HTMLElement, 'Invite Collaborators')
      await act(async () => {
        fireEvent.click(invite)
        await waitFor(() => getByText(document.body, 'Invite Collaborators'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
      })
      await act(async () => {
        let form = findDialogContainer()
        fireEvent.click(form?.querySelector('[icon="cross"]')!)
        form = findDialogContainer()
        expect(form).not.toBeTruthy
      })
    })
})
