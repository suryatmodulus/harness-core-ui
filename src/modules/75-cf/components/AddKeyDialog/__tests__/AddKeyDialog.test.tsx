/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AddKeyDialog from '../AddKeyDialog'

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentListForProject: jest.fn().mockImplementation(() => ({
    data: {
      data: {
        content: [
          {
            identifier: 'abc',
            name: 'abc'
          }
        ]
      }
    },
    loading: false,
    error: undefined,
    refetch: jest.fn()
  }))
}))

describe('Test AddKeyDialog', () => {
  test('AddKeyDialog should be rendered properly', async () => {
    const onCreate = jest.fn()
    const Component = (
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <AddKeyDialog
          environment={{
            accountId: 'dummy',
            identifier: 'dummy',
            orgIdentifier: 'dummy',
            projectIdentifier: 'dummy'
          }}
          onCreate={onCreate}
        />
      </TestWrapper>
    )
    const { container, rerender } = render(Component)

    fireEvent.click(container.querySelector('button') as HTMLButtonElement)
    rerender(Component)
    expect(container).toMatchSnapshot()
  })
})
