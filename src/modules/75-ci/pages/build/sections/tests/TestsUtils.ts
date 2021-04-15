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

  return Math.round(value) / scale
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
