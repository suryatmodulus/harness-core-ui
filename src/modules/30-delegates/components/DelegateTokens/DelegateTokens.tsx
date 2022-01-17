/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Layout,
  ExpandingSearchInput,
  PageError,
  shouldShowError,
  Checkbox,
  Button
} from '@wings-software/uicore'
import { PageSpinner } from '@common/components'

import { useStrings } from 'framework/strings'
import { useGetDelegateTokens, GetDelegateTokensQueryParams } from 'services/portal'

import { useCreateTokenModal } from './modals/useCreateTokenModal'

import DelegateTokensList from './DelegateTokensList'

import css from './DelegateTokens.module.scss'

export const DelegateListing: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const [showRevoked, setShowRevoked] = useState<boolean>(false)
  const [searchString, setSearchString] = useState<string>('')

  const {
    data: tokensResponse,
    refetch: getDelegateTokens,
    error: tokenFetchError,
    loading: showLoader
  } = useGetDelegateTokens({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      status: 'ACTIVE'
    }
  })

  const getTokens = () => {
    const queryParams = {
      accountId,
      projectIdentifier,
      orgIdentifier
    } as GetDelegateTokensQueryParams
    if (!showRevoked) {
      queryParams.status = 'ACTIVE'
    }
    getDelegateTokens({
      queryParams
    })
  }

  const { openCreateTokenModal } = useCreateTokenModal({ onSuccess: getTokens })

  const filteredTokens = useMemo(
    () => tokensResponse?.resource?.filter(token => token?.name?.includes(searchString)) || [],
    [tokensResponse?.resource, searchString]
  )

  useEffect(() => {
    getTokens()
  }, [showRevoked])

  if (showLoader) {
    return (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <PageSpinner />
      </div>
    )
  }

  if (tokenFetchError && shouldShowError(tokenFetchError)) {
    return (
      <PageError
        message={(tokenFetchError?.data as Error)?.message || tokenFetchError?.message}
        onClick={() => {
          getTokens()
        }}
      />
    )
  }

  return (
    <Container height="100%">
      <Layout.Horizontal className={css.header}>
        <Button
          intent="primary"
          text={getString('rbac.token.createLabel')}
          icon="plus"
          onClick={() => openCreateTokenModal()}
          id="newDelegateBtn"
          data-testid="newDelegateButton"
        />
        <Layout.Horizontal>
          <Checkbox
            onChange={() => {
              setShowRevoked(!showRevoked)
            }}
            checked={showRevoked}
            large
            label={getString('delegates.tokens.showRevoked')}
            className={css.revokeCheckbox}
          />
          <ExpandingSearchInput
            alwaysExpanded
            width={250}
            placeholder={getString('search')}
            throttle={200}
            onChange={text => {
              setSearchString(text)
            }}
            className={css.search}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>

      <Layout.Vertical className={css.listBody}>
        <Container className={css.delegateListContainer}>
          <DelegateTokensList delegateTokens={filteredTokens} onRevokeSuccess={getTokens} />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
export default DelegateListing
