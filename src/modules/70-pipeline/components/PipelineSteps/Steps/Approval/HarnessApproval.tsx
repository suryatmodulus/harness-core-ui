import React from 'react'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import { FormikErrors, yupToFormErrors } from 'formik'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@wings-software/uicore'
import { StepProps, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { UseStringsReturn } from 'framework/exports'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { PipelineStep } from '../../PipelineStep'
import { StepType } from '../../PipelineStepInterface'
import { flatObject } from '../ApprovalCommons'
import { processFormData, processForInitialValues } from './helper'
import HarnessApprovalDeploymentMode from './HarnessApprovalDeploymentMode'
import HarnessApprovalStepModeWithRef from './HarnessApprovalStepMode'
import type { HarnessApprovalData, HarnessApprovalVariableListModeProps } from './types'

export class HarnessApproval extends PipelineStep<HarnessApprovalData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected isHarnessSpecific = true
  protected type = StepType.HarnessApproval
  protected stepName = 'Manual Approval'
  protected stepIcon: IconName = 'nav-harness'
  // initialValues on mount
  protected defaultValues: HarnessApprovalData = {
    identifier: '',
    timeout: '1d',
    spec: {
      approvalMessage: '',
      includePipelineExecutionHistory: true,
      approvers: {
        userGroups: [],
        minimumCount: 1,
        disallowPipelineExecutor: true
      },
      approverInputs: [
        {
          name: '',
          defaultValue: ''
        }
      ]
    }
  }

  validateInputSet(
    data: HarnessApprovalData,
    template: HarnessApprovalData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<HarnessApprovalData> {
    const errors: FormikErrors<HarnessApprovalData> = {}

    if (
      typeof template?.spec?.approvalMessage === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvalMessage) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.approvalMessage)
    ) {
      errors.spec = {
        ...errors.spec,
        approvalMessage: getString?.('pipeline.approvalStep.validation.approvalMessage')
      }
    }

    if (
      typeof template?.spec?.approvers.userGroups === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.userGroups) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.approvers.userGroups)
    ) {
      errors.spec = {
        ...errors.spec,
        approvers: {
          userGroups: getString?.('pipeline.approvalStep.validation.userGroups')
        }
      }
    }

    if (
      typeof template?.spec?.approvers.minimumCount === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.minimumCount) === MultiTypeInputType.RUNTIME
    ) {
      if (!data?.spec?.approvers.minimumCount) {
        errors.spec = {
          ...errors.spec,
          approvers: {
            minimumCount: getString?.('pipeline.approvalStep.validation.minimumCountRequired')
          }
        }
      } else if (data?.spec?.approvers.minimumCount < 1) {
        errors.spec = {
          ...errors.spec,
          approvers: {
            minimumCount: getString?.('pipeline.approvalStep.validation.minimumCountOne')
          }
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

  processFormData(values: HarnessApprovalData) {
    return processFormData(values)
  }

  renderStep(this: HarnessApproval, props: StepProps<HarnessApprovalData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <HarnessApprovalDeploymentMode
          stepViewType={stepViewType}
          initialValues={processForInitialValues(initialValues, true)}
          onUpdate={values => onUpdate?.(processFormData(values))}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const customStepPropsTyped = customStepProps as HarnessApprovalVariableListModeProps
      return (
        <VariablesListTable
          data={flatObject(customStepPropsTyped.variablesData)}
          originalData={initialValues}
          metadataMap={customStepPropsTyped.metadataMap}
        />
      )
    }
    return (
      <HarnessApprovalStepModeWithRef
        ref={formikRef}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        initialValues={processForInitialValues(initialValues)}
        onUpdate={values => onUpdate?.(values)}
      />
    )
  }
}
