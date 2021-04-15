import React from 'react'
import { Text, Link } from '@wings-software/uicore'
import css from './TitledInfo.module.scss'

export interface TitledInfoProps {
  title: string
  value: string | number | undefined
  href?: string
  className?: string
  maxWidth?: string
}

export const TitledInfo: React.FC<TitledInfoProps> = (props: TitledInfoProps) => {
  const { title, value, href, maxWidth, className, ...restProps } = props

  const style = { maxWidth: maxWidth ? maxWidth : '165px' }

  return (
    <div className={css.container} {...restProps}>
      <Text>{title || ''}</Text>
      {!href && <Text style={style}>{value && value.toString()}</Text>}
      {href && (
        <Link style={style} href={href}>
          {value && value.toString()}
        </Link>
      )}
    </div>
  )
}
