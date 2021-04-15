import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import {
  Avatar,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiSelectOption,
  MultiTypeInputType,
  Text
} from '@wings-software/uicore'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useStrings } from 'framework/exports'
import Map from '@common/components/Map/Map'
import { useGetUserGroupList } from 'services/cd-ng'
import type { HarnessApprovalDeploymentModeProps, UGMultiSelectProps } from './types'
import { isArrayOfStrings } from './helper'
import css from './HarnessApproval.module.scss'

const UGMultiSelect = ({
  initialValues,
  inputSetData,
  userGroupsResponse,
  userGroupsFetchError,
  fetchingUserGroups,
  onUpdate
}: UGMultiSelectProps) => {
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
      if (isArrayOfStrings(initialValues.spec.approvers.userGroups)) {
        // When we open the form, we'll get the userGroups as string[] as saved in BE
        // Convert the same as MultiSelectOption[], and update the formik values for auto populate
        const selectedUgOptions: MultiSelectOption[] = []
        initialValues.spec.approvers.userGroups.forEach(ugIdentifier => {
          const matchedOption = options.find(opt => opt.value === ugIdentifier)
          if (matchedOption) {
            selectedUgOptions.push(matchedOption)
          }
        })

        onUpdate?.({
          ...initialValues,
          spec: {
            ...initialValues.spec,
            approvers: {
              ...initialValues.spec.approvers,
              userGroups: selectedUgOptions
            }
          }
        })
      }
    }
  }, [userGroupsResponse?.data?.content])

  return (
    <FormInput.MultiSelect
      className={css.multiSelect}
      name={`${prefix}spec.approvers.userGroups`}
      label={getString('common.userGroups')}
      disabled={readonly}
      items={
        fetchingUserGroups
          ? [{ label: getString('pipeline.approvalStep.fetchingUserGroups'), value: '', disabled: true }]
          : userGroupOptions
      }
      multiSelectProps={{
        placeholder: fetchingUserGroups
          ? getString('pipeline.approvalStep.fetchingUserGroups')
          : userGroupsFetchError?.message
          ? getString('pipeline.approvalStep.fetchUserGroupsFailed')
          : getString('pipeline.approvalStep.addUserGroups'),
        // eslint-disable-next-line react/display-name
        tagRenderer: item => (
          <Layout.Horizontal key={item.label?.toString()} spacing="small">
            <Avatar email={item.label?.toString()} size="xsmall" hoverCard={false} />
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        ),
        // eslint-disable-next-line react/display-name
        itemRender: (item, { handleClick }) => (
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
        )
      }}
      onChange={values => {
        onUpdate?.({
          ...initialValues,
          spec: {
            ...initialValues.spec,
            approvers: {
              ...initialValues.spec.approvers,
              userGroups: (values as MultiSelectOption[]).map(val => val.value?.toString())
            }
          }
        })
      }}
    />
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

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()

  const { data: userGroupsResponse, loading: fetchingUserGroups, error: userGroupsFetchError } = useGetUserGroupList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
          className={css.md}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.approvalMessage) === MultiTypeInputType.RUNTIME ? (
        <FormInput.TextArea
          className={cx(css.approvalMessage, css.md)}
          label={getString('pipeline.approvalStep.message')}
          name={`${prefix}spec.approvalMessage`}
          disabled={readonly}
        />
      ) : null}
      {getMultiTypeFromValue(template?.spec?.includePipelineExecutionHistory) === MultiTypeInputType.RUNTIME ? (
        <FormInput.CheckBox
          className={cx(css.execHistoryCheckbox, css.md)}
          label={getString('pipeline.approvalStep.includePipelineExecutionHistory')}
          name={`${prefix}spec.includePipelineExecutionHistory`}
          disabled={readonly}
        />
      ) : null}

      {typeof template?.spec?.approvers.userGroups === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.userGroups) === MultiTypeInputType.RUNTIME ? (
        <UGMultiSelect
          {...props}
          userGroupsResponse={userGroupsResponse}
          fetchingUserGroups={fetchingUserGroups}
          userGroupsFetchError={userGroupsFetchError}
        />
      ) : null}

      {typeof template?.spec?.approvers.minimumCount === 'string' &&
      getMultiTypeFromValue(template?.spec?.approvers.minimumCount) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Text
          label={getString('pipeline.approvalStep.minimumCount')}
          name={`${prefix}spec.approvers.minimumCount`}
          disabled={readonly}
          className={css.md}
          onChange={event => {
            const changedValue = (event.target as HTMLInputElement).value
            onUpdate?.({
              ...initialValues,
              spec: {
                ...initialValues.spec,
                approvers: { ...initialValues.spec.approvers, minimumCount: changedValue ? Number(changedValue) : 1 }
              }
            })
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.approvers.disallowPipelineExecutor) === MultiTypeInputType.RUNTIME ? (
        <FormInput.CheckBox
          className={cx(css.execHistoryCheckbox, css.md)}
          label={getString('pipeline.approvalStep.disallowPipelineExecutor')}
          name={`${prefix}spec.approvers.disallowPipelineExecutor`}
          disabled={readonly}
        />
      ) : null}

      {typeof template?.spec.approverInputs === 'string' &&
      getMultiTypeFromValue(template?.spec.approverInputs) === MultiTypeInputType.RUNTIME ? (
        <Map
          name={`${isEmpty(path) ? '' : `${path}.`}spec.approverInputs`}
          label={getString('pipeline.approvalStep.approverInputs')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          valueLabel="Defaault value"
          keyLabel="Variable name"
        />
      ) : null}
    </React.Fragment>
  )
}
