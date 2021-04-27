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
