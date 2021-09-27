import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigScriptStep from '../steps/DelegateConfigScriptStep'

const onFinishCb = jest.fn()

describe('Create Delegate Config Script step', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigScriptStep name="script" onFinish={onFinishCb} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const finishBtn = container.getElementsByTagName('button')[1]
    act(() => {
      fireEvent.click(finishBtn!)
    })

    expect(onFinishCb).toBeCalled()
  })
})
