import React from 'react'
import cx from 'classnames'

import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { String } from 'framework/strings'
import type { StringKeys } from 'framework/strings'

import css from './ExecutionStatusLabel.module.scss'

const stringsMap: Record<ExecutionStatus, StringKeys> = {
  Aborted: 'pipeline.executionStatus.Aborted',
  Discontinuing: 'pipeline.executionStatus.Aborted',
  Running: 'pipeline.executionStatus.Running',
  AsyncWaiting: 'pipeline.executionStatus.Running',
  TaskWaiting: 'pipeline.executionStatus.Running',
  TimedWaiting: 'pipeline.executionStatus.Running',
  Failed: 'pipeline.executionStatus.Failed',
  Errored: 'pipeline.executionStatus.Failed',
  NotStarted: 'pipeline.executionStatus.NotStarted',
  Expired: 'pipeline.executionStatus.Expired',
  Queued: 'pipeline.executionStatus.Queued',
  Paused: 'pipeline.executionStatus.Paused',
  ResourceWaiting: 'pipeline.executionStatus.Waiting',
  Skipped: 'pipeline.executionStatus.Skipped',
  Success: 'pipeline.executionStatus.Success',
  IgnoreFailed: 'pipeline.executionStatus.Success',
  Suspended: 'pipeline.executionStatus.Suspended',
  Pausing: 'pipeline.executionStatus.Pausing',
  ApprovalRejected: 'pipeline.executionStatus.ApprovalRejected',
  InterventionWaiting: 'pipeline.executionStatus.Waiting',
  ApprovalWaiting: 'pipeline.executionStatus.Waiting'
}

export interface ExecutionStatusLabelProps {
  status?: ExecutionStatus
  className?: string
}

export default function ExecutionStatusLabel({
  status,
  className
}: ExecutionStatusLabelProps): React.ReactElement | null {
  if (!status) return null

  return (
    <String
      tagName="div"
      stringID={stringsMap[status] || 'pipeline.executionStatus.Unknown'}
      className={cx(css.status, css[status.toLowerCase() as keyof typeof css], className)}
    />
  )
}
