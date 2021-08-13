import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigScopeEdit from '../DelegateConfigScope/DelegateConfigScopeEdit'

const mockRules = [
  { environmentIds: ['Env1'], environmentTypeId: 'PROD' },
  { environmentIds: ['Env2'], environmentTypeId: 'NON_PROD' }
]

const onChangeFn = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentListForProject: jest
    .fn()
    .mockImplementation(() => ({ data: { content: [] }, refetch: jest.fn(), error: null, loading: false }))
}))

describe('Render del config scope Edit', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigScopeEdit onChange={onChangeFn} scopingRules={mockRules} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
