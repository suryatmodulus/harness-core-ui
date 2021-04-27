import { Color, Text, Icon, Layout, Container } from '@wings-software/uicore'
import React from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import css from './PageSpinner.module.scss'

export interface PageSpinnerProps {
  message?: string
  width?: number
  className?: string
  fixed?: boolean
}

export const PageSpinner: React.FC<PageSpinnerProps> = props => {
  const { getString } = useStrings()
  return (
    <Container className={cx(css.spinner, { [css.fixed]: props.fixed })} flex={{ align: 'center-center' }}>
      <Layout.Vertical
        spacing="medium"
        width={props?.width || 500}
        style={{ alignItems: 'center' }}
        className={cx(props.className, css.content)}
      >
        <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
        <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
          {props.message || getString('common.loading')}
        </Text>
      </Layout.Vertical>
    </Container>
  )
}
