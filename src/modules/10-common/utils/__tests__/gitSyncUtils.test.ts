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
