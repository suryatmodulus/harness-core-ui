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
import type { JiraCreateVariableListModeProps, JiraCreateData } from './types'
import { processFormData, processInitialValues } from './helper'
import JiraCreateStepModeWithRef from './JiraCreateStepMode'
import JiraCreateDeploymentMode from './JiraCreateDeploymentMode'

export class JiraCreate extends PipelineStep<JiraCreateData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected isHarnessSpecific = true
  protected type = StepType.JiraCreate
  protected stepName = 'Jira Create'
  protected stepIcon: IconName = 'service-jira'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.JiraCreate'
  // initialValues on mount
  protected defaultValues: JiraCreateData = {
    identifier: '',
    timeout: '1d',
    name: '',
    type: StepType.JiraCreate,
    spec: {
      connectorRef: '',
      projectKey: '',
      issueType: '',
      summary: '',
      description: '',
      fields: []
    }
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<JiraCreateData>): FormikErrors<JiraCreateData> {
    const errors: FormikErrors<JiraCreateData> = {}
    const isRequired = viewType === StepViewType.DeploymentForm
    const isSummaryRuntime =
      getMultiTypeFromValue(template?.spec?.fields?.find(field => field.name === 'Summary')?.value as string) ===
      MultiTypeInputType.RUNTIME

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
      typeof template?.spec?.projectKey === 'string' &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.projectKey) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.projectKey)
    ) {
      errors.spec = {
        ...errors.spec,
        projectKey: getString?.('pipeline.jiraApprovalStep.validations.project')
      }
    }

    if (
      typeof template?.spec?.issueType === 'string' &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.issueType) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.issueType)
    ) {
      errors.spec = {
        ...errors.spec,
        issueType: getString?.('pipeline.jiraApprovalStep.validations.issueType')
      }
    }

    if (isSummaryRuntime && isEmpty(data?.spec?.summary) && isRequired) {
      errors.spec = {
        ...errors.spec,
        summary: getString?.('pipeline.jiraCreateStep.validations.summary')
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

  processFormData(values: JiraCreateData): JiraCreateData {
    return processFormData(values)
  }

  renderStep(this: JiraCreate, props: StepProps<JiraCreateData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep, readonly } =
      props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <JiraCreateDeploymentMode
          stepViewType={stepViewType}
          initialValues={initialValues}
          onUpdate={(values: JiraCreateData) => onUpdate?.(values)}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const customStepPropsTyped = customStepProps as JiraCreateVariableListModeProps
      return (
        <VariablesListTable
          data={flatObject(customStepPropsTyped.variablesData)}
          originalData={initialValues as Record<string, any>}
          metadataMap={customStepPropsTyped.metadataMap}
        />
      )
    }
    return (
      <JiraCreateStepModeWithRef
        ref={formikRef}
        stepViewType={stepViewType}
        initialValues={processInitialValues(initialValues)}
        onUpdate={(values: JiraCreateData) => onUpdate?.(values)}
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}
