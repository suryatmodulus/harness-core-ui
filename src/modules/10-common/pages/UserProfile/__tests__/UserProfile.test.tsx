import React from 'react'
import { RenderResult, render, fireEvent, waitFor, queryByText, act } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import UserProfilePage from '@common/pages/UserProfile/UserProfilePage.tsx'
import { clickSubmit } from '@common/utils/JestFormHelper'

describe('Project Page List', () => {
  let container: HTMLElement
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
    })
})
