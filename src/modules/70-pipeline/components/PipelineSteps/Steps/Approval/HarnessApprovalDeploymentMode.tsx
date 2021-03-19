import React from 'react'
import { isEmpty } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useStrings } from 'framework/exports'
import Map from '@common/components/Map/Map'
import type { HarnessApprovalDeploymentModeProps } from './types'
import css from './HarnessApproval.module.scss'

/*
Used for iput sets and deployment form
Provide values for all runtime fields in approval step
Open the same form in readonly view while viewing already run executions
*/
export default function HarnessApprovalDeploymentMode(props: HarnessApprovalDeploymentModeProps): JSX.Element {
  const { inputSetData } = props
  const template = inputSetData?.template
  const path = inputSetData?.path
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.spec?.approvalMessage) === MultiTypeInputType.RUNTIME ? (
        <FormInput.TextArea
          className={css.approvalMessage}
          label={getString('approvalStep.message')}
          name="spec.approvalMessage"
          disabled={readonly}
        />
      ) : null}
      {getMultiTypeFromValue(template?.spec?.includePipelineExecutionHistory) === MultiTypeInputType.RUNTIME ? (
        <FormInput.CheckBox
          className={css.execHistoryCheckbox}
          label={getString('approvalStep.includePipelineExecutionHistory')}
          name="spec.includePipelineExecutionHistory"
          disabled={readonly}
        />
      ) : null}
      {typeof template?.spec?.approvers.users === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.users) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiSelect
          label={getString('users')}
          name="spec.approvers.users"
          style={{ resize: 'vertical' }}
          placeholder="Add Users"
          items={[
            { label: 'u1', value: 'u1' },
            { label: 'u2', value: 'u2' }
          ]}
          // onChange={}
          disabled={readonly}
        />
      ) : null}

      {typeof template?.spec?.approvers.userGroups === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.userGroups) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiSelect
          label={getString('approvalStep.userGroups')}
          name="spec.approvers.userGroups"
          style={{ resize: 'vertical' }}
          placeholder="Add Groups"
          items={[
            { label: 'ug1', value: 'ug1' },
            { label: 'ug2', value: 'ug2' }
          ]}
          // onChange={}
          disabled={readonly}
        />
      ) : null}

      {typeof template?.spec?.approvers.minimumCount === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.minimumCount) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Text
          label={getString('approvalStep.minimumCount')}
          name="spec.approvers.minimumCount"
          disabled={readonly}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.approvers.disallowPipelineExecutor) === MultiTypeInputType.RUNTIME ? (
        <FormInput.CheckBox
          className={css.execHistoryCheckbox}
          label={getString('approvalStep.disallowPipelineExecutor')}
          name="spec.approvers.disallowPipelineExecutor"
          disabled={readonly}
        />
      ) : null}

      {typeof template?.spec.approverInputs === 'string' &&
      getMultiTypeFromValue(template?.spec.approverInputs) === MultiTypeInputType.RUNTIME ? (
        <Map
          name={`${isEmpty(path) ? '' : `${path}.`}spec.approverInputs`}
          label={getString('approvalStep.approverInputs')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          valueLabel="Defaault value"
          keyLabel="Variable name"
        />
      ) : null}

      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name="timeout"
          disabled={readonly}
        />
      ) : null}
    </React.Fragment>
  )
}
