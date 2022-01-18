/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { DelegateTokenDetails } from 'services/portal'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateTokensList from '../DelegateTokensList'

const mockTokens: DelegateTokenDetails[] = [
  {
    accountId: 'dsaddefrfr',
    createdAt: 4342354343553,
    createdBy: { name: 'Admin' },
    identifier: 'dsfevrwv',
    name: 'Token 1',
    status: 'ACTIVE',
    uuid: 'debterbteb',
    value: 'fjon2kjh3rl4'
  }
]

jest.mock('@common/exports', () => ({}))

jest.mock('services/portal', () => ({}))

jest.mock('services/cd-ng', () => ({}))

describe('Delegate Tokens list', () => {
  test('render delegate token list', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateTokensList delegateTokens={mockTokens} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
