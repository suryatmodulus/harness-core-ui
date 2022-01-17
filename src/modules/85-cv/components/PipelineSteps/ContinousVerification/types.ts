/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { AllFailureStrategyConfig } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/FailureStrategyPanel'
import type { StepElementConfig } from 'services/cd-ng'
import type { VariableResponseMapValue } from 'services/pipeline-ng'

export interface ContinousVerificationVariableStepProps {
  metadataMap: Record<string, VariableResponseMapValue>
  stageIdentifier: string
  variablesData: ContinousVerificationData
  originalData: ContinousVerificationData
}

export interface spec {
  sensitivity?: SelectOption | string
  duration?: SelectOption | string
  trafficsplit?: SelectOption | string | number
  baseline?: SelectOption | string
  deploymentTag?: string
  [x: string]: any
}

export interface ContinousVerificationData extends StepElementConfig {
  failureStrategies: AllFailureStrategyConfig[]
  spec: {
    monitoredServiceRef?: string
    monitoredServiceName?: string
    type?: string
    healthSources?: {
      identifier: string
    }[]
    spec?: spec
  }
}
