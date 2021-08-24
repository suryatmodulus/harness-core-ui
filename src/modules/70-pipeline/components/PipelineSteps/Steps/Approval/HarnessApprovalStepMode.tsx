import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import { FieldArray, FormikProps } from 'formik'
import {
  Formik,
  MultiTypeInputType,
  Accordion,
  FormInput,
  Button,
  getMultiTypeFromValue,
  FormikForm,
  HarnessDocTooltip
} from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { String, useStrings } from 'framework/strings'
import { NameSchema } from '@common/utils/Validation'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { FormMultiTypeUserGroupInput } from '@common/components/UserGroupsInput/FormMultitypeUserGroupInput'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import type {
  HarnessApprovalStepModeProps,
  HarnessApprovalData,
  ApproverInputsSubmitCallInterface,
  HarnessApprovalFormContentProps
} from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './HarnessApproval.module.scss'

const FormContent = ({ formik, isNewStep, readonly }: HarnessApprovalFormContentProps) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <React.Fragment>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.InputWithIdentifier
          inputLabel={getString('name')}
          isIdentifierEditable={isNewStep}
          inputGroupProps={{
            disabled: isApprovalStepFieldDisabled(readonly)
          }}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
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
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.stepSubSectionHeading}>Approval Message</div>
      <div className={cx(stepCss.formGroup)}>
        <FormMultiTypeTextAreaField
          name="spec.approvalMessage"
          label={getString('message')}
          className={css.approvalMessage}
          multiTypeTextArea={{ enableConfigureOptions: false, expressions }}
          placeholder="Please add relevant information for this step"
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
        {getMultiTypeFromValue(formik.values.spec.approvalMessage) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.approvalMessage as string}
            type="String"
            variableName="spec.approvalMessage"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.approvalMessage', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <FormInput.CheckBox
        name="spec.includePipelineExecutionHistory"
        label={getString('pipeline.approvalStep.includePipelineExecutionHistory')}
        disabled={isApprovalStepFieldDisabled(readonly)}
      />

      <div className={stepCss.stepSubSectionHeading}>Approvers</div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeUserGroupInput
          name="spec.approvers.userGroups"
          label={getString('common.userGroups')}
          formik={formik}
          tooltipProps={{ dataTooltipId: 'harnessApproval_spec.approvers.userGroups' }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          expressions={expressions}
        />
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
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
        {getMultiTypeFromValue(formik.values.spec.approvers?.minimumCount as string) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.approvers?.minimumCount as string}
            type="Number"
            variableName="spec.approvers.minimumCount"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.approvers.minimumCount', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <FormInput.CheckBox
        name="spec.approvers.disallowPipelineExecutor"
        label={getString('pipeline.approvalStep.disallowPipelineExecutor')}
        disabled={isApprovalStepFieldDisabled(readonly)}
      />

      <div className={stepCss.noLookDivider} />

      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <div className={stepCss.formGroup}>
              <FieldArray
                name="spec.approverInputs"
                render={({ push, remove }) => {
                  return (
                    <div>
                      <div className={stepCss.stepSubSectionHeading} data-tooltip-id="approverInputs">
                        <>Approver Inputs</>
                        <HarnessDocTooltip tooltipId="approverInputs" useStandAlone={true} />
                      </div>
                      {isEmpty(formik.values.spec.approverInputs) ? null : (
                        <>
                          <div className={css.headerRow}>
                            <String className={css.label} stringID="variableNameLabel" />
                            <String className={css.label} stringID="common.configureOptions.defaultValue" />
                          </div>
                          {(formik.values.spec.approverInputs as ApproverInputsSubmitCallInterface[]).map(
                            (_unused: ApproverInputsSubmitCallInterface, i: number) => (
                              <div className={css.headerRow} key={i}>
                                <FormInput.Text
                                  name={`spec.approverInputs[${i}].name`}
                                  disabled={isApprovalStepFieldDisabled(readonly)}
                                  placeholder={getString('name')}
                                />
                                <FormInput.MultiTextInput
                                  name={`spec.approverInputs[${i}].defaultValue`}
                                  disabled={isApprovalStepFieldDisabled(readonly)}
                                  label=""
                                  placeholder={getString('valueLabel')}
                                  multiTextInputProps={{
                                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                    expressions
                                  }}
                                />
                                <Button
                                  minimal
                                  icon="main-trash"
                                  data-testid={`remove-approverInputs-${i}`}
                                  disabled={isApprovalStepFieldDisabled(readonly)}
                                  onClick={() => remove(i)}
                                />
                              </div>
                            )
                          )}
                        </>
                      )}
                      <Button
                        icon="plus"
                        minimal
                        intent="primary"
                        data-testid="add-approverInput"
                        disabled={isApprovalStepFieldDisabled(readonly)}
                        onClick={() => push({ name: '', defaultValue: '' })}
                      >
                        {getString('pipeline.approvalStep.addApproverInputs')}
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

  return (
    <Formik<HarnessApprovalData>
      onSubmit={values => onUpdate?.(values)}
      initialValues={props.initialValues}
      formName="harnessApproval"
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          approvalMessage: Yup.string().trim().required(getString('pipeline.approvalStep.validation.approvalMessage')),
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
          <FormikForm>
            <FormContent formik={formik} isNewStep={isNewStep} readonly={readonly} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const HarnessApprovalStepModeWithRef = React.forwardRef(HarnessApprovalStepMode)
export default HarnessApprovalStepModeWithRef
