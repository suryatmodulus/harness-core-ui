import React from 'react'
import classNames from 'classnames'
import type { DivAttributesProps } from '../common/props'
import css from './ExtendedPageBody.module.scss'

export interface ExtendedBodyProps extends DivAttributesProps {
  className?: string
}

const ExtendedBody: React.FC<ExtendedBodyProps> = props => {
  const { className, children, ...restProps } = props

  return (
    <div className={classNames(css.main, className)} {...restProps}>
      {children}
    </div>
  )
}

export default ExtendedBody
