import React from 'react'
import { Container, Layout } from '@wings-software/uicore'
import ProviderCard from './ProviderCard/ProviderCard'
import css from './ProvidersGridView.module.scss'

interface ProvidersGridViewProps {
  providers: any
  reloadPage?: () => Promise<void>
  gotoPage?: (index: number) => void
}

const ProvidersGridView: React.FC<ProvidersGridViewProps> = props => {
  const { providers } = props

  return (
    <>
      <Container className={css.masonry}>
        <Layout.Masonry
          center
          gutter={10}
          items={providers || []}
          renderItem={(provider: any) => <ProviderCard provider={provider} />}
          keyOf={(provider: any) => provider.name}
        />
      </Container>
    </>
  )
}

export default ProvidersGridView
