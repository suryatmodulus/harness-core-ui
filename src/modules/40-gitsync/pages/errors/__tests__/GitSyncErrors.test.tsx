/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, waitFor, fireEvent, getAllByTestId, getByTestId } from '@testing-library/react'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import GitSyncErrors from '@gitsync/pages/errors/GitSyncErrors'
import {
  GIT_SYNC_ERROR_TEST_SCOPE,
  defaultQueryParams,
  commitViewData,
  mockData
} from '@gitsync/pages/errors/__tests__/mockData'

const useListGitToHarnessErrorsCommits = jest.fn()
const useListGitSyncErrors = jest.fn()
const refetch = jest.fn()
const listGitToHarnessErrorsForCommitPromise = jest.fn()
const mockDataWithRefetch = { ...mockData, refetch }

jest.mock('services/cd-ng', () => ({
  useListGitToHarnessErrorsCommits: (...args: any[]) => {
    useListGitToHarnessErrorsCommits(args)
    return { ...commitViewData, refetch }
  },
  useListGitSyncErrors: (...args: any[]) => {
    useListGitSyncErrors(args)
    return mockDataWithRefetch
  },
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return mockDataWithRefetch
  }),
  useGetGitSyncErrorsCount: jest.fn().mockImplementation(() => {
    return mockDataWithRefetch
  }),
  listGitToHarnessErrorsForCommitPromise: () => {
    listGitToHarnessErrorsForCommitPromise()
    return Promise.resolve()
  }
}))

describe('GitSyncErrors', () => {
  test('should fetch commit errors', async () => {
    render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{
          accountId: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
          orgIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.orgIdentifier,
          projectIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.projectIdentifier
        }}
      >
        <GitSyncErrors />
      </GitSyncTestWrapper>
    )

    expect(useListGitToHarnessErrorsCommits).toHaveBeenCalledWith(defaultQueryParams)
    expect(useListGitSyncErrors).not.toHaveBeenCalled()
  })

  test('should render correct data', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{
          accountId: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
          orgIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.orgIdentifier,
          projectIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.projectIdentifier
        }}
      >
        <GitSyncErrors />
      </GitSyncTestWrapper>
    )

    const gitSyncErrorMessage = getAllByTestId(container, 'gitSyncErrorMessage')

    expect(gitSyncErrorMessage.length).toBe(2)

    commitViewData.data.data?.content?.map((data, index) => {
      const title = getByTestId(gitSyncErrorMessage[index], 'gitSyncErrorTitle').textContent
      const count = getByTestId(gitSyncErrorMessage[index], 'gitSyncErrorCount').textContent
      const repo = getByTestId(gitSyncErrorMessage[index], 'gitSyncErrorIconValueRepo').textContent
      const branch = getByTestId(gitSyncErrorMessage[index], 'gitSyncErrorIconValueBranch').textContent
      const commitId = getByTestId(gitSyncErrorMessage[index], 'gitSyncErrorIconValueCommitId').textContent
      const timestamp = getByTestId(gitSyncErrorMessage[index], 'gitSyncErrorTimestamp').getAttribute('data-value')
      const gitSyncErrorMessageItem = getAllByTestId(gitSyncErrorMessage[index], 'gitSyncErrorMessageItem')

      expect(title).toBe(data.commitMessage)
      expect(count).toBe(data.failedCount?.toString())
      expect(repo).toBe(data.repoId)
      expect(branch).toBe(data.branchName)
      expect(commitId).toBe(data.gitCommitId)
      expect(timestamp).toBe(data.createdAt?.toString())
      expect(gitSyncErrorMessageItem.length).toBe(data.errorsForSummaryView?.length)

      data.errorsForSummaryView?.map((messageItem, messageItemIndex) => {
        const messageItemTitle = getByTestId(
          gitSyncErrorMessageItem[messageItemIndex],
          'gitSyncErrorMessageItemTitle'
        ).textContent
        const messageItemReason = getByTestId(
          gitSyncErrorMessageItem[messageItemIndex],
          'gitSyncErrorMessageItemReason'
        ).textContent
        expect(messageItemTitle).toBe(messageItem.completeFilePath)
        expect(messageItemReason).toBe(messageItem.failureReason)
      })
    })
  })

  test('should call api with updated params', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{
          accountId: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
          orgIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.orgIdentifier,
          projectIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.projectIdentifier
        }}
      >
        <GitSyncErrors />
      </GitSyncTestWrapper>
    )

    const testSearchValue = 'test search value'

    expect(useListGitToHarnessErrorsCommits).toHaveBeenCalledWith(defaultQueryParams)

    const gitSyncErrorsTabContainer = getByTestId(container, 'gitSyncErrorsTabContainer')
    const searchInput = gitSyncErrorsTabContainer.querySelector('input[type="search"]')

    fireEvent.change(searchInput!, { target: { value: testSearchValue } })
    await waitFor(() => {
      expect(useListGitToHarnessErrorsCommits).toHaveBeenCalledWith([
        {
          queryParams: {
            ...defaultQueryParams[0].queryParams,
            searchTerm: testSearchValue
          }
        }
      ])
    })
  })

  test('should call correct apis', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{
          accountId: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
          orgIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.orgIdentifier,
          projectIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.projectIdentifier
        }}
      >
        <GitSyncErrors />
      </GitSyncTestWrapper>
    )

    expect(useListGitToHarnessErrorsCommits).toHaveBeenCalledWith(defaultQueryParams)
    expect(useListGitSyncErrors).not.toHaveBeenCalled()

    const fileViewToggle = container.querySelector('[data-name="toggle-option-two"]')
    fireEvent.click(fileViewToggle!)

    await waitFor(() => {
      expect(useListGitSyncErrors).toHaveBeenCalledWith([
        {
          queryParams: {
            ...defaultQueryParams[0].queryParams,
            gitToHarness: true
          }
        }
      ])
    })

    const connectivityView = container.querySelector('[data-tab-id="CONNECTIVITY_ERRORS"]')
    fireEvent.click(connectivityView!)

    await waitFor(() => {
      expect(useListGitSyncErrors).toHaveBeenCalledWith([
        {
          queryParams: {
            ...defaultQueryParams[0].queryParams,
            gitToHarness: false
          }
        }
      ])
    })
  })

  test('should render see more and call api to fetch files for particular commit', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{
          accountId: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
          orgIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.orgIdentifier,
          projectIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.projectIdentifier
        }}
      >
        <GitSyncErrors />
      </GitSyncTestWrapper>
    )

    const seeMore = getByTestId(container, 'seeMore')
    expect(seeMore).toBeTruthy()

    expect(listGitToHarnessErrorsForCommitPromise).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.click(seeMore)
    })

    expect(listGitToHarnessErrorsForCommitPromise).toHaveBeenCalled()
  })
})
