import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import ExecutionStepInputOutputTab from '../ExecutionStepInputOutputTab'
import data from './io-1.json'
describe('<ExecutionStepInputOutputTab /> tests', () => {
  test('output snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionStepInputOutputTab data={data.outcomes} mode="output" baseFqn="basefqn" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('input snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionStepInputOutputTab data={data.stepParameters} mode="input" baseFqn="basefqn" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
