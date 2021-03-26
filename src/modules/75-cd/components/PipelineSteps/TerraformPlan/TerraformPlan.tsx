import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StepElementConfig } from 'services/cd-ng'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export class TerraformPlan extends PipelineStep<StepElementConfig> {
  constructor() {
    super()
    this._hasStepVariables = true
  }
  protected type = StepType.TerraformPlan
  protected defaultValues: StepElementConfig = {
    identifier: '',
    timeout: '10m'
  }
  protected stepIcon: IconName = 'terraform-plan'
  protected stepName = 'Terraform Plan'
  validateInputSet(): FormikErrors<StepElementConfig> {
    const errors = {} as any

    return errors
  }
  renderStep(): JSX.Element {
    return <div>Work in progress</div>
  }
}
