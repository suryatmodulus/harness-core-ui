import React from 'react'
import { RenderResult, render, fireEvent, waitFor, queryByText, act } from '@testing-library/react'
import UserProfilePage from '@user-profile/pages/UserProfile/UserProfilePage'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { clickSubmit } from '@common/utils/JestFormHelper'

jest.mock('services/cd-ng', () => ({
  useSaveSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve({ status: 'SUCCESS' }) }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn() }
  })
}))

describe('User Profile Page', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <UserProfilePage />
      </TestWrapper>
    )
    container = renderObj.container
    getByTestId = renderObj.getByTestId
    getByText = renderObj.getByText
  })

  test('User Profile', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Edit User Profile', async () => {
      const edit = getByTestId('editUserProfile')
      act(() => {
        fireEvent.click(edit!)
      })
      await waitFor(() => queryByText(document.body, 'Edit Profile'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      await act(async () => {
        clickSubmit(container)
      })
    }),
    test('Add SCM', async () => {
      const addSCM = getByText('+ Add a Source Code Manager')
      expect(addSCM).toBeTruthy()
      act(() => {
        fireEvent.click(addSCM!)
      })
      await waitFor(() => queryByText(document.body, 'Add a Source Code Manager'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    })
})
