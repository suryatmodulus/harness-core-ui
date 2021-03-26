import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StepElementConfig } from 'services/cd-ng'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export class TerraformDestroy extends PipelineStep<StepElementConfig> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.TerraformDestroy
  protected defaultValues: StepElementConfig = {
    identifier: '',
    timeout: '10m'
  }
  protected stepIcon: IconName = 'terraform-destroy'
  protected stepName = 'Terraform Destroy'
  validateInputSet(): FormikErrors<StepElementConfig> {
    const errors = {} as any

    return errors
  }
  renderStep(): JSX.Element {
    return <div>Work in progress</div>
  }
}
