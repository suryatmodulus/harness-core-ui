import type { GitSyncConfig } from 'services/cd-ng'
import { getExternalUrl } from '../gitSyncUtils'

describe('gitSyncUtils test', () => {
  describe('Test getExternalUrl method', () => {
    test('show return correct url', () => {
      const mockConfig = {
        branch: 'feature',
        repo: 'https://github.com/testing/somerepo',
        gitConnectorType: 'Github'
      } as GitSyncConfig
      const testFolderPath = 'samplefolder/.harness'
      const url = getExternalUrl(mockConfig, testFolderPath)
      expect(url).toBe(`${mockConfig.repo}/tree/${mockConfig.branch}/${testFolderPath}`)
    })
    test('empty url for no repo/url or empty branch', () => {
      const mockConfig = {
        branch: 'feature',
        repo: '',
        gitConnectorType: 'Github'
      } as GitSyncConfig
      const url = getExternalUrl(mockConfig, 'samplefolder/.harness')
      expect(url).toBe('')
    })
  })
})
