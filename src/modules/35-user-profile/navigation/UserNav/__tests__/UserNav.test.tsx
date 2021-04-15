import React from 'react'
import { fireEvent, render, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import UserNav from '../UserNav'

describe('User Profile Page', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <UserNav />
      </TestWrapper>
    )
    container = renderObj.container
    getByTestId = renderObj.getByTestId
    getByText = renderObj.getByText
  })
  test('To Profile', () => {
    expect(container).toMatchSnapshot()

    const userProfile = getByText('profile')
    fireEvent.click(userProfile)
    expect(
      getByTestId('location').innerHTML.endsWith(
        routes.toUserProfile({
          accountId: 'testAcc'
        })
      )
    ).toBeTruthy()
  })
})
