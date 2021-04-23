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

const stringsMap: Record<string, string> = {
  aborted: 'Aborted',
  running: 'Running',
  failed: 'Failed',
  notstarted: 'NotStarted',
  expired: 'Expired',
  queued: 'Queued',
  paused: 'Paused',
  waiting: 'Waiting',
  skipped: 'Skipped',
  success: 'Success',
  suspended: 'Suspended',
  pausing: 'Pausing',
  approvalrejected: 'ApprovalRejected'
}

export default function ExecutionStatusLabel({
  status,
  className
}: ExecutionStatusLabelProps): React.ReactElement | null {
  const { getString } = useStrings()
  if (!status) return null
  const key = stringsMap[status.toLowerCase()]
  const stringId = `executionStatus.${key}` as StringKeys

  return (
    <Text
      inline
      className={cx(css.status, css[status.toLowerCase() as keyof typeof css], className)}
      font={{ weight: 'bold', size: 'xsmall' }}
    >
      {key ? getString(stringId) : status}
    </Text>
  )
}
