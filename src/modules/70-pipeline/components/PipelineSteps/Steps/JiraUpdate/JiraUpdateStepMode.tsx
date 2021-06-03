import React, { useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import * as Yup from 'yup'
import { FieldArray, FormikProps } from 'formik'
import {
  Formik,
  Accordion,
  FormInput,
  useModalHook,
  Text,
  MultiTypeInputType,
  Button,
  SelectOption,
  Layout,
  getMultiTypeFromValue
} from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { String, useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { JiraProjectBasicNG, JiraFieldNG, useGetJiraProjects, useGetJiraStatuses, JiraStatusNG } from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useQueryParams } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JiraCreateFieldType } from '../JiraCreate/types'
import { getKVFieldsToBeAddedInForm, getSelectedFieldsToBeAddedInForm } from '../JiraCreate/helper'
import { JiraDynamicFieldsSelector } from '../JiraCreate/JiraDynamicFieldsSelector'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import { JiraFieldsRenderer } from '../JiraCreate/JiraFieldsRenderer'
import type { JiraUpdateFormContentInterface, JiraUpdateData, JiraUpdateStepModeProps } from './types'
import { processFormData } from './helper'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../JiraCreate/JiraCreate.module.scss'

const FormContent = ({
  formik,
  refetchProjects,
  projectsResponse,
  refetchStatuses,
  fetchingStatuses,
  statusResponse,
  isNewStep,
  readonly
}: JiraUpdateFormContentInterface) => {
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
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([])
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>('')
  const [selectedIssueTypeKey, setSelectedIssueTypeKey] = useState<string>('')

  useEffect(() => {
    // If connector value changes in form, fetch projects
    if (connectorRefFixedValue) {
      refetchProjects({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })

      refetchStatuses({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    } else {
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected additional fields, and move everything to key value fields
      formik.setFieldValue('spec.selectedFields', [])
    }
  }, [connectorRefFixedValue])

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
    // get status by connector ref response
    let options: SelectOption[] = []
    const statusResponseList: JiraStatusNG[] = statusResponse?.data || []
    options =
      statusResponseList.map((status: JiraStatusNG) => ({
        label: status.name || '',
        value: status.name || ''
      })) || []

    setStatusOptions(options)
  }, [statusResponse?.data])

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        isOpen
        onClose={hideDynamicFieldsModal}
        title={getString('pipeline.jiraCreateStep.addFields')}
      >
        <JiraDynamicFieldsSelector
          connectorRef={connectorRefFixedValue || ''}
          selectedProjectKey={selectedProjectKey}
          selectedIssueTypeKey={selectedIssueTypeKey}
          projectOptions={projectOptions}
          addSelectedFields={(fieldsToBeAdded: JiraFieldNG[], selectedProjectKeyInForm, selectedIssueTypeKeyInForm) => {
            setSelectedProjectKey(selectedProjectKeyInForm)
            setSelectedIssueTypeKey(selectedIssueTypeKeyInForm)
            formik.setFieldValue(
              'spec.selectedFields',
              getSelectedFieldsToBeAddedInForm(
                fieldsToBeAdded,
                formik.values.spec.selectedFields,
                formik.values.spec.fields
              )
            )
            hideDynamicFieldsModal()
          }}
          provideFieldList={(fields: JiraCreateFieldType[]) => {
            formik.setFieldValue(
              'spec.fields',
              getKVFieldsToBeAddedInForm(fields, formik.values.spec.fields, formik.values.spec.selectedFields)
            )
            hideDynamicFieldsModal()
          }}
          onCancel={hideDynamicFieldsModal}
          showProjectDisclaimer={true}
        />
      </Dialog>
    )
  }, [projectOptions, connectorRefFixedValue, formik.values.spec.selectedFields, formik.values.spec.fields])

  const AddFieldsButton = () => (
    <Text
      onClick={() => {
        if (!isApprovalStepFieldDisabled(readonly)) {
          showDynamicFieldsModal()
        }
      }}
      style={{
        cursor: isApprovalStepFieldDisabled(readonly) ? 'not-allowed' : 'pointer',
        marginBottom: 'var(--spacing-medium)'
      }}
      intent="primary"
    >
      {getString('pipeline.jiraCreateStep.fieldSelectorAdd')}
    </Text>
  )

  return (
    <React.Fragment>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.InputWithIdentifier
          inputLabel={getString('name')}
          isIdentifierEditable={isNewStep}
          inputGroupProps={{ disabled: isApprovalStepFieldDisabled(readonly) }}
        />
      </div>
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <FormMultiTypeDurationField
          name="timeout"
          className={stepCss.sm}
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeDurationProps={{
            expressions,
            enableConfigureOptions: false
          }}
        />
        {getMultiTypeFromValue(formik.values.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.timeout || ''}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('timeout', value)}
          />
        )}
      </Layout.Horizontal>
      <Accordion activeId="step-1" className={stepCss.accordion}>
        <Accordion.Panel
          id="step-1"
          summary={getString('pipeline.jiraApprovalStep.connectToJira')}
          details={
            <div>
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
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
                  disabled={isApprovalStepFieldDisabled(readonly)}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.connectorRef as string}
                    type="String"
                    variableName="spec.connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.connectorRef', value)}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <FormInput.MultiTextInput
                  label={getString('pipeline.jiraApprovalStep.issueKey')}
                  name="spec.issueKey"
                  placeholder={getString('pipeline.jiraApprovalStep.issueKey')}
                  className={css.md}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.issueKey) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.issueKey as string}
                    type="String"
                    variableName="spec.issueKey"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.issueKey', value)}
                  />
                )}
              </Layout.Horizontal>
            </div>
          }
        />
        <Accordion.Panel
          id="step-2"
          summary={getString('pipeline.jiraUpdateStep.statusTransitionAccordion')}
          details={
            <div>
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <FormInput.MultiTypeInput
                  selectItems={statusOptions}
                  label={getString('status')}
                  name="spec.transitionTo.status"
                  placeholder={
                    fetchingStatuses ? getString('pipeline.jiraUpdateStep.fetchingStatus') : getString('status')
                  }
                  className={css.md}
                  multiTypeInputProps={{
                    expressions
                  }}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.transitionTo?.status) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.transitionTo?.status as string}
                    type="String"
                    variableName="spec.transitionTo.status"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.transitionTo.status', value)}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <FormInput.MultiTextInput
                  label={getString('pipeline.jiraUpdateStep.transitionLabel')}
                  name="spec.transitionTo.transition"
                  placeholder={getString('pipeline.jiraUpdateStep.transitionLabel')}
                  className={css.md}
                  multiTextInputProps={{
                    expressions
                  }}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.transitionTo?.transitionName) ===
                  MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.transitionTo?.transitionName as string}
                    type="String"
                    variableName="spec.transitionTo.transitionName"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.transitionTo.transitionName', value)}
                  />
                )}
              </Layout.Horizontal>
            </div>
          }
        />

        <Accordion.Panel
          id="step-3"
          summary={getString('pipeline.jiraCreateStep.fields')}
          details={
            <div>
              <JiraFieldsRenderer
                selectedFields={formik.values.spec.selectedFields}
                readonly={readonly}
                onDelete={(index, selectedField) => {
                  const selectedFieldsAfterRemoval = formik.values.spec.selectedFields?.filter(
                    (_unused, i) => i !== index
                  )
                  formik.setFieldValue('spec.selectedFields', selectedFieldsAfterRemoval)
                  const customFields = formik.values.spec.fields?.filter(field => field.name !== selectedField.name)
                  formik.setFieldValue('spec.fields', customFields)
                }}
              />

              {!isEmpty(formik.values.spec.fields) ? (
                <FieldArray
                  name="spec.fields"
                  render={({ remove }) => {
                    return (
                      <div>
                        <div className={css.headerRow}>
                          <String className={css.label} stringID="keyLabel" />
                          <String className={css.label} stringID="valueLabel" />
                        </div>
                        {formik.values.spec.fields?.map((_unused: JiraCreateFieldType, i: number) => (
                          <div className={css.headerRow} key={i}>
                            <FormInput.Text
                              name={`spec.fields[${i}].name`}
                              placeholder={getString('keyLabel')}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                            />
                            <FormInput.MultiTextInput
                              name={`spec.fields[${i}].value`}
                              label=""
                              placeholder={getString('valueLabel')}
                              multiTextInputProps={{
                                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                expressions
                              }}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                            />
                            <Button
                              minimal
                              icon="trash"
                              data-testid={`remove-fieldList-${i}`}
                              onClick={() => remove(i)}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
              ) : null}

              <AddFieldsButton />
            </div>
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

function JiraUpdateStepMode(props: JiraUpdateStepModeProps, formikRef: StepFormikFowardRef<JiraUpdateData>) {
  const { onUpdate, isNewStep, readonly } = props
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
    <Formik<JiraUpdateData>
      onSubmit={values => onUpdate?.(processFormData(values))}
      formName="jiraUpdate"
      initialValues={props.initialValues}
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.connectorRef')),
          issueKey: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.issueKey'))
        })
      })}
    >
      {(formik: FormikProps<JiraUpdateData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormContent
            formik={formik}
            refetchProjects={refetchProjects}
            refetchStatuses={refetchStatuses}
            fetchingProjects={fetchingProjects}
            fetchingStatuses={fetchingStatuses}
            statusResponse={statusResponse}
            projectsResponse={projectsResponse}
            projectsFetchError={projectsFetchError}
            statusFetchError={statusFetchError}
            isNewStep={isNewStep}
            readonly={readonly}
          />
        )
      }}
    </Formik>
  )
}

const JiraUpdateStepModeWithRef = React.forwardRef(JiraUpdateStepMode)
export default JiraUpdateStepModeWithRef
