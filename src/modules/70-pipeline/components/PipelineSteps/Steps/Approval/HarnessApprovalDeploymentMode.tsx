/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components'
import { FormMultiTypeUserGroupInput } from '@common/components/UserGroupsInput/FormMultitypeUserGroupInput'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import type { HarnessApprovalDeploymentModeProps } from './types'
import css from './HarnessApproval.module.scss'

/*
Used for input sets and deployment form
Provide values for all runtime fields in approval step
Open the same form in readonly view while viewing already run executions
*/
export default function HarnessApprovalDeploymentMode(props: HarnessApprovalDeploymentModeProps): JSX.Element {
  const { inputSetData, allowableTypes, formik } = props
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeDurationField
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          className={css.deploymentViewMedium}
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            allowableTypes,
            expressions,
            disabled: isApprovalStepFieldDisabled(readonly)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.approvalMessage) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeTextAreaField
          className={cx(css.approvalMessage, css.deploymentViewMedium)}
          label={getString('pipeline.approvalStep.message')}
          name={`${prefix}spec.approvalMessage`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeTextArea={{
            expressions,
            allowableTypes
          }}
        />
      ) : null}

      {typeof template?.spec?.approvers?.userGroups === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers?.userGroups) === MultiTypeInputType.RUNTIME ? (
        <div className={css.deploymentViewMedium}>
          <FormMultiTypeUserGroupInput
            expressions={expressions}
            formik={formik}
            allowableTypes={allowableTypes}
            name={`${prefix}spec.approvers.userGroups`}
            label={getString('common.userGroups')}
            disabled={isApprovalStepFieldDisabled(readonly)}
            tooltipProps={{ dataTooltipId: 'harnessApprovalRuntime_userGroups' }}
          />
        </div>
      ) : null}

      {typeof template?.spec?.approvers?.minimumCount === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers?.minimumCount) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTextInput
          label={getString('pipeline.approvalStep.minimumCount')}
          name={`${prefix}spec.approvers.minimumCount`}
          multiTextInputProps={{
            disabled: isApprovalStepFieldDisabled(readonly),
            expressions,
            allowableTypes,
            textProps: { type: 'number' }
          }}
          className={css.deploymentViewMedium}
        />
      ) : null}
    </React.Fragment>
  )
}
