import React, { ReactElement } from 'react'
import cx from 'classnames'
import { HarnessDocTooltip } from '@wings-software/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import css from './StringWithTooltip.module.scss'

export interface StringWithTooltipProps {
  stringId: StringKeys
  tooltipId: string
  className?: string
}

const StringWithTooltip = ({
  stringId,
  tooltipId,
  className = '',
  ...otherProps
}: StringWithTooltipProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <span className={cx(css.align, className)} {...otherProps} data-tooltip-id={tooltipId}>
      {getString(stringId)}
      <HarnessDocTooltip tooltipId={tooltipId} useStandAlone />
    </span>
  )
}

export default StringWithTooltip
