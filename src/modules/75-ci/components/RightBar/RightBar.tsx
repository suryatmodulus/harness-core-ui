import React from 'react'
import classNames from 'classnames'
import { Button, Icon } from '@wings-software/uicore'
import css from './RightBar.module.scss'

export interface RightBarProps {
  className?: string
}

const RightBar: React.FC<RightBarProps> = props => {
  const { className } = props

  return (
    <div className={classNames(css.main, className)}>
      <Button minimal>
        <Icon name="main-search" />
      </Button>
      <Button minimal>
        <Icon name="properties" />
      </Button>
    </div>
  )
}

export default RightBar
