import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import UserGroupsInput from '@common/components/UserGroupsInput/UserGroupsInput'
import { useStrings } from 'framework/strings'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import type { HarnessApprovalDeploymentModeProps } from './types'
import css from './HarnessApproval.module.scss'

/*
Used for input sets and deployment form
Provide values for all runtime fields in approval step
Open the same form in readonly view while viewing already run executions
*/
export default function HarnessApprovalDeploymentMode(props: HarnessApprovalDeploymentModeProps): JSX.Element {
  const { inputSetData } = props
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          className={css.deploymentViewMedium}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.approvalMessage) === MultiTypeInputType.RUNTIME ? (
        <FormInput.TextArea
          className={cx(css.approvalMessage, css.deploymentViewMedium)}
          label={getString('pipeline.approvalStep.message')}
          name={`${prefix}spec.approvalMessage`}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
      ) : null}

      {typeof template?.spec?.approvers?.userGroups === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers?.userGroups) === MultiTypeInputType.RUNTIME ? (
        <UserGroupsInput
          name={`${prefix}spec.approvers.userGroups`}
          label={getString('common.userGroups')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          tooltipProps={{ dataTooltipId: 'harnessApprovalRuntime_userGroups' }}
          formGroupClass={css.deploymentViewMedium}
        />
      ) : null}

      {typeof template?.spec?.approvers?.minimumCount === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers?.minimumCount) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Text
          label={getString('pipeline.approvalStep.minimumCount')}
          name={`${prefix}spec.approvers.minimumCount`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          className={css.deploymentViewMedium}
          inputGroup={{
            type: 'number',
            min: 1
          }}
        />
      ) : null}
    </React.Fragment>
  )
}
