import { ButtonProps, Button, Color, Heading, Container, Icon, Layout, IconName } from '@wings-software/uicore'
import React from 'react'

export interface NoDataCardProps {
  icon: IconName
  iconSize?: number
  noIconColor?: boolean
  message: string
  width?: number
  buttonText?: string
  buttonWidth?: number
  onClick?: ButtonProps['onClick']
  className?: string
  buttonDisabled?: boolean
}

export const NoDataCard: React.FC<NoDataCardProps> = props => {
  // there are icons to which color prop shouldn't be passed to
  // as it brokes complex svg gradients and a
  // simple ternary condition doesn't work
  const iconProps: { name: IconName; size: number; color?: string } = {
    name: props.icon,
    size: props.iconSize || 48,
    color: Color.GREY_400
  }
  if (props.noIconColor) {
    delete iconProps.color
  }
  return (
    <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
      <Layout.Vertical
        spacing="medium"
        width={props?.width || 470}
        style={{ alignItems: 'center', marginTop: '-48px' }}
        className={props.className}
      >
        <Icon {...iconProps} />
        <Heading level={2} font={{ align: 'center' }} color={Color.GREY_500}>
          {props.message}
        </Heading>
        {props.buttonText ? (
          <Button
            intent="primary"
            text={props.buttonText}
            width={props.buttonWidth}
            onClick={props.onClick}
            disabled={typeof props.buttonDisabled !== undefined && props.buttonDisabled}
          />
        ) : null}
      </Layout.Vertical>
    </Container>
  )
}
