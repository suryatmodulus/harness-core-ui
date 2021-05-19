import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigScope from '../DelegateConfigScope'

const onChangeFn = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentListForProject: jest
    .fn()
    .mockImplementation(() => ({ data: { content: [] }, refetch: jest.fn(), error: null, loading: false }))
}))

describe('Create Common Problems Tab', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigScope onChange={onChangeFn} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
