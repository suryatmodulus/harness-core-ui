/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateAccessPointDialogScreens from '../CreateAccessPointDialogSteps'

const params = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    data: undefined,
    loading: false
  }))
}))

describe('Creation of Access Point', () => {
  test('render access point creation dialog', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <CreateAccessPointDialogScreens onCancel={jest.fn()} onSave={jest.fn()} />)
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Selection of provider and connector', () => {
    const { container } = render(
      <TestWrapper>
        <CreateAccessPointDialogScreens onCancel={jest.fn()} onSave={jest.fn()} />)
      </TestWrapper>
    )
    const providerCard = container.querySelectorAll('.bp3-card')[0]
    act(() => {
      fireEvent.click(providerCard)
    })
    expect(container).toMatchSnapshot()
  })
})
