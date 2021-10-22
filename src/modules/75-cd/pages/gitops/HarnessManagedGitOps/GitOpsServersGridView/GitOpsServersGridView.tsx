import React from 'react'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import { PageSpinner } from '@common/components'

import type { V1Agent, V1AgentList } from 'services/gitops'
import ProviderCard from '../GitOpsServerCard/GitOpsServerCard'
import css from './GitOpsServersGridView.module.scss'

interface ProvidersGridViewProps {
  data?: V1AgentList
  loading?: boolean
  reloadPage?: () => Promise<void>
  gotoPage: (index: number) => void
  onDelete?: (provider: V1Agent) => Promise<void>
  onEdit?: (provider: V1Agent) => Promise<void>
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
