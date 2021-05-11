import React from 'react'
import { ButtonProps, Button, Color, Heading, Container, Icon, Layout, IconName } from '@wings-software/uicore'
import classNames from 'classnames'
import { useStrings } from 'framework/strings'
import css from './NoDataCard.module.scss'
export interface NoDataCardProps {
  icon: IconName
  iconSize?: number
  noIconColor?: boolean
  message: string
  width?: number
  buttonText?: string
  buttonWidth?: number
  button?: React.ReactElement
  onClick?: ButtonProps['onClick']
  className?: string
  containerClassName?: string
  buttonDisabled?: boolean
}

export const NoDataCard: React.FC<NoDataCardProps> = props => {
  const { getString } = useStrings()

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
  const buttonDisabled = typeof props.buttonDisabled !== undefined && props.buttonDisabled
  return (
    <Container className={classNames(css.noDataCard, props.containerClassName)} flex={{ align: 'center-center' }}>
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
        {props.button ? (
          props.button
        ) : props.buttonText ? (
          <Button
            intent="primary"
            text={props.buttonText}
            width={props.buttonWidth}
            onClick={props.onClick}
            tooltip={buttonDisabled ? getString('noPermission') : undefined}
            disabled={buttonDisabled}
          />
        ) : null}
      </Layout.Vertical>
    </Container>
  )
}
