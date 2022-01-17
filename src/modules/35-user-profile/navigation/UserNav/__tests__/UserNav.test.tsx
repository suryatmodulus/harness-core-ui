/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
