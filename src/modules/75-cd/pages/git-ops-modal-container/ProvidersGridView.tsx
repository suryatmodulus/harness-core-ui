import React from 'react'
import { Container, Layout } from '@wings-software/uicore'
import { PageSpinner } from '@common/components'
import ProviderCard from './ProviderCard/ProviderCard'
import css from './ProvidersGridView.module.scss'

interface ProvidersGridViewProps {
  providers: any
  data?: any
  loading?: boolean
  reloadPage?: () => Promise<void>
  gotoPage?: (index: number) => void
  onDelete?: () => Promise<void>
  onEdit?: (provider: any) => Promise<void>
}

const ProvidersGridView: React.FC<ProvidersGridViewProps> = props => {
  const { providers, loading, onEdit } = props
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
              gutter={10}
              items={providers || []}
              renderItem={(provider: any) => (
                <ProviderCard
                  provider={provider}
                  onEdit={async () => onEdit && onEdit(provider)}
                  onDelete={props.onDelete}
                />
              )}
              keyOf={(provider: any) => provider.name}
            />
          </Container>
        </>
      )}
    </>
  )
}

export default ProvidersGridView
