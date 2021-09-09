import React from 'react'
import { Color, Icon, Layout, Text } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import cx from 'classnames'

import { Popover, PopoverInteractionKind, Position, Classes } from '@blueprintjs/core'
import css from './UserLabel.module.scss'

export interface UserLabelProps {
  name: string
  email?: string
  profilePictureUrl?: string // for future use
  className?: string
  iconProps?: Omit<IconProps, 'name'>
}

const handleClickOnPopoverContent = (e: React.MouseEvent<HTMLElement, MouseEvent>) => e.stopPropagation()

export function UserLabel(props: UserLabelProps): React.ReactElement {
  const { name, email, className, iconProps } = props

  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      popoverClassName={Classes.DARK}
      position={Position.BOTTOM_LEFT}
      content={
        <Layout.Horizontal
          padding="medium"
          height="inherit"
          flex={{ align: 'center-center' }}
          onClick={handleClickOnPopoverContent}
        >
          <Icon name="user" size={36} />
          <Layout.Vertical className={css.rightSection}>
            <Text font={{ weight: 'bold' }} color={Color.WHITE}>
              {name}
            </Text>
            {email ? (
              <Text font={{ size: 'small' }} color={Color.PRIMARY_5}>
                {email}
              </Text>
            ) : null}
          </Layout.Vertical>
        </Layout.Horizontal>
      }
    >
      <div className={cx(css.userLabel, className)}>
        <Icon name="user" size={18} {...iconProps} />
        <span>{name}</span>
      </div>
    </Popover>
  )
}
