import React from 'react'
import { Icon, Layout, Text, IconName, FlexExpander } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import type { FontSize } from '@wings-software/uicore/dist/styled-props/font/FontProps'
import cx from 'classnames'
import css from './CustomMenu.module.scss'

interface CustomMenuItemProps {
  text: string
  iconName?: string
  onClick?: () => void
  fontSize?: FontSize
  hidePopoverOnClick?: boolean
  rightIcon?: IconName
}

const CustomMenuItem: React.FC<CustomMenuItemProps> = ({
  text,
  iconName,
  onClick,
  fontSize,
  hidePopoverOnClick,
  rightIcon
}) => {
  return (
    <Layout.Horizontal
      padding={{
        left: 'medium',
        right: 'medium',
        top: 'small',
        bottom: 'small'
      }}
      spacing="medium"
      onClick={onClick}
      className={cx(css.customMenuContainer, { [Classes.POPOVER_DISMISS]: hidePopoverOnClick }, 'custom-menu-item')}
    >
      {iconName ? <Icon name={iconName as IconName} size={20} /> : null}
      <Text font={fontSize ? fontSize : 'small'}>{text}</Text>
      <FlexExpander />
      {rightIcon ? <Icon name={rightIcon} /> : null}
    </Layout.Horizontal>
  )
}

export default CustomMenuItem
