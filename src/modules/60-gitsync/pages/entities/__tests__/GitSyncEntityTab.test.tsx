import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import GitSyncEntityTab from '../GitSyncEntityTab'
import mockData from './mockData/entitiesMockResponse.json'

const fetchEntities = jest.fn().mockImplementation(() => Promise.resolve(mockData))

jest.mock('services/cd-ng', () => ({
  useListGitSyncEntitiesSummaryForRepoAndTypes: jest.fn().mockImplementation(() => ({ mutate: fetchEntities }))
}))

const mockRepoName = 'gitSyncRepo'

describe('Git Sync - entity tab', () => {
  test('rendering landing view', async () => {
    const { getByText, container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <GitSyncEntityTab />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText(mockRepoName)).toBeTruthy()
    })

    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(getByText(mockRepoName))
    })

    expect(container).toMatchSnapshot()
  })
})
