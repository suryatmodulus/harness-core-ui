import React from 'react'
import { Text } from '@wings-software/uicore'
import cx from 'classnames'

import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useStrings, StringKeys } from 'framework/exports'

import css from './ExecutionStatusLabel.module.scss'

export interface ExecutionStatusLabelProps {
  status?: ExecutionStatus
  className?: string
}

export default function ExecutionStatusLabel({
  status,
  className
}: ExecutionStatusLabelProps): React.ReactElement | null {
  const { getString } = useStrings()
  if (!status) return null

  return (
    <Text
      inline
      className={cx(css.status, css[status.toLowerCase() as keyof typeof css], className)}
      font={{ weight: 'bold', size: 'xsmall' }}
    >
      {getString(`executionStatus.${status}` as StringKeys /* TODO: fix this by using a map */)}
    </Text>
  )
}
