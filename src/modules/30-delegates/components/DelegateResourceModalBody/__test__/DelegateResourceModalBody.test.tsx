import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateResourceModalBody from '../DelegateResourceModalBody'

const onChangeFn = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegateGroupsV2: jest
    .fn()
    .mockImplementation(() => ({ data: { content: [] }, refetch: jest.fn(), error: null, loading: false }))
}))

const params = {
  searchTerm: '',
  onSelectChange: onChangeFn,
  selectedData: [],
  resourceScope: {
    accountIdentifier: 'accountId'
  }
}

describe('Create DelegateResourceModalBody', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateResourceModalBody {...params} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
