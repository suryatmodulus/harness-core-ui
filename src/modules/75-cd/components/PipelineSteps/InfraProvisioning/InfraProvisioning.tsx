import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { StepViewType, StepProps } from '@pipeline/exports'
import type { UseStringsReturn } from 'framework/exports'
import type { ExecutionWrapper } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { InfraProvisioningBaseWithRef } from './InfraProvisioningBase'

export interface InfraProvisioningData {
  provisioner: {
    steps?: ExecutionWrapper[]
    rollbackSteps?: ExecutionWrapper[]
  }
  provisionerEnabled: boolean
  provisionerSnippetLoading?: boolean
}

export interface InfraProvisioningDataUI extends Omit<InfraProvisioningData, 'provisioner'> {
  provisioner: {
    stage: {
      spec: {
        execution: {
          steps?: ExecutionWrapper[]
          rollbackSteps?: ExecutionWrapper[]
        }
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

  validateInputSet(_data: any, _template?: any, _getString?: UseStringsReturn['getString']): object {
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
