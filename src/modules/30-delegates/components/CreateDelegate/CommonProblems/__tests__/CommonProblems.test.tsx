import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CommonProblems from '../CommonProblems'

describe('Create Common Problems Tab', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <CommonProblems />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
