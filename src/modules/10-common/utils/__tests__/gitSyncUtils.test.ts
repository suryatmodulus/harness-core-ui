/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GitSyncConfig } from 'services/cd-ng'
import { getRepoDetailsByIndentifier } from '../gitSyncUtils'

describe('Test getRepoDetailsByIndentifier method', () => {
  let repos: GitSyncConfig[] = []
  beforeEach(() => {
    repos = [
      {
        branch: 'feature',
        repo: 'https://github.com/testing/somerepo',
        gitConnectorType: 'Github',
        identifier: 'repo1'
      },
      {
        branch: 'feature',
        repo: 'https://github.com/testing/somerepo',
        gitConnectorType: 'Github',
        identifier: 'repo2'
      }
    ]
  })
  test('should return correct repo object', () => {
    const repoObj = getRepoDetailsByIndentifier('repo2', repos)
    expect(repoObj).toBe(repos[1])
  })
  test('should return undefined when identifier is passed as undefined', () => {
    const repoObj = getRepoDetailsByIndentifier(undefined, repos)
    expect(repoObj).toBe(undefined)
  })
})
