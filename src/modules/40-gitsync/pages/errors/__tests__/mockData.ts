/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageGitSyncErrorAggregateByCommitDTO } from 'services/cd-ng'

export const GIT_SYNC_ERROR_TEST_SCOPE = {
  accountId: 'dummyAccountId',
  orgIdentifier: 'dummyOrgIdentifier',
  projectIdentifier: 'dummyProjectIdentifier'
}

export const defaultQueryParams = [
  {
    queryParams: {
      accountIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
      orgIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.orgIdentifier,
      projectIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.projectIdentifier,
      branch: '',
      pageIndex: 0,
      pageSize: 10,
      repoIdentifier: '',
      searchTerm: ''
    }
  }
]

export const commitViewData: { loading: boolean; error: boolean; data: ResponsePageGitSyncErrorAggregateByCommitDTO } =
  {
    loading: false,
    error: false,
    data: {
      data: {
        content: [
          {
            branchName: 'branch1',
            commitMessage: 'commit message 1',
            createdAt: new Date().getTime() - 24 * 60 * 60 * 1000,
            errorsForSummaryView: [
              {
                accountIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
                branchName: 'branch1',
                changeType: 'ADD',
                completeFilePath: 'filePath1',
                createdAt: new Date().getTime() - 24 * 60 * 60 * 1000,
                entityType: 'Projects',
                errorType: 'GIT_TO_HARNESS',
                failureReason: 'failure reason 1',
                repoId: 'repo1',
                repoUrl: 'repoUrl1',
                status: 'ACTIVE'
              },
              {
                accountIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
                branchName: 'branch2',
                changeType: 'ADD',
                completeFilePath: 'filePath2',
                createdAt: new Date().getTime() - 24 * 60 * 60 * 1000,
                entityType: 'Projects',
                errorType: 'GIT_TO_HARNESS',
                failureReason: 'failure reason 2',
                repoId: 'repo2',
                repoUrl: 'repoUrl2',
                status: 'ACTIVE'
              }
            ],
            failedCount: 10,
            gitCommitId: 'commit1',
            repoId: 'repo1'
          },
          {
            branchName: 'branch2',
            commitMessage: 'commit message 2',
            createdAt: new Date().getTime() - 24 * 60 * 60 * 2000,
            errorsForSummaryView: [
              {
                accountIdentifier: GIT_SYNC_ERROR_TEST_SCOPE.accountId,
                branchName: 'branch3',
                changeType: 'ADD',
                completeFilePath: 'filePath3',
                createdAt: new Date().getTime() - 24 * 60 * 60 * 2000,
                entityType: 'Projects',
                errorType: 'GIT_TO_HARNESS',
                failureReason: 'failure reason 3',
                repoId: 'repo1',
                repoUrl: 'repoUrl3',
                status: 'ACTIVE'
              }
            ],
            failedCount: 1,
            gitCommitId: 'commit3',
            repoId: 'repo2'
          }
        ],
        empty: false,
        pageIndex: 0,
        pageItemCount: 10,
        pageSize: 10,
        totalItems: 100,
        totalPages: 10
      }
    }
  }

export const mockData = {
  loading: false,
  error: null,
  data: []
}
