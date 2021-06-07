import React from 'react'
import cx from 'classnames'
import { Icon, IconName } from '@wings-software/uicore'

import { StringKeys, useStrings } from 'framework/strings'

import { ExecutionLayoutState, useExecutionLayoutContext } from './ExecutionLayoutContext'

import css from './ExecutionLayout.module.scss'

export interface ExecutionLayoutToggleProps {
  className?: string
}

const iconNameMap: Record<ExecutionLayoutState, IconName> = {
  [ExecutionLayoutState.BOTTOM]: 'layout-bottom',
  [ExecutionLayoutState.FLOATING]: 'layout-float',
  [ExecutionLayoutState.RIGHT]: 'layout-right',
  [ExecutionLayoutState.MINIMIZE]: 'minus'
}

const labelMap: Record<ExecutionLayoutState, StringKeys> = {
  [ExecutionLayoutState.BOTTOM]: 'pipeline.execution.layouts.bottom',
  [ExecutionLayoutState.FLOATING]: 'pipeline.execution.layouts.float',
  [ExecutionLayoutState.RIGHT]: 'pipeline.execution.layouts.right',
  [ExecutionLayoutState.MINIMIZE]: 'pipeline.execution.layouts.minimize'
}

const layouts: ExecutionLayoutState[] = [
  ExecutionLayoutState.RIGHT,
  // ExecutionLayoutState.BOTTOM,
  ExecutionLayoutState.FLOATING,
  ExecutionLayoutState.MINIMIZE
]

export default function ExecutionLayoutToggle(props: ExecutionLayoutToggleProps): React.ReactElement {
  const { layout, setLayout } = useExecutionLayoutContext()
  const { getString } = useStrings()

  function handleViewChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const newLayout = e.target.value
    setLayout(newLayout as ExecutionLayoutState)
  }

  return (
    <div className={cx(css.toggle, props.className)}>
      {layouts.map(key => (
        <label key={key} className={css.label} title={getString(labelMap[key])}>
          <input type="radio" name="layout" value={key} onChange={handleViewChange} checked={layout === key} />
          <Icon name={iconNameMap[key]} />
        </label>
      ))}
    </div>
  )
}
