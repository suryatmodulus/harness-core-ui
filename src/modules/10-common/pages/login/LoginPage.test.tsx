/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import LoginPage from './LoginPage'

describe('Login Page', () => {
  test('The login page renders', () => {
    const { container } = render(
      <TestWrapper path={routes.toLogin()}>
        <LoginPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
