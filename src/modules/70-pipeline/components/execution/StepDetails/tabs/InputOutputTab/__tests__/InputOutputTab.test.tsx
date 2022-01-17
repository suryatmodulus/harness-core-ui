/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { InputOutputTab } from '../InputOutputTab'
import data from './io-1.json'
describe('<ExecutionStepInputOutputTab /> tests', () => {
  test('output snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <InputOutputTab data={data.outcomes} mode="output" baseFqn="basefqn" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('input snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <InputOutputTab data={data.stepParameters} mode="input" baseFqn="basefqn" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
