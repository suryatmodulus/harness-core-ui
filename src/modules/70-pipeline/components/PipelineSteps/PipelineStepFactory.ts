/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'

import { StepGroupStep } from './Steps/StepGroupStep/StepGroupStep'
import { CustomVariables } from './Steps/CustomVariables/CustomVariables'
import { BarrierStep } from './Steps/Barrier/Barrier'
import { HarnessApproval } from './Steps/Approval/HarnessApproval'
import { JiraApproval } from './Steps/JiraApproval/JiraApproval'
import { ServiceNowApproval } from './Steps/ServiceNowApproval/ServiceNowApproval'
import { JiraCreate } from './Steps/JiraCreate/JiraCreate'
import { JiraUpdate } from './Steps/JiraUpdate/JiraUpdate'

class PipelineStepFactory extends AbstractStepFactory {
  protected type = 'pipeline-factory'
}

const factory = new PipelineStepFactory()

// common
factory.registerStep(new BarrierStep())
factory.registerStep(new StepGroupStep())
factory.registerStep(new CustomVariables())
factory.registerStep(new HarnessApproval())
factory.registerStep(new JiraApproval())
factory.registerStep(new JiraCreate())
factory.registerStep(new JiraUpdate())
factory.registerStep(new ServiceNowApproval())

// build steps
export default factory
