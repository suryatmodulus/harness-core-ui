import { mapValues } from 'lodash-es'
import type { OnFailureConfig } from 'services/cd-ng'
import { Modes } from '../../common'

export type FailureErrorType = OnFailureConfig['errors'][number]

export enum Strategy {
  Ignore = 'Ignore',
  Abort = 'Abort',
  StageRollback = 'StageRollback',
  StepGroupRollback = 'StepGroupRollback',
  Retry = 'Retry',
  ManualIntervention = 'ManualIntervention',
  MarkAsSuccess = 'MarkAsSuccess'
}

export const ErrorType: Record<FailureErrorType, FailureErrorType> = {
  AllErrors: 'AllErrors',
  Authentication: 'Authentication',
  Connectivity: 'Connectivity',
  Timeout: 'Timeout',
  Authorization: 'Authorization',
  Verification: 'Verification',
  DelegateProvisioning: 'DelegateProvisioning',
  Unknown: 'Unknown'
}

export enum Domain {
  'CI' = 'CI',
  'Deployment' = 'Deployment'
}

export const allowedStrategiesAsPerStep: (domain: Domain) => Record<Modes, Strategy[]> = (
  domain = Domain.Deployment
) => {
  switch (domain) {
    case Domain.CI:
      return {
        [Modes.STEP]: [
          Strategy.ManualIntervention,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort
        ],
        [Modes.STEP_GROUP]: [
          Strategy.ManualIntervention,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort
        ],
        [Modes.STAGE]: [Strategy.Ignore, Strategy.Retry, Strategy.MarkAsSuccess, Strategy.Abort]
      }
    case Domain.Deployment:
    default:
      return {
        [Modes.STEP]: [
          Strategy.ManualIntervention,
          Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort
        ],
        [Modes.STEP_GROUP]: [
          Strategy.ManualIntervention,
          Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.StepGroupRollback,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort
        ],
        [Modes.STAGE]: [
          Strategy.ManualIntervention,
          Strategy.StageRollback,
          Strategy.Ignore,
          Strategy.Retry,
          Strategy.MarkAsSuccess,
          Strategy.Abort
        ]
      }
  }
}

export const errorTypesOrderForCD: FailureErrorType[] = [
  ErrorType.Authentication,
  ErrorType.Authorization,
  ErrorType.Connectivity,
  ErrorType.DelegateProvisioning,
  ErrorType.Timeout,
  ErrorType.Unknown,
  ErrorType.Verification
]
export const errorTypesOrderForCI: FailureErrorType[] = [ErrorType.Timeout, ErrorType.Unknown]

export const testIds: Record<Strategy, string> = mapValues(
  Strategy,
  (_, key) => `failure-strategy-${key.toLowerCase()}`
)
