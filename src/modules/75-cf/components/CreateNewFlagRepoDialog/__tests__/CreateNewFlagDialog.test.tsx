import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateNewFlagRepoDialog from '../CreateNewFlagRepoDialog'

describe('CreateNewFlagDialog', () => {
  test('it should render correctly', () => {
    render(
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CreateNewFlagRepoDialog isOpen={true} gitRepoRefetch={jest.fn()} closeModal={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.getByText('enableGitExperience')).toBeInTheDocument()
  })
})
