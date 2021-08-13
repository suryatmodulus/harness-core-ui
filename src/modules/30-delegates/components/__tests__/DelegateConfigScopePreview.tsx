import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigScopePreview from '../DelegateConfigScope/DelegateConfigScopePreview'

const mockRules = [
  { environmentIds: ['Env1'], environmentTypeId: 'PROD' },
  { environmentIds: ['Env2'], environmentTypeId: 'NON_PROD' }
]

describe('Render del config scope Preview', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigScopePreview scopingRules={mockRules} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
