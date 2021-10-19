import { useParams } from 'react-router'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetGitRepo, usePatchGitRepo } from 'services/cf'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

const useGitSync = () => {
  // todo - types
  const { projectIdentifier, accountId, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()

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

  const toggleAutoCommit = async (autoCommit: boolean): Promise<void> => {
    const instruction = {
      instructions: [
        {
          kind: 'setAutoCommit',
          parameters: {
            autoCommit
          }
        }
      ]
    }

    await patchGitRepo.mutate(instruction)
  }

  const FF_GITSYNC = useFeatureFlag(FeatureFlag.FF_GITSYNC)

  const isGitSyncEnabled = FF_GITSYNC && getGitRepo?.data?.repoSet

  const isAutoCommitEnabled = isGitSyncEnabled && getGitRepo.data?.repoDetails?.autoCommit

  return {
    gitRepoDetails: getGitRepo?.data?.repoDetails,
    isAutoCommitEnabled,
    isGitSyncEnabled,
    gitSyncLoading: getGitRepo.loading || patchGitRepo.loading,
    gitSyncError: getGitRepo.error,
    toggleAutoCommit
  }
}

export default useGitSync
