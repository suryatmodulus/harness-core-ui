import { Color, Text, Icon, Layout, Button, ButtonProps, Container } from '@wings-software/uicore'
import React from 'react'
import { useStrings } from 'framework/exports'

export interface PageErrorProps {
  message?: string
  width?: number
  className?: string
  onClick?: ButtonProps['onClick']
}

export const PageError: React.FC<PageErrorProps> = props => {
  const { getString } = useStrings()
  return (
    <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
      <Layout.Vertical
        spacing="medium"
        width={props?.width || 500}
        style={{ alignItems: 'center' }}
        className={props.className}
      >
        <Icon name="error" size={32} color={Color.RED_500} />
        <Text font={{ align: 'center' }} color={Color.RED_500}>
          {props.message || getString('common.generalError')}
        </Text>
        {props.onClick && <Button intent="primary" text={getString('common.retry')} onClick={props.onClick} />}
      </Layout.Vertical>
    </Container>
  )
}
