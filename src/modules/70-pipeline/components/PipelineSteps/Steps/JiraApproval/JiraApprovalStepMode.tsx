import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { Formik, Accordion, FormInput } from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/exports'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  JiraProjectBasicNG,
  JiraProjectNG,
  JiraStatusNG,
  JiraFieldNG,
  useGetJiraProjects,
  useGetJiraIssueCreateMetadata
} from 'services/cd-ng'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ApprovalRejectionCriteria } from './ApprovalRejectionCriteria'
import {
  JiraApprovalStepModeProps,
  JiraApprovalData,
  JiraProjectSelectOption,
  JiraFormContentInterface,
  ApprovalRejectionCriteriaType
} from './types'
import { getGenuineValue, resetForm, setIssueTypeOptions } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './JiraApproval.module.scss'

const FormContent = ({
  formik,
  refetchProjects,
  refetchProjectMetadata,
  projectsResponse,
  projectMetaResponse,
  fetchingProjects,
  fetchingProjectMetadata
}: JiraFormContentInterface) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
  const [statusList, setStatusList] = useState<JiraStatusNG[]>([])
  const [fieldList, setFieldList] = useState<JiraFieldNG[]>([])
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [projectMetadata, setProjectMetadata] = useState<JiraProjectNG>()

  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const projectKeyFixedValue =
    typeof formik.values.spec.projectKey === 'object'
      ? (formik.values.spec.projectKey as JiraProjectSelectOption).key
      : undefined
  const issueTypeFixedValue =
    typeof formik.values.spec.issueType === 'object'
      ? (formik.values.spec.issueType as JiraProjectSelectOption).key
      : undefined

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
          projectKey: projectKeyFixedValue.toString(),
          fetchStatus: true
        }
      })
    }
  }, [projectKeyFixedValue])

  useEffect(() => {
    // If issuetype changes in form, set status and field list
    if (issueTypeFixedValue) {
      const issueTypeData = projectMetadata?.issuetypes[issueTypeFixedValue]
      setStatusList(issueTypeData?.statuses || [])
      const fieldListToSet: JiraFieldNG[] = []
      const fieldKeys = Object.keys(issueTypeData?.fields || {})
      fieldKeys.forEach(keyy => {
        if (issueTypeData?.fields[keyy]) {
          fieldListToSet.push(issueTypeData?.fields[keyy])
        }
      })
      setFieldList(fieldListToSet)
    }
  }, [issueTypeFixedValue, projectMetadata])

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
      const projectMD: JiraProjectNG = projectMetaResponse?.data?.projects[projectKeyFixedValue]
      setProjectMetadata(projectMD)
    }
  }, [projectMetaResponse?.data])

  return (
    <React.Fragment>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.InputWithIdentifier inputLabel={getString('name')} />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField name="timeout" label={getString('pipelineSteps.timeoutLabel')} />
      </div>
      <Accordion activeId="step-1" className={stepCss.accordion}>
        <Accordion.Panel
          id="step-1"
          summary={getString('pipeline.jiraApprovalStep.connectToJira')}
          details={
            <div>
              <FormMultiTypeConnectorField
                name="spec.connectorRef"
                label={getString('pipeline.jiraApprovalStep.connectorRef')}
                className={css.connector}
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                multiTypeProps={{ expressions }}
                type="Jira"
                enableConfigureOptions={false}
                selected={formik?.values?.spec.connectorRef as string}
                onChange={_unused => {
                  // Clear dependent fields
                  resetForm(formik, 'connectorRef')
                }}
              />
              <FormInput.MultiTypeInput
                selectItems={fetchingProjects ? [{ label: 'Fetching Projects...', value: '' }] : projectOptions}
                label={getString('pipeline.jiraApprovalStep.project')}
                name="spec.projectKey"
                placeholder={fetchingProjects ? 'Fetching Projects...' : 'Projects'}
                className={css.md}
                disabled={fetchingProjects}
                multiTypeInputProps={{
                  onChange: _unused => {
                    // Clear dependent fields
                    resetForm(formik, 'projectKey')
                  }
                }}
              />
              <FormInput.MultiTypeInput
                selectItems={
                  fetchingProjectMetadata
                    ? [{ label: 'Fetching Issue Types...', value: '' }]
                    : setIssueTypeOptions(projectMetadata?.issuetypes)
                }
                label={getString('pipeline.jiraApprovalStep.issueType')}
                name="spec.issueType"
                placeholder={fetchingProjectMetadata ? 'Fetching Issue Types...' : 'Issue Type'}
                className={css.md}
                disabled={fetchingProjectMetadata}
                multiTypeInputProps={{
                  onChange: _unused => {
                    // Clear dependent fields
                    resetForm(formik, 'issueType')
                  }
                }}
              />
              <FormInput.MultiTextInput
                label={getString('pipeline.jiraApprovalStep.issueKey')}
                name="spec.issueKey"
                placeholder="Enter Issue Key/ID"
                className={css.md}
              />
            </div>
          }
        />
        <Accordion.Panel
          id="step-2"
          summary={getString('pipeline.jiraApprovalStep.approvalCriteria')}
          details={
            <ApprovalRejectionCriteria
              statusList={statusList}
              fieldList={fieldList}
              isFetchingFields={fetchingProjectMetadata}
              mode="approvalCriteria"
              values={formik.values.spec.approvalCriteria}
              onChange={values => formik.setFieldValue('spec.approvalCriteria', values)}
              formikErrors={formik.errors.spec?.approvalCriteria?.spec}
            />
          }
        />

        <Accordion.Panel
          id="step-3"
          summary={getString('pipeline.jiraApprovalStep.rejectionCriteria')}
          details={
            <ApprovalRejectionCriteria
              statusList={statusList}
              fieldList={fieldList}
              isFetchingFields={fetchingProjectMetadata}
              mode="rejectionCriteria"
              values={formik.values.spec.rejectionCriteria}
              onChange={values => formik.setFieldValue('spec.rejectionCriteria', values)}
            />
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

/*
functional component as this component doesn't need a state of it's own.
everything is governed from the parent
*/
function JiraApprovalStepMode(props: JiraApprovalStepModeProps, formikRef: StepFormikFowardRef<JiraApprovalData>) {
  const { onUpdate } = props
  const { getString } = useStrings()
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
      projectKey: '',
      fetchStatus: true
    }
  })

  return (
    <Formik<JiraApprovalData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={props.initialValues}
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.connectorRef')),
          projectKey: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.project')),
          issueType: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.issueType')),
          issueKey: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.issueKey')),
          approvalCriteria: Yup.object().shape({
            spec: Yup.object().when('type', {
              is: ApprovalRejectionCriteriaType.KeyValues,
              then: Yup.object().shape({
                conditions: Yup.array().required(
                  getString('pipeline.jiraApprovalStep.validations.approvalCriteriaCondition')
                )
              }),
              otherwise: Yup.object().shape({
                expression: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.expression'))
              })
            })
          })
        })
      })}
    >
      {(formik: FormikProps<JiraApprovalData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormContent
            formik={formik}
            refetchProjects={refetchProjects}
            refetchProjectMetadata={refetchProjectMetadata}
            fetchingProjects={fetchingProjects}
            fetchingProjectMetadata={fetchingProjectMetadata}
            projectMetaResponse={projectMetaResponse}
            projectsResponse={projectsResponse}
            projectsFetchError={projectsFetchError}
            projectMetadataFetchError={projectMetadataFetchError}
          />
        )
      }}
    </Formik>
  )
}

const JiraApprovalStepModeWithRef = React.forwardRef(JiraApprovalStepMode)
export default JiraApprovalStepModeWithRef
