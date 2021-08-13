import React from 'react'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import { FormikErrors, yupToFormErrors } from 'formik'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@wings-software/uicore'
import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { StringsMap } from 'stringTypes'
import { PipelineStep } from '../../PipelineStep'
import { StepType } from '../../PipelineStepInterface'
import { flatObject } from '../ApprovalCommons'
import type { JiraUpdateData, JiraUpdateVariableListModeProps } from './types'
import { processFormData, processInitialValues } from './helper'
import JiraUpdateStepModeWithRef from './JiraUpdateStepMode'
import JiraUpdateDeploymentMode from './JiraUpdateDeploymentMode'

export class JiraUpdate extends PipelineStep<JiraUpdateData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected isHarnessSpecific = true
  protected type = StepType.JiraUpdate
  protected stepName = 'Jira Update'
  protected stepIcon: IconName = 'service-jira'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.JiraUpdate'
  // initialValues on mount
  protected defaultValues: JiraUpdateData = {
    identifier: '',
    timeout: '1d',
    name: '',
    type: StepType.JiraUpdate,
    spec: {
      connectorRef: '',
      issueKey: '',
      transitionTo: {
        status: '',
        transitionName: ''
      },
      fields: []
    }
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<JiraUpdateData>): FormikErrors<JiraUpdateData> {
    const errors: FormikErrors<JiraUpdateData> = {}
    const isRequired = viewType === StepViewType.DeploymentForm
    if (
      typeof template?.spec?.connectorRef === 'string' &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.connectorRef)
    ) {
      errors.spec = {
        connectorRef: getString?.('pipeline.jiraApprovalStep.validations.connectorRef')
      }
    }

    if (
      getMultiTypeFromValue(template?.spec?.issueKey) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.issueKey?.trim())
    ) {
      errors.spec = {
        ...errors.spec,
        issueKey: getString?.('pipeline.jiraApprovalStep.validations.issueKey')
      }
    }

    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
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

  processFormData(values: JiraUpdateData) {
    return processFormData(values)
  }

  renderStep(this: JiraUpdate, props: StepProps<JiraUpdateData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep, readonly } =
      props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <JiraUpdateDeploymentMode
          stepViewType={stepViewType}
          initialValues={initialValues}
          onUpdate={(values: JiraUpdateData) => onUpdate?.(values)}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const customStepPropsTyped = customStepProps as JiraUpdateVariableListModeProps
      return (
        <VariablesListTable
          data={flatObject(customStepPropsTyped.variablesData)}
          originalData={initialValues as Record<string, any>}
          metadataMap={customStepPropsTyped.metadataMap}
        />
      )
    }
    return (
      <JiraUpdateStepModeWithRef
        ref={formikRef}
        stepViewType={stepViewType}
        initialValues={processInitialValues(initialValues)}
        onUpdate={(values: JiraUpdateData) => onUpdate?.(values)}
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}
