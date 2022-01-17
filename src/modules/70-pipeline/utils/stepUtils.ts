/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import produce from 'immer'
import { isEmpty, set, get } from 'lodash-es'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StageElementConfig, StepElementConfig } from 'services/cd-ng'
import type { StepPalleteModuleInfo } from 'services/pipeline-ng'
import {
  StepOrStepGroupOrTemplateStepData,
  TabTypes,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { sanitize } from '@common/utils/JSONUtils'

export enum StepMode {
  STAGE = 'STAGE',
  STEP_GROUP = 'STEP_GROUP',
  STEP = 'STEP'
}

export function isHarnessApproval(stepType?: string): boolean {
  return stepType === StepType.HarnessApproval
}

export function isJiraApproval(stepType?: string): boolean {
  return stepType === StepType.JiraApproval
}

export function isApprovalStep(stepType?: string): boolean {
  return isHarnessApproval(stepType) || isJiraApproval(stepType) || isServiceNowApproval(stepType)
}

export function isServiceNowApproval(stepType?: string): boolean {
  return stepType === StepType.ServiceNowApproval
}

export function getAllStepPaletteModuleInfos(): StepPalleteModuleInfo[] {
  return [
    {
      module: 'cd',
      shouldShowCommonSteps: false
    },
    {
      module: 'ci',
      shouldShowCommonSteps: true
    },
    {
      module: 'cv',
      shouldShowCommonSteps: false
    }
  ]
}

export function getStepPaletteModuleInfosFromStage(
  stageType?: string,
  stage?: StageElementConfig,
  initialCategory?: string
): StepPalleteModuleInfo[] {
  const deploymentType = get(stage, 'spec.serviceConfig.serviceDefinition.type', undefined)
  let category = initialCategory
  switch (deploymentType) {
    case 'Kubernetes':
      category = 'Kubernetes'
      break
    case 'NativeHelm':
      category = 'Helm'
      break
  }
  switch (stageType) {
    case StageType.BUILD:
      return [
        {
          module: 'ci',
          shouldShowCommonSteps: false
        }
      ]

    case StageType.FEATURE:
      return [
        {
          module: 'pms',
          category: 'FeatureFlag',
          shouldShowCommonSteps: true
        }
      ]

    default:
      return [
        {
          module: 'cd',
          category: stageType === StageType.APPROVAL ? 'Approval' : category,
          shouldShowCommonSteps: true
        },
        {
          module: 'cv',
          shouldShowCommonSteps: false
        }
      ]
  }
}

export function getStepDataFromValues(
  item: Partial<Values>,
  initialValues: StepOrStepGroupOrTemplateStepData
): StepElementConfig {
  const processNode = produce(initialValues as StepElementConfig, node => {
    if (item.tab !== TabTypes.Advanced) {
      if ((item as StepElementConfig).description) {
        node.description = (item as StepElementConfig).description
      } else if (node.description) {
        delete node.description
      }
      if ((item as StepElementConfig).timeout) {
        node.timeout = (item as StepElementConfig).timeout
      } else if (node.timeout) {
        delete node.timeout
      }
      if ((item as StepElementConfig).spec) {
        node.spec = { ...(item as StepElementConfig).spec }
      }
    } else {
      if (item.when) {
        node.when = item.when
      }
      if (!isEmpty(item.delegateSelectors)) {
        set(node, 'spec.delegateSelectors', item.delegateSelectors)
      } else if (node.spec?.delegateSelectors) {
        delete node.spec.delegateSelectors
      }
    }
    // default strategies can be present without having the need to click on Advanced Tab. For eg. in CV step.
    if (Array.isArray(item.failureStrategies) && !isEmpty(item.failureStrategies)) {
      node.failureStrategies = item.failureStrategies
    } else if (node.failureStrategies) {
      delete node.failureStrategies
    }
  })
  sanitize(processNode, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
  return processNode
}
