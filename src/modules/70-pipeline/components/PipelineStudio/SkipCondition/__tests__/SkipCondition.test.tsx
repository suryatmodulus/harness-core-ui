import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SkipCondition, { SkipConditionProps } from '../SkipCondition'

jest.mock('lodash-es', () => ({
  debounce: jest.fn((fn: () => void) => fn()),
  ...(jest.requireActual('lodash-es') as any)
}))

const getProps = (): SkipConditionProps => ({
  onUpdate: jest.fn(),
  isReadonly: false,
  selectedStage: {
    stage: {
      skipCondition: 'somecondition',
      stageName: 'stageName',
      name: 'stageName'
    }
  }
})

describe('Skip Condition in pipeline', () => {
  test('Skip condition in stage', async () => {
    const props = getProps()
    const { getByDisplayValue } = render(
      <TestWrapper>
        <SkipCondition {...props} />
      </TestWrapper>
    )

    fireEvent.change(getByDisplayValue('somecondition'), { target: { value: 'somechangedvalue' } })

    await waitFor(() => {
      expect(props.onUpdate).toBeCalled()
    })
  })
})
