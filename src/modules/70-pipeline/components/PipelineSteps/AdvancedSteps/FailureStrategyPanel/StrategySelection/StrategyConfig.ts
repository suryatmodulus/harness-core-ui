import { mapValues } from 'lodash-es'
import { Modes } from '../../common'

export enum Strategy {
  Ignore = 'Ignore',
  Abort = 'Abort',
  StageRollback = 'StageRollback',
  StepGroupRollback = 'StepGroupRollback',
  Retry = 'Retry',
  ManualIntervention = 'ManualIntervention',
  MarkAsSuccess = 'MarkAsSuccess'
}

export enum ErrorType {
  AnyOther = 'AnyOther',
  Authentication = 'Authentication',
  Connectivity = 'Connectivity',
  Timeout = 'Timeout',
  Authorization = 'Authorization',
  Verification = 'Verification',
  DelegateProvisioning = 'DelegateProvisioning'
}

export const allowedStrategiesAsPerStep: Record<Modes, Strategy[]> = {
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
  [Modes.STAGE]: [Strategy.StageRollback, Strategy.Ignore, Strategy.Retry, Strategy.MarkAsSuccess, Strategy.Abort]
}

export const errorTypesOrder: ErrorType[] = [
  ErrorType.Authentication,
  ErrorType.Authorization,
  ErrorType.Connectivity,
  ErrorType.Timeout,
  ErrorType.Verification,
  ErrorType.DelegateProvisioning,
  ErrorType.AnyOther
]

export const testIds: Record<Strategy, string> = mapValues(
  Strategy,
  (_, key) => `failure-strategy-${key.toLowerCase()}`
)
