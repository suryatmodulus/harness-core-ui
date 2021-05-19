import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigScopeStep from '../steps/DelegateConfigScopeStep'

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentListForProject: () => ({ data: { content: [] } })
}))

describe('Create Delegate Config Scope', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigScopeStep onFinish={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
