import type { Module } from '@common/interfaces/RouteInterfaces'
import type { GitSyncConfig } from 'services/cd-ng'
import * as pipelineService from 'services/pipeline-ng'
import { canEnableGitExperience, getEntityUrl, getExternalUrl } from '../gitSyncUtils'

const entity = {
  repoUrl: 'https://github.com/wings-software/sunnykesh-gitSync',
  folderPath: 'second/.harness/',
  branch: 'gitSync',
  entityGitPath: 'pipelineOne.yaml'
}

const canEnableGitExperienceParam = {
  projectIdentifier: 'p',
  orgIdentifier: 'o',
  accountId: 'a',
  module: 'cd' as Module
}

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

    test('valid entity url test', () => {
      const url = getEntityUrl(entity)
      expect(url).toBe(
        'https://github.com/wings-software/sunnykesh-gitSync/blob/gitSync/second/.harness/pipelineOne.yaml'
      )
    })

    test('Invalid entity url test', () => {
      expect(getEntityUrl({ ...entity, repoUrl: undefined })).toBe('')
      expect(getEntityUrl({ ...entity, folderPath: undefined })).toBe('')
      expect(getEntityUrl({ ...entity, branch: undefined })).toBe('')
      expect(getEntityUrl({ ...entity, entityGitPath: undefined })).toBe('')
    })

    test('Test for canEnableGitExperience without pipeline', async () => {
      jest
        .spyOn(pipelineService, 'getPipelineListPromise')
        .mockImplementation(() => Promise.resolve({ status: 'SUCCESS', data: { totalElements: 0 } }))

      const canEnable = await canEnableGitExperience(canEnableGitExperienceParam)
      expect(canEnable).toEqual(true)
    })

    test('Test for canEnableGitExperience with pipelines created', async () => {
      jest
        .spyOn(pipelineService, 'getPipelineListPromise')
        .mockImplementation(() => Promise.resolve({ status: 'SUCCESS', data: { totalElements: 1 } }))
      const canEnable = await canEnableGitExperience(canEnableGitExperienceParam)
      expect(canEnable).toEqual(false)
    })
  })
})
