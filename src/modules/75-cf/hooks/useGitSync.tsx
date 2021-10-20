import { useParams } from 'react-router-dom'
import * as yup from 'yup'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetGitRepo, usePatchGitRepo } from 'services/cf'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'

export const AUTO_COMMIT_MESSAGES = {
  CREATED_FLAG: 'Created feature flag',
  TOGGLED_FLAG: 'Toggled feature flag',
  UPDATED_FLAG_DETAILS: 'Updated feature flag details',
  UPDATED_FLAG_RULES: 'Updated feature flag rules',
  UPDATED_FLAG_VARIATIONS: 'Updated feature flag variations',
  UPDATES_FLAG_PREREQS: 'Updated feature flag prerequisites',
  UPDATED_FLAG_TARGETS: 'Updated feature flag targets',
  DELETED_FLAG: 'Deleted feature flag'
}

const useGitSync = () => {
  // todo - types
  const { projectIdentifier, accountId, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()

  const getGitRepo = useGetGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier
    }
  })

  const patchGitRepo = usePatchGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier
    }
  })

  const FF_GITSYNC = useFeatureFlag(FeatureFlag.FF_GITSYNC)

  const isGitSyncEnabled = FF_GITSYNC && getGitRepo?.data?.repoSet

  const isAutoCommitEnabled = (isGitSyncEnabled && getGitRepo.data?.repoDetails?.autoCommit) || false

  const getGitSyncFormMeta = (autoCommitMessage?: string) => {
    return {
      gitSyncInitialValues: {
        branch: getGitRepo?.data?.repoDetails?.branch || '',
        filePath: getGitRepo?.data?.repoDetails?.filePath || '',
        repoIdentifier: getGitRepo?.data?.repoDetails?.repoIdentifier || '',
        rootFolder: getGitRepo?.data?.repoDetails?.rootFolder || '',
        commitMsg: isAutoCommitEnabled ? `[AUTO-COMMIT] : ${autoCommitMessage}` : ''
      },
      gitSyncValidationSchema: yup.object().shape({
        commitMsg: isGitSyncEnabled
          ? yup.string().required(getString('cf.creationModal.valueIsRequired')) // todo
          : yup.string()
      })
    }
  }

  // todo
  const getAutoCommitRequestValues = (commitMsg: string) => ({
    branch: getGitRepo?.data?.repoDetails?.branch,
    filePath: getGitRepo?.data?.repoDetails?.filePath,
    repoIdentifier: getGitRepo?.data?.repoDetails?.repoIdentifier,
    rootFolder: getGitRepo?.data?.repoDetails?.rootFolder,
    commitMsg
  })

  const handleAutoCommit = async (newAutoCommitValue: boolean): Promise<void> => {
    if (newAutoCommitValue && isAutoCommitEnabled != newAutoCommitValue) {
      const instruction = {
        instructions: [
          {
            kind: 'setAutoCommit',
            parameters: {
              autoCommit: newAutoCommitValue
            }
          }
        ]
      }

      await patchGitRepo.mutate(instruction)
    }
  }

  return {
    gitRepoDetails: getGitRepo?.data?.repoDetails,
    isAutoCommitEnabled,
    isGitSyncEnabled,
    gitSyncLoading: getGitRepo.loading || patchGitRepo.loading,
    gitSyncError: getGitRepo.error,
    handleAutoCommit,
    getAutoCommitRequestValues,
    getGitSyncFormMeta
  }
}

export default useGitSync
