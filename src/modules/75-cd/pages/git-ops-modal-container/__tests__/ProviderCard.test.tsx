import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ProviderCard from '../ProviderCard/ProviderCard'

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

const provider = {
  name: 'Darwin Argo Dev Env',
  id: 'DarwinArgoDevEnv',
  baseURL: 'https://34.136.244.5',
  status: 'Active',
  type: 'nativeArgo'
}

describe('ProviderCard snapshot test', () => {
  test('should render ProviderCard', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <ProviderCard provider={provider} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
