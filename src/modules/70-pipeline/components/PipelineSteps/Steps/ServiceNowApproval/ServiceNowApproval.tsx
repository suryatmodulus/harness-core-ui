import React from 'react'

import type { FormikErrors } from 'formik'
import type { IconName } from '@wings-software/uicore'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

import type { StringsMap } from 'stringTypes'
import { PipelineStep } from '../../PipelineStep'
import { StepType } from '../../PipelineStepInterface'

import type { ServiceNowApprovalData } from './types'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import ServiceNowApprovalStepModeWithRef from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/ServiceNowApprovalStepMode'
import {
  getDefaultCriterias,
  processInitialValues
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/helper'


export class ServiceNowApproval extends PipelineStep<ServiceNowApprovalData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.ServiceNowApproval
  protected stepName = 'ServiceNow Approval'
  protected stepIcon: IconName = 'service-servicenow'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServiceNowApproval'
  // initialValues on mount
  protected defaultValues: ServiceNowApprovalData = {
    identifier: '',
    timeout: '1d',
    name: '',
    type: StepType.ServiceNowApproval,
    spec: {
      connectorRef: '',
      issueNumber: '',
      ticketType: '',
      approvalCriteria: getDefaultCriterias(),
      rejectionCriteria: getDefaultCriterias()
    }
  }

  validateInputSet({}: ValidateInputSetProps<ServiceNowApprovalData>): FormikErrors<ServiceNowApprovalData> {
    const errors: FormikErrors<ServiceNowApprovalData> = {}

    return errors
  }

  // @ts-ignore
  renderStep(this: ServiceNowApproval, props: StepProps<ServiceNowApprovalData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,

      formikRef,

      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props
    return (
      <ServiceNowApprovalStepModeWithRef
        ref={formikRef}
        stepViewType={stepViewType || StepViewType.Edit}
        initialValues={processInitialValues(initialValues)}
        onUpdate={(values: ServiceNowApprovalData) => {
          const forUpdate = this.processFormData(values)
          onUpdate?.(forUpdate)
        }}
        allowableTypes={allowableTypes}
        onChange={values => onChange?.(this.processFormData(values))}
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}

