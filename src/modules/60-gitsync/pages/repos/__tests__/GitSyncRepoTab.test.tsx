import React from 'react'
import { render, fireEvent, findByText, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GitSyncRepoTab from '../GitSyncRepoTab'

import gitSyncListResponse from './mockData/gitSyncRepoListMock.json'

const createGitSynRepo = jest.fn()

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitSyncListResponse, loading: false }
  }),
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => Promise.resolve([]))
}))

describe('Git Sync - repo tab', () => {
  test('rendering landing list view', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <GitSyncRepoTab />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('Wings/githubRepo')).toBeTruthy()
    })

    expect(container).toMatchSnapshot()
  })

  test('test for opening add repo modal in list view', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <GitSyncRepoTab />
      </TestWrapper>
    )
    const addRepoBtn = document.getElementById('newRepoBtn')
    expect(addRepoBtn).toBeTruthy()
    fireEvent.click(addRepoBtn!)
    const addRepoModal = document.getElementsByClassName('bp3-dialog')[0]
    await waitFor(() => findByText(addRepoModal as HTMLElement, 'Select your Git Provider'))
    expect(container).toMatchSnapshot()
  })
})
