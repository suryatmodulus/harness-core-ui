/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TroubleShooting from '../DelegateInstallationError/TroubleShooting'

describe('Create Common Problems Tab', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('show event error btn', () => {
    const { container } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    const noBtn = container.querySelector('.noBtn')
    fireEvent.click(noBtn!)
    expect(container).toMatchSnapshot()
  })
})
