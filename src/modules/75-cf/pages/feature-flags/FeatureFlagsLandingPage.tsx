/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { PageSpinner } from '@wings-software/uicore'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetGitRepo } from 'services/cf'
import { useIsGitSyncEnabled } from 'services/cd-ng'
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

  if (gitRepo?.loading || isGitSyncEnabled.loading) {
    return <PageSpinner />
  }

  if (FF_GITSYNC && isGitSyncEnabled.data?.gitSyncEnabled && !gitRepo?.data?.repoSet) {
    return <SelectFlagGitRepoPage gitRepoRefetch={gitRepo?.refetch} />
  }

  return <FeatureFlagsPage />
}

export default FeatureFlagsLandingPage
