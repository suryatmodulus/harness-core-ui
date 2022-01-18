/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CDTrialHomePage from '../CDTrialHomePage'

describe('CDTrialHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CDTrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should pop up start trial modal if there is queryparam source value signup', () => {
    const { container, getByText } = render(
      <TestWrapper queryParams={{ source: 'signup' }}>
        <CDTrialHomePage />
      </TestWrapper>
    )
    expect(getByText('common.purpose.welcome')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
