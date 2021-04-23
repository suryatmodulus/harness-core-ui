import React from 'react'
import { Text } from '@wings-software/uicore'
import cx from 'classnames'

import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'

import css from './ExecutionStatusLabel.module.scss'

const stringsMap: Record<string, StringKeys> = {
  aborted: 'pipeline.executionStatus.Aborted',
  running: 'pipeline.executionStatus.Running',
  failed: 'pipeline.executionStatus.Failed',
  notstarted: 'pipeline.executionStatus.NotStarted',
  expired: 'pipeline.executionStatus.Expired',
  queued: 'pipeline.executionStatus.Queued',
  paused: 'pipeline.executionStatus.Paused',
  waiting: 'pipeline.executionStatus.Waiting',
  skipped: 'pipeline.executionStatus.Skipped',
  success: 'pipeline.executionStatus.Success',
  suspended: 'pipeline.executionStatus.Suspended',
  pausing: 'pipeline.executionStatus.Pausing',
  approvalrejected: 'pipeline.executionStatus.ApprovalRejected'
}

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

  const stringId = stringsMap[status.toLowerCase()]

  return (
    <Text
      inline
      className={cx(css.status, css[status.toLowerCase() as keyof typeof css], className)}
      font={{ weight: 'bold', size: 'xsmall' }}
    >
      {(stringId && getString(stringId)) || stringId}
    </Text>
  )
}
