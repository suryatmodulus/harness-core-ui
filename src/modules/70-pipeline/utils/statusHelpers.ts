import { camelCase } from 'lodash-es'
import type { PipelineExecutionSummaryDTO } from 'services/cd-ng'

export type ExecutionStatus = Exclude<
  Required<PipelineExecutionSummaryDTO>['executionStatus'],
  'NOT_STARTED' | 'INTERVENTION_WAITING' | 'APPROVAL_WAITING' | 'APPROVAL_REJECTED'
>

export const ExecutionStatusEnum: Readonly<Record<ExecutionStatus, ExecutionStatus>> = {
  Aborted: 'Aborted',
  Expired: 'Expired',
  Failed: 'Failed',
  NotStarted: 'NotStarted',
  Paused: 'Paused',
  Queued: 'Queued',
  Running: 'Running',
  Success: 'Success',
  Suspended: 'Suspended',
  Waiting: 'Waiting',
  Skipped: 'Skipped',
  ApprovalRejected: 'ApprovalRejected',
  InterventionWaiting: 'InterventionWaiting',
  ApprovalWaiting: 'ApprovalWaiting',
  Pausing: 'Pausing'
}

export const EXECUTION_STATUS: readonly ExecutionStatus[] = Object.keys(ExecutionStatusEnum) as ExecutionStatus[]

const changeCase = (status?: string): string => {
  const temp = camelCase(status)

  return temp.charAt(0).toUpperCase() + temp.slice(1)
}

export function isExecutionRunning(status?: string): boolean {
  return changeCase(status) === 'Running'
}

export function isExecutionFailed(status?: string): boolean {
  return changeCase(status) === 'Failed' || changeCase(status) === 'Failure'
}

export function isExecutionExpired(status?: string): boolean {
  return changeCase(status) === 'Expired'
}

export function isExecutionAborted(status?: string): boolean {
  return changeCase(status) === 'Aborted'
}

export function isExecutionQueued(status?: string): boolean {
  return changeCase(status) === 'Queued'
}

export function isExecutionWaiting(status?: string): boolean {
  return (
    isExecutionOnlyWaiting(status) || isExecutionWaitingForApproval(status) || isExecutionWaitingForIntervention(status)
  )
}

export function isExecutionOnlyWaiting(status?: string): boolean {
  return changeCase(status) === 'Waiting'
}

export function isExecutionWaitingForApproval(status?: string): boolean {
  return changeCase(status) === 'ApprovalWaiting'
}

export function isExecutionWaitingForIntervention(status?: string): boolean {
  return changeCase(status) === 'InterventionWaiting'
}

export function isExecutionPaused(status?: string): boolean {
  return changeCase(status) === 'Paused'
}

export function isExecutionNotStarted(status?: string): boolean {
  return changeCase(status) === 'NotStarted'
}

export function isExecutionSuccess(status?: string): boolean {
  return changeCase(status) === 'Success'
}

export function isExecutionSuspended(status?: string): boolean {
  return changeCase(status) === 'Suspended'
}

export function isExecutionPausing(status?: string): boolean {
  return changeCase(status) === 'Pausing'
}

export function isExecutionApprovalRejected(status?: string): boolean {
  return changeCase(status) === 'ApprovalRejected'
}

export function isExecutionComplete(status?: string): boolean {
  return isExecutionSuccess(status) || isExecutionCompletedWithBadState(status)
}

export function isExecutionSkipped(status?: string): boolean {
  return changeCase(status) === 'Skipped'
}

export function isExecutionCompletedWithBadState(status?: string): boolean {
  return (
    isExecutionAborted(status) ||
    isExecutionExpired(status) ||
    isExecutionFailed(status) ||
    isExecutionSuspended(status) ||
    isExecutionApprovalRejected(status)
  )
}

export function isExecutionActive(status?: string): boolean {
  return (
    isExecutionPaused(status) ||
    isExecutionPausing(status) ||
    isExecutionRunning(status) ||
    isExecutionNotStarted(status) ||
    isExecutionWaiting(status) ||
    isExecutionQueued(status)
  )
}

export function isExecutionRunningLike(status?: string): boolean {
  return (
    isExecutionRunning(status) || isExecutionPaused(status) || isExecutionPausing(status) || isExecutionWaiting(status)
  )
}
