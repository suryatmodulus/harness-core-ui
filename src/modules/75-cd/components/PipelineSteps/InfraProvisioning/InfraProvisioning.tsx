import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import type { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { ExecutionElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { InfraProvisioningBaseWithRef } from './InfraProvisioningBase'

export interface InfraProvisioningData {
  provisioner: ExecutionElementConfig
  originalProvisioner?: Partial<ExecutionElementConfig>
  provisionerEnabled: boolean
  provisionerSnippetLoading?: boolean
}

export interface InfraProvisioningDataUI extends Omit<InfraProvisioningData, 'provisioner'> {
  provisioner: {
    stage: {
      spec: {
        execution: ExecutionElementConfig
      }
    }
  }
}

export interface InfraProvisioningProps {
  initialValues: InfraProvisioningData
  template?: InfraProvisioningData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: InfraProvisioningData) => void
}

export class InfraProvisioning extends PipelineStep<any> {
  protected type = StepType.InfraProvisioning
  protected defaultValues: any = {}

  // TODO: replace with right icon (if needed)
  protected stepIcon: IconName = 'cross'
  protected stepName = 'Infrastructure provisioning'
  protected stepPaletteVisible = false

  constructor() {
    super()
  }

  validateInputSet(): FormikErrors<any> {
    return {}
  }

  renderStep(props: StepProps<any>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, formikRef } = props

    return (
      <InfraProvisioningBaseWithRef
        initialValues={initialValues}
        stepViewType={stepViewType}
        onUpdate={onUpdate}
        ref={formikRef}
      />
    )
  }
}
