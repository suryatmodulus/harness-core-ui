import React from 'react'
import classNames from 'classnames'
import type { DivAttributesProps } from '../common/props'
import css from './ExtendedPage.module.scss'

export interface ExtendedPageProps extends DivAttributesProps {
  className?: string
}

const ExtendedPage: React.FC<ExtendedPageProps> = props => {
  const { className, children, ...restProps } = props

  return (
    <div className={classNames(css.main, className)} {...restProps}>
      {children}
    </div>
  )
}

export default ExtendedPage
