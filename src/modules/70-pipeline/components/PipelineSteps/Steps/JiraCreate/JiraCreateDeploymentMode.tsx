import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, set } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
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
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [projectMetadata, setProjectMetadata] = useState<JiraProjectNG>()

  const [selectedProjectValue, setSelectedProjectValue] = useState<JiraProjectSelectOption>()
  const [selectedIssueTypeValue, setSelectedIssueTypeValue] = useState<JiraProjectSelectOption>()

  const connectorRefFixedValue = getGenuineValue(
    initialValues.spec?.connectorRef || (inputSetData?.allValues?.spec?.connectorRef as string)
  )
  const projectKeyFixedValue = initialValues.spec?.projectKey || inputSetData?.allValues?.spec?.projectKey

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
    const matched = options?.find(opt => opt.key === projectKeyFixedValue)
    if (matched) {
      setSelectedProjectValue(matched)
    }
  }, [projectsResponse?.data])

  useEffect(() => {
    if (projectKeyFixedValue && projectMetaResponse?.data?.projects) {
      const projectMD: JiraProjectNG = projectMetaResponse?.data?.projects[projectKeyFixedValue as string]
      setProjectMetadata(projectMD)

      const issueTypeOptions = setIssueTypeOptions(projectMD?.issuetypes)
      const matched = issueTypeOptions.find(opt => opt.key === initialValues?.spec?.issueType)
      if (matched) {
        setSelectedIssueTypeValue(matched)
      }
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
          selected={(initialValues?.spec?.connectorRef as string) || ''}
          placeholder={getString('pipeline.jiraApprovalStep.jiraConnectorPlaceholder')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={360}
          disabled={isApprovalStepFieldDisabled(readonly)}
          type={'Jira'}
          onChange={(record, scope) => {
            const connectorRef =
              scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier
            set(initialValues, 'spec.connectorRef', connectorRef)
            onUpdate?.(initialValues)
          }}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      ) : null}
      {getMultiTypeFromValue(template?.spec?.projectKey) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Select
          items={projectOptions}
          className={css.deploymentViewMedium}
          label={getString('pipeline.jiraApprovalStep.project')}
          name={`${prefix}spec.projectKey`}
          value={selectedProjectValue}
          selectProps={{
            inputProps: {
              placeholder: fetchingProjects
                ? getString('pipeline.jiraApprovalStep.fetchingProjectsPlaceholder')
                : projectsFetchError?.message
                ? projectsFetchError?.message
                : getString('pipeline.jiraCreateStep.selectProject')
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          onChange={(opt: SelectOption) => {
            setSelectedProjectValue(opt as JiraProjectSelectOption)
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
          placeholder={getString('pipeline.jiraApprovalStep.issueTypePlaceholder')}
          label={getString('pipeline.jiraApprovalStep.issueType')}
          name={`${prefix}spec.issueType`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          value={selectedIssueTypeValue}
          selectProps={{
            inputProps: {
              placeholder: fetchingProjectMetadata
                ? getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder')
                : projectMetadataFetchError?.message
                ? projectMetadataFetchError?.message
                : getString('pipeline.jiraApprovalStep.issueTypePlaceholder')
            }
          }}
          onChange={(opt: SelectOption) => {
            setSelectedIssueTypeValue(opt as JiraProjectSelectOption)
            onUpdate?.({
              ...initialValues,
              spec: { ...initialValues.spec, issueType: (opt as JiraProjectSelectOption).key.toString() }
            })
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.fields?.find(field => field.name === 'Summary')?.value as string) ===
      MultiTypeInputType.RUNTIME ? (
        <FormInput.Text
          label={getString('summary')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.summary`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('pipeline.jiraCreateStep.summaryPlaceholder')}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.fields?.find(field => field.name === 'Description')?.value as string) ===
      MultiTypeInputType.RUNTIME ? (
        <FormInput.TextArea
          label={getString('description')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.description`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('common.descriptionPlaceholder')}
        />
      ) : null}
    </React.Fragment>
  )
}

export default function JiraCreateDeploymentMode(props: JiraCreateDeploymentModeProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
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
