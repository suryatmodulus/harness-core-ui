import React from 'react'

import { connect, FormikErrors, yupToFormErrors } from 'formik'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StringsMap } from 'stringTypes'
import ServiceNowApprovalStepModeWithRef from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/ServiceNowApprovalStepMode'
import {
  getDefaultCriterias,
  processInitialValues,
  processFormData
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/helper'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '../Common/ApprovalCommons'
import { PipelineStep } from '../../PipelineStep'
import { StepType } from '../../PipelineStepInterface'

import type { ServiceNowApprovalData, SnowApprovalVariableListModeProps } from './types'
import ServiceNowApprovalDeploymentMode from './ServiceNowApprovalDeploymentMode'
import pipelineVariablesCss from '../../../PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

const SnowApprovalDeploymentModeWithFormik = connect(ServiceNowApprovalDeploymentMode)
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

  processFormData(values: ServiceNowApprovalData): ServiceNowApprovalData {
    return processFormData(values)
  }

  validateInputSet({
    data,
    template,
    getString
  }: ValidateInputSetProps<ServiceNowApprovalData>): FormikErrors<ServiceNowApprovalData> {
    const errors: FormikErrors<ServiceNowApprovalData> = {}

    if (
      typeof template?.spec?.connectorRef === 'string' &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.connectorRef)
    ) {
      errors.spec = {
        connectorRef: getString?.('pipeline.serviceNowApprovalStep.validations.connectorRef')
      }
    }

    if (
      typeof template?.spec?.issueNumber === 'string' &&
      getMultiTypeFromValue(template?.spec?.issueNumber) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.issueNumber?.trim())
    ) {
      errors.spec = {
        ...errors.spec,
        issueNumber: getString?.('pipeline.serviceNowApprovalStep.validations.issueNumber')
      }
    }

    if (
      typeof template?.spec?.approvalCriteria?.spec?.expression === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvalCriteria?.spec?.expression) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.approvalCriteria?.spec?.expression?.trim())
    ) {
      errors.spec = {
        ...errors.spec,
        approvalCriteria: {
          spec: { expression: getString?.('pipeline.approvalCriteria.validations.expression') }
        }
      }
    }

    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, err)
        }
      }
    }

    return errors
  }

  renderStep(this: ServiceNowApproval, props: StepProps<ServiceNowApprovalData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <SnowApprovalDeploymentModeWithFormik
          stepViewType={stepViewType}
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          onUpdate={(values: ServiceNowApprovalData) => onUpdate?.(values)}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const customStepPropsTyped = customStepProps as SnowApprovalVariableListModeProps
      return (
        <VariablesListTable
          data={flatObject(customStepPropsTyped.variablesData)}
          originalData={initialValues as Record<string, any>}
          metadataMap={customStepPropsTyped.metadataMap}
          className={pipelineVariablesCss.variablePaddingL3}
        />
      )
    }
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
