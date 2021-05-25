import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { Menu } from '@blueprintjs/core'
import {
  Avatar,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiSelect,
  MultiSelectOption,
  MultiTypeInputType,
  Text
} from '@wings-software/uicore'
import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetUserGroupList } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import type { HarnessApprovalDeploymentModeProps, UGMUltiSelectProps } from './types'
import css from './HarnessApproval.module.scss'

const UGMultiSelect = ({
  initialValues,
  inputSetData,
  userGroupsResponse,
  userGroupsFetchError,
  fetchingUserGroups,
  onUpdate
}: UGMUltiSelectProps) => {
  const [userGroupOptions, setUserGroupOptions] = useState<MultiSelectOption[]>([])
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  useEffect(() => {
    if (userGroupsResponse?.data?.content) {
      const userGroupsContent = userGroupsResponse?.data?.content
      const options: MultiSelectOption[] = userGroupsContent
        ? userGroupsContent.map(ug => ({ label: ug.name || '', value: ug.identifier || '' }))
        : []
      setUserGroupOptions(options)
    }
  }, [userGroupsResponse?.data?.content])

  const getSelectedValue = (userGroupIds: string[]): MultiSelectOption[] => {
    const toReturn: MultiSelectOption[] = []
    if (!Array.isArray(userGroupIds)) {
      return toReturn
    }
    userGroupIds?.forEach(idd => {
      const selectedUg = userGroupOptions?.find(ugOption => ugOption.value === idd)
      if (selectedUg) {
        toReturn.push(selectedUg)
      }
    })
    return toReturn
  }

  return (
    <div className={css.deploymentModeUgSelectWrapper}>
      <label className={css.ugLabel}>{getString('common.userGroups')}</label>
      <MultiSelect
        className={cx(css.multiSelectDeploymentMode, css.deploymentViewMedium)}
        value={getSelectedValue(initialValues.spec.approvers?.userGroups as string[])}
        name={`${prefix}spec.approvers.userGroups`}
        placeholder={
          fetchingUserGroups
            ? getString('pipeline.approvalStep.fetchingUserGroups')
            : userGroupsFetchError?.message
            ? getString('pipeline.approvalStep.fetchUserGroupsFailed')
            : getString('pipeline.approvalStep.addUserGroups')
        }
        tagRenderer={item => (
          <Layout.Horizontal key={item.label?.toString()} spacing="small">
            <Avatar email={item.label?.toString()} size="xsmall" hoverCard={false} />
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        )}
        itemRender={(item, { handleClick }) => (
          <div key={item.label.toString()}>
            <Menu.Item
              text={
                <Layout.Horizontal spacing="small" className={css.align}>
                  <Avatar email={item.label?.toString()} size="small" hoverCard={false} />
                  <Text>{item.label}</Text>
                </Layout.Horizontal>
              }
              onClick={handleClick}
            />
          </div>
        )}
        disabled={isApprovalStepFieldDisabled(readonly)}
        items={
          fetchingUserGroups
            ? [{ label: getString('pipeline.approvalStep.fetchingUserGroups'), value: '', disabled: true }]
            : userGroupOptions
        }
        onChange={values => {
          onUpdate?.({
            ...initialValues,
            spec: {
              ...initialValues.spec,
              approvers: {
                ...initialValues.spec.approvers,
                userGroups: values
              }
            }
          })
        }}
      />
    </div>
  )
}

/*
Used for iput sets and deployment form
Provide values for all runtime fields in approval step
Open the same form in readonly view while viewing already run executions
*/
export default function HarnessApprovalDeploymentMode(props: HarnessApprovalDeploymentModeProps): JSX.Element {
  const { inputSetData, onUpdate, initialValues } = props
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()

  const { data: userGroupsResponse, loading: fetchingUserGroups, error: userGroupsFetchError } = useGetUserGroupList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

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
        <UGMultiSelect
          userGroupsFetchError={userGroupsFetchError}
          fetchingUserGroups={fetchingUserGroups}
          userGroupsResponse={userGroupsResponse}
          onUpdate={onUpdate}
          initialValues={initialValues}
          inputSetData={inputSetData}
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
            type: 'number'
          }}
        />
      ) : null}
    </React.Fragment>
  )
}
