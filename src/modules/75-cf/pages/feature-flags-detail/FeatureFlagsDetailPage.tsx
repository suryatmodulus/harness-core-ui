import React, { ReactElement, useState } from 'react'
import { Layout, Container, PageError } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { GetFeatureFlagQueryParams, useGetFeatureFlag } from 'services/cf'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import FlagActivation from '@cf/components/FlagActivation/FlagActivation'
import FlagActivationDetails from '@cf/components/FlagActivation/FlagActivationDetails'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import GitSyncActions from '@cf/components/GitSyncActions/GitSyncActions'
import { useGitSync } from '@cf/hooks/useGitSync'
import css from './FeatureFlagsDetailPage.module.scss'

const FeatureFlagsDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const [skipLoading, setSkipLoading] = useState(false)
  const { orgIdentifier, projectIdentifier, featureFlagIdentifier, accountId } = useParams<Record<string, string>>()
  const { activeEnvironment } = useActiveEnvironment()

  useDocumentTitle(getString('featureFlagsText'))
  const queryParams = {
    project: projectIdentifier as string,
    environment: activeEnvironment,
    account: accountId,
    accountIdentifier: accountId,
    org: orgIdentifier
  } as GetFeatureFlagQueryParams

  const {
    data: featureFlag,
    loading,
    error,
    refetch
  } = useGetFeatureFlag({
    identifier: featureFlagIdentifier as string,
    queryParams
  })

  const gitSync = useGitSync()

  if ((loading || gitSync.gitSyncLoading) && !skipLoading) {
    return (
      <Container
        style={{
          position: 'fixed',
          top: 0,
          left: '290px',
          width: 'calc(100% - 290px)',
          height: 'calc(100% - 144px)',
          zIndex: 1
        }}
      >
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return (
      <PageError
        message={getErrorMessage(error)}
        onClick={() => {
          refetch()
        }}
      />
    )
  }

  const refetchFlag = async (): Promise<void> => {
    setSkipLoading(true)
    await refetch({
      queryParams: {
        ...queryParams,
        environment: activeEnvironment
      }
    }).finally(() => {
      setSkipLoading(false)
    })
  }

  const GitSyncActionsComponent = (): ReactElement => (
    <GitSyncActions
      isLoading={gitSync.gitSyncLoading}
      branch={gitSync.gitRepoDetails?.branch || ''}
      repository={gitSync.gitRepoDetails?.repoIdentifier || ''}
      isAutoCommitEnabled={gitSync.isAutoCommitEnabled}
      isGitSyncPaused={gitSync.isGitSyncPaused}
      handleToggleAutoCommit={gitSync.handleAutoCommit}
      handleGitPause={gitSync.handleGitPause}
    />
  )

  return (
    <Container flex height="100%">
      <Layout.Vertical className={css.flagContainer} width={450}>
        {featureFlag && (
          <FlagActivationDetails
            featureFlag={featureFlag}
            refetchFlag={refetch}
            gitSyncActionsComponent={gitSync?.isGitSyncActionsEnabled ? <GitSyncActionsComponent /> : undefined}
            gitSync={gitSync}
          />
        )}
      </Layout.Vertical>

      <Layout.Horizontal
        width="calc(100% - 450px + 20px)"
        height="100%"
        style={{ transform: 'translateX(-20px)', background: 'var(--white)' }}
      >
        <Layout.Vertical width="100%">
          {!loading && featureFlag && (
            <FlagActivation
              refetchFlag={refetchFlag}
              gitSync={gitSync}
              project={projectIdentifier as string}
              flagData={featureFlag}
            />
          )}
        </Layout.Vertical>
      </Layout.Horizontal>
    </Container>
  )
}

export default FeatureFlagsDetailPage
