import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import DelegateConfigurationResourceRenderer from '../DelegateConfigurationResourceRenderer'

const onChangeFn = jest.fn()

jest.mock('services/cd-ng', () => ({
  useListDelegateProfilesNg: jest
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
  resourceType: ResourceType.DELEGATECONFIGURATION,
  onResourceSelectionChange: onChangeFn
}

describe('Create DelegateConfigurationResourceRenderer', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigurationResourceRenderer {...params} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
