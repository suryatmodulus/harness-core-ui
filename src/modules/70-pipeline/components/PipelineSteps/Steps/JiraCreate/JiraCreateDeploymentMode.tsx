import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, set } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { JiraProjectBasicNG, JiraProjectNG, useGetJiraIssueCreateMetadata, useGetJiraProjects } from 'services/cd-ng'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getGenuineValue, setIssueTypeOptions } from '../JiraApproval/helper'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import type { JiraCreateDeploymentModeProps, JiraCreateDeploymentModeFormContentInterface } from './types'
import css from './JiraCreate.module.scss'

const FormContent = (formContentProps: JiraCreateDeploymentModeFormContentInterface) => {
  const {
    inputSetData,
    onUpdate,
    initialValues,
    projectMetaResponse,
    projectsResponse,
    refetchProjects,
    refetchProjectMetadata,
    fetchingProjectMetadata,
    fetchingProjects,
    projectMetadataFetchError,
    projectsFetchError
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
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [projectMetadata, setProjectMetadata] = useState<JiraProjectNG>()

  const connectorRefFixedValue = getGenuineValue(
    initialValues.spec.connectorRef || (inputSetData?.allValues?.spec.connectorRef as string)
  )
  const projectKeyFixedValue = initialValues.spec.projectKey || inputSetData?.allValues?.spec.projectKey

  useEffect(() => {
    // If connector value changes in form, fetch projects
    if (connectorRefFixedValue) {
      refetchProjects({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // If project value changes in form, fetch metadata
    if (connectorRefFixedValue && projectKeyFixedValue) {
      refetchProjectMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString()
        }
      })
    }
  }, [projectKeyFixedValue])

  useEffect(() => {
    let options: JiraProjectSelectOption[] = []
    const projectResponseList: JiraProjectBasicNG[] = projectsResponse?.data || []
    options =
      projectResponseList.map((project: JiraProjectBasicNG) => ({
        label: project.name || '',
        value: project.id || '',
        key: project.key || ''
      })) || []

    setProjectOptions(options)
  }, [projectsResponse?.data])

  useEffect(() => {
    if (projectKeyFixedValue && projectMetaResponse?.data?.projects) {
      const projectMD: JiraProjectNG = projectMetaResponse?.data?.projects[projectKeyFixedValue as string]
      setProjectMetadata(projectMD)
    }
  }, [projectMetaResponse?.data])
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
          placeholder={getString('select')}
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
      {getMultiTypeFromValue(template?.spec?.projectKey) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Select
          items={projectOptions}
          className={css.deploymentViewMedium}
          label={getString('pipeline.jiraApprovalStep.project')}
          name={`${prefix}spec.projectKey`}
          selectProps={{
            // Need this to show the current selection when we switch from yaml to UI view
            defaultSelectedItem: {
              label: initialValues.spec.projectKey?.toString(),
              value: initialValues.spec.projectKey?.toString()
            },
            inputProps: {
              placeholder: fetchingProjects
                ? getString('pipeline.jiraApprovalStep.fetchingProjectsPlaceholder')
                : projectsFetchError?.message
                ? projectsFetchError?.message
                : getString('select')
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          onChange={(opt: SelectOption) => {
            onUpdate?.({
              ...initialValues,
              spec: { ...initialValues.spec, projectKey: (opt as JiraProjectSelectOption).key.toString() }
            })
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.issueType) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Select
          items={setIssueTypeOptions(projectMetadata?.issuetypes)}
          className={css.deploymentViewMedium}
          placeholder={getString('select')}
          label={getString('pipeline.jiraApprovalStep.issueType')}
          name={`${prefix}spec.issueType`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          selectProps={{
            // Need this to show the current selection when we switch from yaml to UI view
            defaultSelectedItem: {
              label: initialValues.spec.issueType?.toString(),
              value: initialValues.spec.issueType?.toString()
            },
            inputProps: {
              placeholder: fetchingProjectMetadata
                ? getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder')
                : projectMetadataFetchError?.message
                ? projectMetadataFetchError?.message
                : getString('select')
            }
          }}
          onChange={(opt: SelectOption) => {
            onUpdate?.({
              ...initialValues,
              spec: { ...initialValues.spec, issueType: (opt as JiraProjectSelectOption).key.toString() }
            })
          }}
        />
      ) : null}
    </React.Fragment>
  )
}

export default function JiraCreateDeploymentMode(props: JiraCreateDeploymentModeProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }

  const {
    refetch: refetchProjects,
    data: projectsResponse,
    error: projectsFetchError,
    loading: fetchingProjects
  } = useGetJiraProjects({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchProjectMetadata,
    data: projectMetaResponse,
    error: projectMetadataFetchError,
    loading: fetchingProjectMetadata
  } = useGetJiraIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      projectKey: ''
    }
  })

  return (
    <FormContent
      {...props}
      refetchProjects={refetchProjects}
      projectsResponse={projectsResponse}
      projectsFetchError={projectsFetchError}
      fetchingProjects={fetchingProjects}
      refetchProjectMetadata={refetchProjectMetadata}
      projectMetaResponse={projectMetaResponse}
      projectMetadataFetchError={projectMetadataFetchError}
      fetchingProjectMetadata={fetchingProjectMetadata}
    />
  )
}
