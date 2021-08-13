import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { StepsTree } from '../StepsTree'

import data from './data.json'
import retryData from './retryData.json'
describe('<StepsTree /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(<StepsTree nodes={data as any} onStepSelect={jest.fn()} allNodeMap={{}} isRoot />)
    expect(container).toMatchSnapshot()
  })

  test('step selection works', async () => {
    const onStepSelect = jest.fn()
    const { findByText } = render(<StepsTree nodes={data as any} onStepSelect={onStepSelect} allNodeMap={{}} isRoot />)

    const step = await findByText('Step 1')

    fireEvent.click(step)

    expect(onStepSelect).toHaveBeenCalledWith('step_1', undefined)
  })

  test('step selection does not work not started steps', async () => {
    const onStepSelect = jest.fn()
    const { findByText } = render(<StepsTree nodes={data as any} onStepSelect={onStepSelect} allNodeMap={{}} isRoot />)

    const step = await findByText('step_4_1_2')

    fireEvent.click(step)

    expect(onStepSelect).toHaveBeenCalledTimes(0)
  })

  test('works for retry steps', async () => {
    const onStepSelect = jest.fn()
    const { container, findAllByText } = render(
      <TestWrapper>
        <StepsTree onStepSelect={onStepSelect} {...(retryData as any)} isRoot />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const step = await findAllByText('pipeline.execution.retryStepCount')
    fireEvent.click(step[0])

    expect(onStepSelect).toHaveBeenCalledWith('step_1', 'retrystep_1')
  })
})
