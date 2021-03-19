import React from 'react'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import { yupToFormErrors } from 'formik'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@wings-software/uicore'
import { StepProps, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { UseStringsReturn } from 'framework/exports'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { PipelineStep } from '../../PipelineStep'
import { StepType } from '../../PipelineStepInterface'
import { flatObject } from './helper'
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
      includePipelineExecutionHistory: false,
      approvers: {
        userGroups: [],
        users: [],
        minimumCount: 1,
        disallowPipelineExecutor: true
      },
      approverInputs: [{ name: '', value: '' }]
    }
  }

  validateInputSet(
    data: HarnessApprovalData,
    template: HarnessApprovalData,
    getString?: UseStringsReturn['getString']
  ): object {
    const errors = { spec: {} } as any

    if (
      typeof template?.spec?.approvers.users === 'string' &&
      typeof template?.spec?.approvers.userGroups === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.users) === MultiTypeInputType.RUNTIME &&
      getMultiTypeFromValue(template?.spec?.approvers.userGroups) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.approvers.users) &&
      isEmpty(data?.spec?.approvers.userGroups)
    ) {
      // If both users and userGroups are runtime, and both of them are not provided in input set
      errors.spec.approvers = getString?.('approvalStep.validation.usersOrUserGroups')
    }

    if (
      typeof template?.spec?.approvers.minimumCount === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.minimumCount) === MultiTypeInputType.RUNTIME
    ) {
      if (isEmpty(data?.spec?.approvers.minimumCount)) {
        errors.spec.minimumCount = getString?.('approvalStep.validation.minimumCountRequired')
      } else if (data?.spec?.approvers.minimumCount < 1) {
        errors.spec.minimumCount = getString?.('approvalStep.validation.minimumCountOne')
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

  renderStep(this: HarnessApproval, props: StepProps<HarnessApprovalData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <HarnessApprovalDeploymentMode
          stepViewType={stepViewType}
          initialValues={initialValues}
          onUpdate={onUpdate}
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
        stepViewType={stepViewType}
        initialValues={initialValues}
        onUpdate={onUpdate}
      />
    )
  }
}
