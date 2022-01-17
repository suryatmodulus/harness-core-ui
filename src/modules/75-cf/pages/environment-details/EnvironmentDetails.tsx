/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Container, PageError } from '@wings-software/uicore'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cf/utils/CFUtils'
import CFEnvironmentDetailsHeader from './EnvironmentDetailsHeader'
import CFEnvironmentDetailsBody from './EnvironmentDetailsBody'

const EnvironmentDetails: React.FC = () => {
  const { getString } = useStrings()
  const { projectIdentifier, environmentIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()

  const { loading, data, error, refetch } = useSyncedEnvironment({
    accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier
  })
  const environment = data?.data as EnvironmentResponseDTO
  const hasData = Boolean(environment)

  useDocumentTitle(getString('environments'))

  return (
    <>
      {hasData && (
        <Layout.Vertical height="100vh" style={{ boxSizing: 'border-box', background: '#FDFDFD' }}>
          <CFEnvironmentDetailsHeader environment={environment} />
          <CFEnvironmentDetailsBody environment={environment} />
        </Layout.Vertical>
      )}
      {loading && (
        <Container
          style={{
            position: 'fixed',
            top: '144px',
            left: '290px',
            width: 'calc(100% - 290px)',
            height: 'calc(100% - 144px)'
          }}
        >
          <ContainerSpinner />
        </Container>
      )}
      {error && (
        <PageError
          message={getErrorMessage(error)}
          onClick={() => {
            refetch()
          }}
        />
      )}
    </>
  )
}

export default EnvironmentDetails
