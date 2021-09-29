import React from 'react'
import { useParams } from 'react-router-dom'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetGitRepo } from 'services/cf'
import { useIsGitSyncEnabled } from 'services/cd-ng'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import FeatureFlagsPage from './FeatureFlagsPage'
import SelectFlagGitRepoPage from './SelectFlagGitRepoPage'

const FeatureFlagsLandingPage: React.FC = () => {
  const { projectIdentifier, accountId, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const FF_GITSYNC = useFeatureFlag(FeatureFlag.FF_GITSYNC)
  const isGitSyncEnabled = useIsGitSyncEnabled({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })
  const gitRepo = useGetGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier
    }
  })

  if (gitRepo.loading || isGitSyncEnabled.loading) {
    return <PageSpinner />
  }

  if (!FF_GITSYNC || !isGitSyncEnabled.data?.gitSyncEnabled || gitRepo.data?.repoSet) {
    return <FeatureFlagsPage />
  }

  return <SelectFlagGitRepoPage gitRepoRefetch={gitRepo.refetch} />
}

export default FeatureFlagsLandingPage
