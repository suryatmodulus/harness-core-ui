import * as yup from 'yup'
import type { UseGitSync } from '@cf/hooks/useGitSync'

const mockGitSync: UseGitSync = {
  gitRepoDetails: {
    autoCommit: false,
    branch: 'main',
    filePath: '/flags.yaml',
    objectId: '',
    repoIdentifier: 'harnesstest',
    rootFolder: '/.harness/'
  },
  isAutoCommitEnabled: false,
  isGitSyncEnabled: true,
  gitSyncLoading: false,
  handleGitPause: jest.fn(),
  isGitSyncActionsEnabled: true,
  isGitSyncPaused: false,
  apiError: '',
  handleError: jest.fn(),
  handleAutoCommit: jest.fn(),
  getGitSyncFormMeta: jest.fn(() => ({
    gitSyncInitialValues: {
      gitDetails: {
        commitMsg: '',
        branch: 'main',
        filePath: '/flags.yaml',
        repoIdentifier: 'harnesstest',
        rootFolder: '/.harness/'
      },
      autoCommit: false
    },
    gitSyncValidationSchema: yup.object().shape({
      commitMsg: yup.string()
    })
  }))
}

export default mockGitSync
