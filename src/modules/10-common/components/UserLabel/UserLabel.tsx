import React from 'react'
import { Icon } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import cx from 'classnames'

import css from './UserLabel.module.scss'

export interface UserLabelProps {
  name: string
  profilePictureUrl?: string // for future use
  className?: string
  iconProps?: Omit<IconProps, 'name'>
}

export function UserLabel(props: UserLabelProps): React.ReactElement {
  const { name, className, iconProps } = props

  return (
    <div className={cx(css.userLabel, className)}>
      <Icon name="user" size={18} {...iconProps} />
      <span>{name}</span>
    </div>
  )
}
