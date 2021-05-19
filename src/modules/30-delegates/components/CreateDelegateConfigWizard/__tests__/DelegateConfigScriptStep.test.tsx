import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigScriptStep from '../steps/DelegateConfigScriptStep'

describe('Create Delegate Config Scope', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigScriptStep name="script" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
