import React from 'react'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import { PageSpinner } from '@common/components'
import ProviderCard from './ProviderCard/ProviderCard'
import css from './ProvidersGridView.module.scss'

interface ProvidersGridViewProps {
  providers: any
  data?: any
  loading?: boolean
  reloadPage?: () => Promise<void>
  gotoPage: (index: number) => void
  onDelete?: () => Promise<void>
  onEdit?: (provider: any) => Promise<void>
}

const ProvidersGridView: React.FC<ProvidersGridViewProps> = props => {
  const { loading, data, onEdit, gotoPage } = props

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
              renderItem={(provider: any) => (
                <ProviderCard
                  provider={provider?.connector}
                  onEdit={async () => onEdit && onEdit(provider)}
                  onDelete={props.onDelete}
                />
              )}
              keyOf={(provider: any) => provider.name}
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
