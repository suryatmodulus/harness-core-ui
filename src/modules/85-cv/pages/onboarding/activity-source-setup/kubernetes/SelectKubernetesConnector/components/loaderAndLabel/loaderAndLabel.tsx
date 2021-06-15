import React from 'react'
import { Text, Icon } from '@wings-software/uicore'
import { STATUSMAP } from './loaderAndLabel.constant'
import css from './loaderAndLabel.module.scss'

export default function LoaderAndLabel(status: string, message: string): JSX.Element {
  const { style, icon, testId } = STATUSMAP[status]
  return (
    <div className={css.main}>
      <Icon name={icon} size={16} color={style.icon} margin={{ right: 'small' }} />
      <Text data-testid={testId} color={style.label}>
        {message}
      </Text>
    </div>
  )
}
