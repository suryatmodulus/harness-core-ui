/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useEnvironmentSelectV2 } from '../useEnvironmentSelectV2'

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

describe('Test useEnvironmentSelectV2', () => {
  test('useEnvironmentSelectV2 should send back proper component', () => {
    const Component: React.FC = () => {
      const { EnvironmentSelect } = useEnvironmentSelectV2({
        selectedEnvironmentIdentifier: 'abc',
        onChange: jest.fn()
      })

      return <EnvironmentSelect />
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <Component />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
