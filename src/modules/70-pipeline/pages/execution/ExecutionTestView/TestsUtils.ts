/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const renderFailureRate = (failureRate: number): number => {
  let scale = 1
  let value = failureRate

  if (failureRate === 0 || Math.round(failureRate * 100) > 0) {
    return Math.round(failureRate * 100)
  }

  while (value < 10) {
    scale *= 10
    value *= 10
  }
  const valueScaled = Math.round(value) / scale
  const exceeds4DecimalPlaces = valueScaled.toString().split('.')?.[1]?.length > 4
  return exceeds4DecimalPlaces ? Number(valueScaled.toFixed(4)) : valueScaled
}

export enum SortByKey {
  FAILURE_RATE = 'fail_pct',
  FAILED_TESTS = 'failed_tests',
  PASSED_TESTS = 'passed_tests',
  SKIPPED_TESTS = 'skipped_tests',
  DURATION_MS = 'duration_ms',
  TOTAL_TESTS = 'total_tests'
}

export const TestStatus = {
  PASSED: 'passed',
  SKIPPED: 'skipped',
  ERROR: 'error',
  FAILED: 'failed'
}

enum ExecutionStatus {
  RUNNING = 'running',
  FAILED = 'failed',
  NOTSTARTED = 'notstarted',
  EXPIRED = 'expired',
  ABORTED = 'aborted',
  QUEUED = 'queued',
  PAUSED = 'paused',
  WAITING = 'waiting',
  SUCCESS = 'success',
  SUSPENDED = 'suspended',
  SKIPPED = 'skipped'
}

export const isExecutionComplete = (status: string) => {
  const _status = (status || '').toLowerCase()

  return (
    _status === ExecutionStatus.SUCCESS ||
    _status === ExecutionStatus.FAILED ||
    _status === ExecutionStatus.EXPIRED ||
    _status === ExecutionStatus.ABORTED ||
    _status === ExecutionStatus.SKIPPED
  )
}

export const CALL_GRAPH_WIDTH = 360
export const CALL_GRAPH_HEIGHT = 360
export const CALL_GRAPH_API_LIMIT = 75
