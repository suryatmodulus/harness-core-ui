/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import { PageSpinner } from '@common/components'
import type { GitopsProviderResponse, PageGitopsProviderResponse } from 'services/cd-ng'
import ProviderCard from '../ProviderCard/ProviderCard'
import css from './ProvidersGridView.module.scss'

interface ProvidersGridViewProps {
  data?: PageGitopsProviderResponse
  loading?: boolean
  reloadPage?: () => Promise<void>
  gotoPage: (index: number) => void
  onDelete?: (provider: GitopsProviderResponse) => Promise<void>
  onEdit?: (provider: GitopsProviderResponse) => Promise<void>
}

const ProvidersGridView: React.FC<ProvidersGridViewProps> = props => {
  const { loading, data, onEdit, onDelete, gotoPage } = props

  return (
    <>
      {loading ? (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      ) : (
        <>
          <Container className={css.masonry}>
            <Layout.Masonry
              center
              gutter={25}
              items={data?.content || []}
              renderItem={provider => (
                <ProviderCard
                  provider={provider}
                  onEdit={async () => onEdit && onEdit(provider)}
                  onDelete={async () => onDelete && onDelete(provider)}
                />
              )}
              keyOf={provider => provider.identifier}
            />
          </Container>

          <Container className={css.pagination}>
            <Pagination
              itemCount={data?.totalItems || 0}
              pageSize={data?.pageSize || 10}
              pageCount={data?.totalPages || 0}
              pageIndex={data?.pageIndex || 0}
              gotoPage={gotoPage}
            />
          </Container>
        </>
      )}
    </>
  )
}

export default ProvidersGridView
