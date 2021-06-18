import { camelCase } from 'lodash-es'
import type { ExecutionSummaryInfo } from 'services/pipeline-ng'

export type ExecutionStatus = Exclude<
  Required<ExecutionSummaryInfo>['lastExecutionStatus'],
  'NOT_STARTED' | 'INTERVENTION_WAITING' | 'APPROVAL_WAITING' | 'APPROVAL_REJECTED' | 'WAITING'
>

/**
 * Statues are to be grouped as follows:
 * Running -> Running, AsyncWaiting, TaskWaiting, TimedWaiting
 * Failed -> Failed, Errored
 * Aborted -> Discontinuing, Aborted,
 * Success -> Success, IgnoreFailed
 */

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
  ResourceWaiting: 'ResourceWaiting',
  AsyncWaiting: 'AsyncWaiting',
  Skipped: 'Skipped',
  TaskWaiting: 'TaskWaiting',
  TimedWaiting: 'TimedWaiting',
  Errored: 'Errored',
  IgnoreFailed: 'IgnoreFailed',
  Discontinuing: 'Discontinuing',
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
  const st = changeCase(status)
  return (
    st === ExecutionStatusEnum.Running ||
    st === ExecutionStatusEnum.AsyncWaiting ||
    st === ExecutionStatusEnum.TimedWaiting ||
    st === ExecutionStatusEnum.TaskWaiting
  )
}

export function isExecutionFailed(status?: string): boolean {
  const st = changeCase(status)
  return st === ExecutionStatusEnum.Failed || st === ExecutionStatusEnum.Errored
}

export function isExecutionExpired(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Expired
}

export function isExecutionAborted(status?: string): boolean {
  const st = changeCase(status)
  return st === ExecutionStatusEnum.Aborted || st === ExecutionStatusEnum.Discontinuing
}

export function isExecutionQueued(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Queued
}

export function isExecutionWaiting(status?: string): boolean {
  return (
    isExecutionOnlyWaiting(status) || isExecutionWaitingForApproval(status) || isExecutionWaitingForIntervention(status)
  )
}

export function isExecutionOnlyWaiting(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.ResourceWaiting
}

export function isExecutionWaitingForApproval(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.ApprovalWaiting
}

export function isExecutionWaitingForIntervention(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.InterventionWaiting
}

export function isExecutionPaused(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Paused
}

export function isExecutionNotStarted(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.NotStarted
}

export function isExecutionSuccess(status?: string): boolean {
  const st = changeCase(status)
  return st === ExecutionStatusEnum.Success || st === ExecutionStatusEnum.IgnoreFailed
}

export function isExecutionSuspended(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Suspended
}

export function isExecutionPausing(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Pausing
}

export function isExecutionApprovalRejected(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.ApprovalRejected
}

export function isExecutionComplete(status?: string): boolean {
  return isExecutionSuccess(status) || isExecutionCompletedWithBadState(status)
}

export function isExecutionSkipped(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Skipped
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
