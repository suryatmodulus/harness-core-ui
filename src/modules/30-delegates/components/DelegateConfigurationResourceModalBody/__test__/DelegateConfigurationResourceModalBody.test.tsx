import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigurationResourceModalBody from '../DelegateConfigurationResourceModalBody'

const onChangeFn = jest.fn()

jest.mock('services/cd-ng', () => ({
  useListDelegateProfilesNg: jest
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

describe('Create DelegateConfigurationResourceModalBody', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigurationResourceModalBody {...params} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
