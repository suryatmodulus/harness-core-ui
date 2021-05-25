import React from 'react'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import { FormikErrors, yupToFormErrors } from 'formik'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@wings-software/uicore'
import { StepProps, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { UseStringsReturn } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
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
  }

  protected isHarnessSpecific = true
  protected type = StepType.JiraCreate
  protected stepName = 'Jira Create'
  protected stepIcon: IconName = 'service-jira'
  // initialValues on mount
  protected defaultValues: JiraCreateData = {
    identifier: '',
    timeout: '1d',
    spec: {
      connectorRef: '',
      projectKey: '',
      issueType: '',
      summary: '',
      description: '',
      fields: []
    }
  }

  validateInputSet(
    data: JiraCreateData,
    template: JiraCreateData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<JiraCreateData> {
    const errors: FormikErrors<JiraCreateData> = {}

    if (
      typeof template?.spec?.connectorRef === 'string' &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.connectorRef)
    ) {
      errors.spec = {
        connectorRef: getString?.('pipeline.jiraApprovalStep.validations.connectorRef')
      }
    }

    if (
      typeof template?.spec?.projectKey === 'string' &&
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
      getMultiTypeFromValue(template?.spec?.issueType) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.issueType)
    ) {
      errors.spec = {
        ...errors.spec,
        issueType: getString?.('pipeline.jiraApprovalStep.validations.issueType')
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

  processFormData(values: JiraCreateData): JiraCreateData {
    return processFormData(values)
  }

  renderStep(this: JiraCreate, props: StepProps<JiraCreateData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly
    } = props

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
