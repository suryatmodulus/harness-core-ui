import React from 'react'
import { render, fireEvent, findByText, waitFor } from '@testing-library/react'
import { GitSyncTestWrapper } from '@gitsync/common/gitSyncTestUtils'
import GitSyncRepoTab from '../GitSyncRepoTab'

const createGitSynRepo = jest.fn()

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => Promise.resolve([]))
}))

describe('Git Sync - repo tab', () => {
  test('rendering landing list view', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <GitSyncRepoTab />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText('https://www.github.com/testRepo.git')).toBeTruthy()
    })

    expect(container).toMatchSnapshot()
  })

  test('test for opening add repo modal in list view', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <GitSyncRepoTab />
      </GitSyncTestWrapper>
    )
    const addRepoBtn = document.getElementById('newRepoBtn')
    expect(addRepoBtn).toBeTruthy()
    fireEvent.click(addRepoBtn!)
    const addRepoModal = document.getElementsByClassName('bp3-dialog')[0]
    await waitFor(() => findByText(addRepoModal as HTMLElement, 'selectGitProvider'))
    expect(container).toMatchSnapshot()
  })
})
