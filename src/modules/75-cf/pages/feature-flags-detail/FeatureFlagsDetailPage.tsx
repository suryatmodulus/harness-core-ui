import React, { useState } from 'react'
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
import { useGitSync } from '@cf/hooks/useGitSync'
import css from './FeatureFlagsDetailPage.module.scss'

const FeatureFlagsDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const [skipLoading, setSkipLoading] = useState(false)
  const { orgIdentifier, projectIdentifier, featureFlagIdentifier, accountId } = useParams<Record<string, string>>()
  const { activeEnvironment } = useActiveEnvironment()
  const gitSync = useGitSync()

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

  if (loading && !skipLoading) {
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

  return (
    <Container flex height="100%">
      <Layout.Horizontal width={450} className={css.flagContainer}>
        <Layout.Vertical width="100%" className={css.flagActivationDetailsSection}>
          {featureFlag && <FlagActivationDetails featureFlag={featureFlag} refetchFlag={refetch} gitSync={gitSync} />}
        </Layout.Vertical>
      </Layout.Horizontal>

      <Layout.Horizontal
        width="calc(100% - 450px + 20px)"
        height="100%"
        style={{ transform: 'translateX(-20px)', background: 'var(--white)' }}
      >
        <Layout.Vertical width="100%">
          {!loading && featureFlag && (
            <FlagActivation
              gitSync={gitSync}
              refetchFlag={async () => {
                setSkipLoading(true)
                return refetch({
                  queryParams: {
                    ...queryParams,
                    environment: activeEnvironment
                  }
                }).finally(() => {
                  setSkipLoading(false)
                })
              }}
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
