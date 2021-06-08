import React from 'react'
import { Color, Layout, Icon, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './ModuleRenderer.module.scss'

const DefaultRenderer: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical
      padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'large' }}
      border={{ top: true, bottom: true, color: Color.GREY_250 }}
      className={css.started}
    >
      <Text font={{ size: 'small', weight: 'semi-bold' }} padding={{ bottom: 'xsmall' }}>
        {getString('moduleRenderer.start')}
      </Text>
      <Layout.Horizontal spacing="small">
        <Icon name="cd-main" size={20} className={css.grayOutIcons} />
        <Icon name="cv-main" size={20} className={css.grayOutIcons} />
        <Icon name="ce-main" size={20} className={css.grayOutIcons} />
        <Icon name="cf-main" size={20} className={css.grayOutIcons} />
        <Icon name="ci-main" size={20} className={css.grayOutIcons} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default DefaultRenderer
