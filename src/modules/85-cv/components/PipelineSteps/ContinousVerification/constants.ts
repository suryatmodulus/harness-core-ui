/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import { ErrorType, Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ContinousVerificationData } from './types'

export enum JobTypes {
  BLUE_GREEN = 'Bluegreen',
  TEST = 'Test',
  HEALTH = 'Health',
  CANARY = 'Canary'
}

export enum SensitivityTypes {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum IdentifierTypes {
  serviceIdentifier = '<+service.identifier>',
  envIdentifier = '<+env.identifier>'
}

export const durationOptions: SelectOption[] = [
  { label: '5 min', value: '5m' },
  { label: '10 min', value: '10m' },
  { label: '15 min', value: '15m' },
  { label: '30 min', value: '30m' }
]

export const trafficSplitPercentageOptions: SelectOption[] = [
  { label: '5%', value: 5 },
  { label: '10%', value: 10 },
  { label: '15%', value: 15 }
]

export const VerificationSensitivityOptions: SelectOption[] = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' }
]

export const baseLineOptions: SelectOption[] = [{ label: 'Last Successful job run', value: 'LAST' }]

export const cvDefaultValues: ContinousVerificationData = {
  name: '',
  type: StepType.Verify,
  identifier: '',
  timeout: '2h',
  spec: {
    monitoredServiceRef: '',
    type: '',
    healthSources: [],
    spec: {
      sensitivity: '',
      duration: '',
      baseline: '',
      trafficsplit: '',
      deploymentTag: ''
    }
  },
  failureStrategies: [
    {
      onFailure: {
        errors: [ErrorType.Verification],
        action: {
          type: Strategy.ManualIntervention,
          spec: {
            timeout: '2h',
            onTimeout: {
              action: {
                type: Strategy.StageRollback
              }
            }
          }
        }
      }
    },
    {
      onFailure: {
        errors: [ErrorType.Unknown],
        action: {
          type: Strategy.ManualIntervention,
          spec: {
            timeout: '2h',
            onTimeout: {
              action: {
                type: Strategy.Ignore
              }
            }
          }
        }
      }
    }
  ]
}
