import type { ApprovalInstanceResponse } from 'services/pipeline-ng'

export type ApprovalStatusType = ApprovalInstanceResponse['status']

export const ApprovalStatus: Record<ApprovalStatusType, ApprovalStatusType> = {
  WAITING: 'WAITING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED'
}

export function isApprovalWaiting(status: ApprovalStatusType): boolean {
  return status === ApprovalStatus.WAITING
}

export function isApprovalApproved(status: ApprovalStatusType): boolean {
  return status === ApprovalStatus.APPROVED
}

export function isApprovalRejected(status: ApprovalStatusType): boolean {
  return status === ApprovalStatus.REJECTED
}

export function isApprovalFailed(status: ApprovalStatusType): boolean {
  return status === ApprovalStatus.FAILED
}

export function isApprovalExpired(status: ApprovalStatusType): boolean {
  return status === ApprovalStatus.EXPIRED
}
