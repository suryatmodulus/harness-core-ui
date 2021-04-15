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
  SelectOption
} from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { String, useStrings } from 'framework/exports'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { JiraProjectBasicNG, JiraFieldNG, useGetJiraProjects, useGetJiraStatuses, JiraStatusNG } from 'services/cd-ng'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { getGenuineValue, setAllowedValuesOptions } from '../JiraApproval/helper'
import type { JiraCreateFieldType } from '../JiraCreate/types'
import { JiraDynamicFieldsSelector } from '../JiraCreate/JiraDynamicFieldsSelector'
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
  isNewStep
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
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([])
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)

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
        value: status.id || ''
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
          projectOptions={projectOptions}
          addSelectedFields={(fieldsToBeAdded: JiraFieldNG[]) => {
            formik.setFieldValue('spec.selectedFields', fieldsToBeAdded)
            hideDynamicFieldsModal()
          }}
          provideFieldList={(fields: JiraCreateFieldType[]) => {
            formik.setFieldValue('spec.fields', fields)
            formik.setFieldValue('spec.selectedFields', [])
            hideDynamicFieldsModal()
          }}
          onCancel={hideDynamicFieldsModal}
        />
      </Dialog>
    )
  }, [projectOptions, connectorRefFixedValue])

  const AddFieldsButton = () => (
    <Text
      onClick={() => showDynamicFieldsModal()}
      style={{ cursor: 'pointer', marginBottom: 'var(--spacing-medium)' }}
      intent="primary"
    >
      {getString('pipeline.jiraCreateStep.fieldSelectorAdd')}
    </Text>
  )

  return (
    <React.Fragment>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
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
              />
              <FormInput.MultiTextInput
                label={getString('pipeline.jiraApprovalStep.issueKey')}
                name="spec.issueKey"
                placeholder={getString('pipeline.jiraApprovalStep.issueKey')}
                className={css.md}
              />
            </div>
          }
        />
        <Accordion.Panel
          id="step-2"
          summary={getString('pipeline.jiraUpdateStep.statusTransitionAccordion')}
          details={
            <div>
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
              />

              <FormInput.MultiTextInput
                label={getString('pipeline.jiraUpdateStep.transitionLabel')}
                name="spec.transitionTo.transition"
                placeholder={getString('pipeline.jiraUpdateStep.transitionLabel')}
                className={css.md}
                multiTextInputProps={{
                  expressions
                }}
              />
            </div>
          }
        />

        <Accordion.Panel
          id="step-3"
          summary={getString('pipeline.jiraCreateStep.fields')}
          details={
            <div>
              {formik.values.spec.selectedFields?.map((selectedField: JiraFieldNG, index: number) => {
                if (
                  selectedField.schema.type === 'string' ||
                  selectedField.schema.type === 'date' ||
                  selectedField.schema.type === 'datetime' ||
                  selectedField.schema.type === 'number'
                ) {
                  return (
                    <FormInput.MultiTextInput
                      label={selectedField.name}
                      name={`spec.selectedFields[${index}].value`}
                      placeholder={selectedField.name}
                      className={css.md}
                      multiTextInputProps={{
                        expressions
                      }}
                    />
                  )
                } else if (
                  selectedField.allowedValues &&
                  selectedField.schema.type === 'option' &&
                  selectedField.schema.array
                ) {
                  return (
                    <FormInput.MultiSelectTypeInput
                      selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
                      label={selectedField.name}
                      name={`spec.selectedFields[${index}].value`}
                      placeholder={selectedField.name}
                      className={cx(css.multiSelect, css.md)}
                      multiSelectTypeInputProps={{
                        expressions
                      }}
                    />
                  )
                } else if (selectedField.allowedValues && selectedField.schema.type === 'option') {
                  return (
                    <FormInput.MultiTypeInput
                      selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
                      label={selectedField.name}
                      name={`spec.selectedFields[${index}].value`}
                      placeholder={selectedField.name}
                      className={cx(css.multiSelect, css.md)}
                      multiTypeInputProps={{ expressions }}
                    />
                  )
                }
              })}

              {!isEmpty(formik.values.spec.fields) && isEmpty(formik.values.spec.selectedFields) ? (
                <FieldArray
                  name="spec.fields"
                  render={({ push, remove }) => {
                    return (
                      <div>
                        <div className={css.headerRow}>
                          <String className={css.label} stringID="keyLabel" />
                          <String className={css.label} stringID="valueLabel" />
                        </div>
                        {formik.values.spec.fields?.map((_unused: JiraCreateFieldType, i: number) => (
                          <div className={css.headerRow} key={i}>
                            <FormInput.Text name={`spec.fields[${i}].name`} placeholder={getString('keyLabel')} />
                            <FormInput.MultiTextInput
                              name={`spec.fields[${i}].value`}
                              label=""
                              placeholder={getString('valueLabel')}
                              multiTextInputProps={{
                                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                expressions
                              }}
                            />
                            <Button
                              minimal
                              icon="trash"
                              data-testid={`remove-fieldList-${i}`}
                              onClick={() => remove(i)}
                            />
                          </div>
                        ))}
                        <Button
                          icon="plus"
                          minimal
                          intent="primary"
                          data-testid="add-fieldList"
                          onClick={() => push({ name: '', value: '' })}
                        >
                          Add
                        </Button>
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
  const { onUpdate, isNewStep } = props
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
          />
        )
      }}
    </Formik>
  )
}

const JiraUpdateStepModeWithRef = React.forwardRef(JiraUpdateStepMode)
export default JiraUpdateStepModeWithRef
