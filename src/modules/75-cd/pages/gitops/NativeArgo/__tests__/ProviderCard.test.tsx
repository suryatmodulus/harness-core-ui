/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
  identifier: 'DarwinArgoDevEnv',
  baseURL: 'https://34.136.244.5',
  status: 'Active',
  type: 'nativeArgo',
  spec: {}
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
