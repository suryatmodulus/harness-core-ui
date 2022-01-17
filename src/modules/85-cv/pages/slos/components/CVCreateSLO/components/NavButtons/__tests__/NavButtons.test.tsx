/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { NavButtons } from '../NavButtons'
import type { NavButtonsProps } from '../NavButtons.types'
import { CreateSLOEnum } from '../../CreateSLOForm/CreateSLO.constants'

function WrapperComponent(props: NavButtonsProps): JSX.Element {
  return (
    <TestWrapper>
      <NavButtons {...props}></NavButtons>
    </TestWrapper>
  )
}

describe('Test NavButtons component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const initialProps = {
    selectedTabId: CreateSLOEnum['NAME'],
    setSelectedTabId: jest.fn(),
    getString: jest.fn(),
    formikProps: {
      setValues: jest.fn(),
      values: {}
    } as any
  }

  test('should render NavButtons component', async () => {
    const { container } = render(<WrapperComponent {...initialProps} />)
    expect(container).toMatchSnapshot()
  })
})
