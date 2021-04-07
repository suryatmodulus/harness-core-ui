import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import GitSyncRepoForm from '../GitSyncRepoForm'

const createGitSynRepo = jest.fn()

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => Promise.resolve([]))
}))

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Git Sync - repo tab', () => {
  test('rendering form to create gitSync repo', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <GitSyncRepoForm
          {...pathParams}
          isEditMode={false}
          isNewUser={true}
          gitSyncRepoInfo={undefined}
          onSuccess={noop}
          onClose={noop}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('Select your Git Provider')).toBeTruthy()
    })
    expect(container).toMatchSnapshot()

    // All required validation test
    await act(async () => {
      fireEvent.click(getByText('Save'))
    })

    expect(container).toMatchSnapshot()
  })
})
