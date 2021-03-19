import React from 'react'
import * as Yup from 'yup'
import { FieldArray, FormikProps } from 'formik'
import { Formik, MultiTypeInputType, Accordion, FormInput, Button } from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/exports'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { NGVariable } from 'services/cd-ng'
import { FormMultiTypeCheckboxField } from '@common/components'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import type { HarnessApprovalStepModeProps, HarnessApprovalData } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './HarnessApproval.module.scss'

/*
functional component as this component doesn't need a state of it's own.
everything is governed from the parent
*/
function HarnessApprovalStepMode(
  props: HarnessApprovalStepModeProps,
  formikRef: StepFormikFowardRef<HarnessApprovalData>
) {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Formik<HarnessApprovalData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          approvers: Yup.object().shape({
            // userGroups: Yup.array().when(['users'], {
            //   is: users => isEmpty(users),
            //   then: Yup.array().required(getString('approvalStep.validation.usersOrUserGroups'))
            // }),
            // users: Yup.array().when(['userGroups'], {
            //   is: userGroups => isEmpty(userGroups),
            //   then: Yup.array().required(getString('approvalStep.validation.usersOrUserGroups'))
            // }),
            minimumCount: Yup.number()
              .min(1, getString('approvalStep.validation.minimumCountOne'))
              .required(getString('approvalStep.validation.minimumCountRequired'))
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
          <React.Fragment>
            <FormInput.InputWithIdentifier inputLabel={getString('name')} />
            <Accordion activeId="step-1" className={stepCss.accordion}>
              <Accordion.Panel
                id="step-1"
                summary={getString('approvalStep.message')}
                details={
                  <div>
                    <FormMultiTypeTextAreaField
                      name="spec.approvalMessage"
                      label={getString('message')}
                      className={css.approvalMessage}
                      multiTypeTextArea={{ enableConfigureOptions: false, expressions }}
                      placeholder="Please add relevant information for this step"
                    />
                    <FormMultiTypeCheckboxField
                      className={css.execHistoryCheckbox}
                      multiTypeTextbox={{ expressions }}
                      name="spec.includePipelineExecutionHistory"
                      label={getString('approvalStep.includePipelineExecutionHistory')}
                    />
                  </div>
                }
              />
              <Accordion.Panel
                id="step-2"
                summary={getString('approvalStep.approvers')}
                details={
                  <div>
                    <FormInput.MultiSelectTypeInput
                      name="spec.approvers.users"
                      placeholder="Add Users"
                      label={getString('users')}
                      selectItems={[
                        { label: 'u1', value: 'u1' },
                        { label: 'u2', value: 'u2' }
                      ]}
                    />
                    <FormInput.MultiSelectTypeInput
                      name="spec.approvers.userGroups"
                      placeholder="Add Groups"
                      label={getString('approvalStep.userGroups')}
                      selectItems={[
                        { label: 'ug1', value: 'ug1' },
                        { label: 'ug2', value: 'ug2' }
                      ]}
                    />
                    <FormInput.MultiTextInput
                      name="spec.approvers.minimumCount"
                      label={getString('approvalStep.minimumCount')}
                    />
                    <FormMultiTypeCheckboxField
                      className={css.execHistoryCheckbox}
                      multiTypeTextbox={{ expressions }}
                      name="spec.disallowPipelineExecutor"
                      label={getString('approvalStep.disallowPipelineExecutor')}
                    />
                  </div>
                }
              />
              <Accordion.Panel
                id="step-3"
                summary={getString('approvalStep.approverInputs')}
                details={
                  <div className={stepCss.formGroup}>
                    <MultiTypeFieldSelector
                      name="spec.approverInputs"
                      label="Inputs"
                      defaultValueToReset={[{ name: '', type: 'String', value: '' }]}
                    >
                      <FieldArray
                        name="spec.approverInputs"
                        render={({ push, remove }) => {
                          return (
                            <div>
                              <div className={css.headerRow}>
                                <span className={css.label}>Variable name</span>
                                <span className={css.label}>Default value</span>
                              </div>
                              {(formik.values.spec.approverInputs as NGVariable[]).map(
                                (variable: NGVariable, i: number) => (
                                  <div className={css.headerRow} key={variable.name}>
                                    <FormInput.Text name={`spec.approverInputs[${i}].name`} />
                                    <FormInput.MultiTextInput
                                      name={`spec.approverInputs[${i}].value`}
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
                                onClick={() => push({ key: '', value: '' })}
                              >
                                Add
                              </Button>
                            </div>
                          )
                        }}
                      />
                    </MultiTypeFieldSelector>
                  </div>
                }
              />
              <Accordion.Panel
                id="step-4"
                summary={getString('pipelineSteps.timeoutLabel')}
                details={
                  <div>
                    <FormMultiTypeDurationField name="timeout" label={getString('pipelineSteps.timeoutLabel')} />
                  </div>
                }
              />
            </Accordion>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

const HarnessApprovalStepModeWithRef = React.forwardRef(HarnessApprovalStepMode)
export default HarnessApprovalStepModeWithRef
