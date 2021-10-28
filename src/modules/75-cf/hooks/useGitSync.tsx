import { useParams } from 'react-router-dom'
import * as yup from 'yup'
import type { ObjectSchema } from 'yup'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { GitRepo, useGetGitRepo, usePatchGitRepo } from 'services/cf'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'

export interface GitDetails {
  branch: string
  filePath: string
  repoIdentifier: string
  rootFolder: string
  commitMsg: string
}
export interface GitSyncFormValues {
  gitDetails: GitDetails
  autoCommit: boolean
}
interface GitSyncFormMeta {
  gitSyncInitialValues: GitSyncFormValues
  gitSyncValidationSchema: ObjectSchema<Record<string, unknown> | undefined>
}

export interface UseGitSync {
  gitRepoDetails?: GitRepo
  isAutoCommitEnabled: boolean
  isGitSyncEnabled: boolean
  gitSyncLoading: boolean
  handleAutoCommit: (newAutoCommitValue: boolean) => Promise<void>
  getGitSyncFormMeta: (autoCommitMessage?: string) => GitSyncFormMeta
}

export const useGitSync = (): UseGitSync => {
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

  const isGitSyncEnabled = !!(FF_GITSYNC && getGitRepo?.data?.repoSet)

  const isAutoCommitEnabled = !!(isGitSyncEnabled && getGitRepo?.data?.repoDetails?.autoCommit)

  const getGitSyncFormMeta = (autoCommitMessage?: string): GitSyncFormMeta => ({
    gitSyncInitialValues: {
      gitDetails: {
        branch: getGitRepo?.data?.repoDetails?.branch || '',
        filePath: getGitRepo?.data?.repoDetails?.filePath || '',
        repoIdentifier: getGitRepo?.data?.repoDetails?.repoIdentifier || '',
        rootFolder: getGitRepo?.data?.repoDetails?.rootFolder || '',
        commitMsg:
          isAutoCommitEnabled && autoCommitMessage
            ? getString('cf.gitSync.autoCommitMsg', {
                msg: autoCommitMessage
              })
            : ''
      },
      autoCommit: isAutoCommitEnabled
    },
    gitSyncValidationSchema: yup.object().shape({
      commitMsg: isGitSyncEnabled ? yup.string().required(getString('cf.gitSync.commitMsgRequired')) : yup.string()
    })
  })

  const handleAutoCommit = async (newAutoCommitValue: boolean): Promise<void> => {
    if (newAutoCommitValue && isAutoCommitEnabled !== newAutoCommitValue) {
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
      await getGitRepo.refetch()
    }
  }

  return {
    gitRepoDetails: getGitRepo?.data?.repoDetails,
    isAutoCommitEnabled,
    isGitSyncEnabled,
    gitSyncLoading: getGitRepo?.loading || patchGitRepo.loading,
    handleAutoCommit,
    getGitSyncFormMeta
  }
}
