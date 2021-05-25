import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { Menu } from '@blueprintjs/core'
import { FieldArray, FormikProps } from 'formik'
import {
  Formik,
  MultiTypeInputType,
  Accordion,
  FormInput,
  Button,
  MultiSelectOption,
  Layout,
  Avatar,
  Text
} from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { String, useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useGetUserGroupList } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import type {
  HarnessApprovalStepModeProps,
  HarnessApprovalData,
  ApproverInputsSubmitCallInterface,
  HarnessApprovalFormContentProps
} from './types'
import { isArrayOfStrings } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './HarnessApproval.module.scss'

const FormContent = ({
  formik,
  userGroupsFetchError,
  userGroupsResponse,
  fetchingUserGroups,
  isNewStep,
  readonly
}: HarnessApprovalFormContentProps) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [userGroupOptions, setUserGroupOptions] = useState<MultiSelectOption[]>([])

  const setOptionsInForm = (userGroupIds: string[]) => {
    // When we open the form, we'll get the userGroups as string[] as saved in BE
    // Convert the same as MultiSelectOption[], and update the formik values for auto populate
    const selectedUgOptions: MultiSelectOption[] = []
    userGroupIds.forEach(ugIdentifier => {
      const matchedOption = userGroupOptions.find(opt => opt.value === ugIdentifier)
      if (matchedOption) {
        selectedUgOptions.push(matchedOption)
      }
    })
    formik.setFieldValue('spec.approvers.userGroups', selectedUgOptions)
  }

  useEffect(() => {
    // When moving back from advanced tab
    if (isArrayOfStrings(formik.initialValues.spec.approvers.userGroups)) {
      setOptionsInForm(formik.initialValues.spec.approvers.userGroups)
    }
  }, [formik.initialValues])

  useEffect(() => {
    if (isArrayOfStrings(formik.initialValues.spec.approvers.userGroups) && userGroupOptions.length) {
      setOptionsInForm(formik.initialValues.spec.approvers.userGroups)
    }
  }, [userGroupOptions])

  useEffect(() => {
    if (userGroupsResponse?.data?.content) {
      const userGroupsContent = userGroupsResponse?.data?.content
      const options: MultiSelectOption[] = userGroupsContent
        ? userGroupsContent.map(ug => ({ label: ug.name || '', value: ug.identifier || '' }))
        : []
      setUserGroupOptions(options)
    }
  }, [userGroupsResponse?.data?.content])

  return (
    <React.Fragment>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.InputWithIdentifier
          inputLabel={getString('name')}
          isIdentifierEditable={isNewStep}
          inputGroupProps={{ disabled: isApprovalStepFieldDisabled(readonly) }}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeDurationProps={{
            expressions
          }}
        />
      </div>

      <Accordion activeId="step-1" className={stepCss.accordion}>
        <Accordion.Panel
          id="step-1"
          summary={getString('pipeline.approvalStep.message')}
          details={
            <div>
              <FormMultiTypeTextAreaField
                name="spec.approvalMessage"
                label={getString('message')}
                className={cx(css.approvalMessage, css.md)}
                multiTypeTextArea={{ enableConfigureOptions: false, expressions }}
                placeholder="Please add relevant information for this step"
                disabled={isApprovalStepFieldDisabled(readonly)}
              />
              <FormInput.CheckBox
                className={cx(css.execHistoryCheckbox, css.md)}
                name="spec.includePipelineExecutionHistory"
                label={getString('pipeline.approvalStep.includePipelineExecutionHistory')}
                disabled={isApprovalStepFieldDisabled(readonly)}
              />
            </div>
          }
        />
        <Accordion.Panel
          id="step-2"
          summary={getString('pipeline.approvalStep.approvers')}
          details={
            <div>
              <FormInput.MultiSelectTypeInput
                className={cx(css.multiSelect, css.md)}
                name="spec.approvers.userGroups"
                label={getString('common.userGroups')}
                disabled={isApprovalStepFieldDisabled(readonly)}
                selectItems={
                  fetchingUserGroups
                    ? [{ label: getString('pipeline.approvalStep.fetchingUserGroups'), value: '', disabled: true }]
                    : userGroupOptions
                }
                multiSelectTypeInputProps={{
                  expressions,
                  multiSelectProps: {
                    allowCreatingNewItems: true,
                    tagInputProps: {
                      placeholder: fetchingUserGroups
                        ? getString('pipeline.approvalStep.fetchingUserGroups')
                        : userGroupsFetchError?.message
                        ? getString('pipeline.approvalStep.fetchUserGroupsFailed')
                        : getString('pipeline.approvalStep.addUserGroups')
                    },
                    items: fetchingUserGroups
                      ? [{ label: getString('pipeline.approvalStep.fetchingUserGroups'), value: '', disabled: true }]
                      : userGroupOptions,
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
                  }
                }}
              />

              <FormInput.MultiTextInput
                className={css.md}
                name="spec.approvers.minimumCount"
                label={getString('pipeline.approvalStep.minimumCount')}
                multiTextInputProps={{
                  expressions,
                  textProps: {
                    type: 'number'
                  }
                }}
                disabled={isApprovalStepFieldDisabled(readonly)}
              />
              <FormInput.CheckBox
                className={cx(css.execHistoryCheckbox, css.md)}
                name="spec.approvers.disallowPipelineExecutor"
                label={getString('pipeline.approvalStep.disallowPipelineExecutor')}
                disabled={isApprovalStepFieldDisabled(readonly)}
              />
            </div>
          }
        />
        <Accordion.Panel
          id="step-3"
          summary={getString('pipeline.approvalStep.approverInputs')}
          details={
            <div className={stepCss.formGroup}>
              <FieldArray
                name="spec.approverInputs"
                render={({ push, remove }) => {
                  return (
                    <div>
                      <div className={css.headerRow}>
                        <String className={css.label} stringID="variableNameLabel" />
                        <String className={css.label} stringID="configureOptions.defaultValue" />
                      </div>
                      {(formik.values.spec.approverInputs as ApproverInputsSubmitCallInterface[]).map(
                        (_unused: ApproverInputsSubmitCallInterface, i: number) => (
                          <div className={css.headerRow} key={i}>
                            <FormInput.Text
                              name={`spec.approverInputs[${i}].name`}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                            />
                            <FormInput.MultiTextInput
                              name={`spec.approverInputs[${i}].defaultValue`}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                              label=""
                              multiTextInputProps={{
                                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                expressions
                              }}
                            />
                            <Button
                              minimal
                              icon="trash"
                              data-testid={`remove-approverInputs-${i}`}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                              onClick={() => remove(i)}
                            />
                          </div>
                        )
                      )}
                      <Button
                        icon="plus"
                        minimal
                        intent="primary"
                        data-testid="add-approverInput"
                        disabled={isApprovalStepFieldDisabled(readonly)}
                        onClick={() => push({ name: '', defaultValue: '' })}
                      >
                        Add
                      </Button>
                    </div>
                  )
                }}
              />
            </div>
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
function HarnessApprovalStepMode(
  props: HarnessApprovalStepModeProps,
  formikRef: StepFormikFowardRef<HarnessApprovalData>
) {
  const { onUpdate, isNewStep = true, readonly } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
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
    <Formik<HarnessApprovalData>
      onSubmit={values => onUpdate?.(values)}
      initialValues={props.initialValues}
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          approvalMessage: Yup.string().required(getString('pipeline.approvalStep.validation.approvalMessage')),
          approvers: Yup.object().shape({
            userGroups: Yup.string().required(getString('pipeline.approvalStep.validation.userGroups')),
            minimumCount: Yup.string().required(getString('pipeline.approvalStep.validation.minimumCountRequired'))
          })
        })
      })}
    >
      {(formik: FormikProps<HarnessApprovalData>) => {
        /*
        this is required - so that validatios work while switching basic to advanced forms.
        i.e. if the current form is invalid, we should not allow the switch to advanced tab
        */
        setFormikRef(formikRef, formik)
        return (
          <FormContent
            formik={formik}
            userGroupsResponse={userGroupsResponse}
            fetchingUserGroups={fetchingUserGroups}
            userGroupsFetchError={userGroupsFetchError}
            isNewStep={isNewStep}
            readonly={readonly}
          />
        )
      }}
    </Formik>
  )
}

const HarnessApprovalStepModeWithRef = React.forwardRef(HarnessApprovalStepMode)
export default HarnessApprovalStepModeWithRef
