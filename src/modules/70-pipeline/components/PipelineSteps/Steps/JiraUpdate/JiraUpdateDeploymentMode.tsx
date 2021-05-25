import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, set } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { JiraStatusNG, useGetJiraStatuses } from 'services/cd-ng'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JiraUpdateDeploymentModeFormContentInterface, JiraUpdateDeploymentModeProps } from './types'
import css from '../JiraCreate/JiraCreate.module.scss'

const FormContent = (formContentProps: JiraUpdateDeploymentModeFormContentInterface) => {
  const {
    inputSetData,
    onUpdate,
    initialValues,
    statusResponse,
    fetchingStatuses,
    refetchStatuses,
    statusFetchError
  } = formContentProps
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([])
  const connectorRefFixedValue = getGenuineValue(initialValues.spec.connectorRef)

  useEffect(() => {
    // If connector value changes in form, fetch projects
    if (connectorRefFixedValue) {
      refetchStatuses({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // get status by connector ref response
    let options: SelectOption[] = []
    const statusResponseList: JiraStatusNG[] = statusResponse?.data || []
    options =
      statusResponseList.map((status: JiraStatusNG) => ({
        label: status.name || '',
        value: status.id || ''
      })) || []

    setStatusOptions(options)
  }, [statusResponse?.data])

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

      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
        <ConnectorReferenceField
          name={`${prefix}spec.conectorRef`}
          label={getString('pipeline.jiraApprovalStep.connectorRef')}
          selected={(initialValues.spec.connectorRef as string) || ''}
          placeholder={getString('pipeline.jiraApprovalStep.connectorRef')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={400}
          disabled={isApprovalStepFieldDisabled(readonly)}
          type={'Jira'}
          onChange={(record, scope) => {
            const connectorRef =
              scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier
            set(initialValues, 'spec.connectorRef', connectorRef)
            onUpdate?.(initialValues)
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.issueKey) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Text
          label={getString('pipeline.jiraApprovalStep.issueKey')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.issueKey`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('pipeline.jiraApprovalStep.issueKey')}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.transitionTo?.status) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Select
          items={statusOptions}
          className={css.deploymentViewMedium}
          label={getString('pipeline.jiraApprovalStep.issueType')}
          name={`${prefix}spec.transitionTo.status`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          selectProps={{
            // Need this to show the current selection when we switch from yaml to UI view
            defaultSelectedItem: {
              label: initialValues.spec.transitionTo?.status?.toString() || '',
              value: initialValues.spec.transitionTo?.status?.toString() || ''
            },
            inputProps: {
              placeholder: fetchingStatuses
                ? getString('pipeline.jiraUpdateStep.fetchingStatus')
                : statusFetchError?.message
                ? statusFetchError.message
                : getString('status')
            }
          }}
          onChange={(opt: SelectOption) => {
            onUpdate?.({
              ...initialValues,
              spec: {
                ...initialValues.spec,
                transitionTo: initialValues.spec.transitionTo
                  ? { ...initialValues.spec.transitionTo, status: (opt as SelectOption).value?.toString() }
                  : undefined
              }
            })
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec.transitionTo?.transitionName) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Text
          placeholder={getString('pipeline.jiraUpdateStep.transitionLabel')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.transitionTo.transitionName`}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
      ) : null}
    </React.Fragment>
  )
}

export default function JiraUpdateDeploymentMode(props: JiraUpdateDeploymentModeProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }

  const {
    refetch: refetchStatuses,
    data: statusResponse,
    error: statusFetchError,
    loading: fetchingStatuses
  } = useGetJiraStatuses({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  return (
    <FormContent
      {...props}
      refetchStatuses={refetchStatuses}
      statusResponse={statusResponse}
      statusFetchError={statusFetchError}
      fetchingStatuses={fetchingStatuses}
    />
  )
}
