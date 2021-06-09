import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import DelegateResourceRenderer from '../DelegateResourceRenderer'

const onChangeFn = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegateGroupsV2: jest
    .fn()
    .mockImplementation(() => ({ data: { content: [] }, refetch: jest.fn(), error: null, loading: false }))
}))

const resourceScope = {
  accountIdentifier: 'accountId',
  projectIdentifier: '',
  orgIdentifier: ''
}
const params = {
  identifiers: ['asd', 'esd'],
  resourceScope: resourceScope,
  resourceType: ResourceType.DELEGATE,
  onResourceSelectionChange: onChangeFn
}

describe('Create DelegateResourceRenderer', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateResourceRenderer {...params} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
