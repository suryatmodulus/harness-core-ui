import React from 'react'
import { render, waitFor, RenderResult, queryByAttribute } from '@testing-library/react'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import GitFilters, { GitFiltersProps } from '../GitFilters'
import mockBranches from './branchStatusMock.json'

const filterChangeHandler = jest.fn()
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => fetchBranches())
}))

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Git filter test for repo and branch selecion', () => {
  const setup = (props?: Partial<GitFiltersProps>): RenderResult =>
    render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/resources/connectors"
        pathParams={pathParams}
      >
        <GitFilters defaultValue={{ repo: '', branch: '' }} onChange={filterChangeHandler} {...props} />
      </GitSyncTestWrapper>
    )

  const queryByNameAttribute = (name: string, container: HTMLElement): HTMLElement | null =>
    queryByAttribute('name', container, name)

  afterEach(() => {
    fetchBranches.mockReset()
  })

  test('rendering default filter', async () => {
    const { container } = setup()
    await waitFor(() => {
      const repoName = queryByNameAttribute('repo', container) as HTMLInputElement
      expect(repoName).toBeTruthy()
      expect(repoName.value).toEqual('common.gitSync.allRepositories')
      const branchName = queryByNameAttribute('branch', container) as HTMLInputElement
      expect(branchName).toBeTruthy()
      expect(branchName.value).toEqual('common.gitSync.defaultBranches')
      expect(branchName.disabled).toBeTruthy()
    })
    expect(filterChangeHandler).not.toBeCalled()
    expect(container).toMatchSnapshot()
  })
})
