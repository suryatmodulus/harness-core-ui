import React, { useState } from 'react'
import { Layout, Container, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { supportedProducts } from './EntityHelper'
import EntitiesPreview from './EntitiesPreview'
import i18n from './GitSyncEntityTab.i18n'
import css from './GitSyncEntity.module.scss'

const GitSyncEntityTab: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState(supportedProducts[0].id)

  return (
    <Layout.Horizontal className={css.bodyContainer}>
      <Layout.Vertical
        className={css.productMenu}
        padding={{ top: 'small', right: 'xlarge', bottom: 'xsmall', left: 'xlarge' }}
        spacing="small"
      >
        <Text
          font={{ weight: 'bold', size: 'medium' }}
          margin={{ top: 'medium', right: 'medium', bottom: 'xlarge', left: 'medium' }}
          color={Color.DARK_600}
        >
          {i18n.heading.productMenu}
        </Text>
        {supportedProducts.map(data => {
          return (
            <Container
              margin="small"
              font={{ size: 'small' }}
              className={cx({ [css.activeTag]: selectedProduct === data.id }, css.tags)}
              key={data.id}
              onClick={() => {
                setSelectedProduct(data.id)
              }}
            >
              {data.title}
            </Container>
          )
        })}
      </Layout.Vertical>
      <EntitiesPreview selectedProduct={selectedProduct} />
    </Layout.Horizontal>
  )
}

export default GitSyncEntityTab
