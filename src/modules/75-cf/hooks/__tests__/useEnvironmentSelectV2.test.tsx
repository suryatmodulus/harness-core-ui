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
