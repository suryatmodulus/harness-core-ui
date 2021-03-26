import React from 'react'
import { IconName, Formik, FormInput, Layout, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'

import { isEmpty } from 'lodash-es'
import { FormikProps, yupToFormErrors, FormikErrors } from 'formik'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StepElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useStrings } from 'framework/exports'
import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'

import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface TerraformRollbackData extends StepElementConfig {
  spec: {
    provisionerIdentifier: string
    delegateSelectors: string[]
  }
}

interface TerraformRollbackProps {
  initialValues: TerraformRollbackData
  onUpdate?: (data: TerraformRollbackData) => void
  stepViewType?: StepViewType
  inputSetData?: {
    template?: TerraformRollbackData
    path?: string
  }
  readonly?: boolean
}

export interface TerraformRollbackVariableStepProps {
  initialValues: TerraformRollbackData
  stageIdentifier: string
  onUpdate?(data: TerraformRollbackData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TerraformRollbackData
}

const setInitialValues = (data: TerraformRollbackData): TerraformRollbackData => {
  return {
    ...data,
    spec: {
      provisionerIdentifier: data?.spec?.provisionerIdentifier,
      delegateSelectors: data?.spec?.delegateSelectors
    }
  }
}
function TerraformRollbackWidget(
  props: TerraformRollbackProps,
  formikRef: StepFormikFowardRef<TerraformRollbackData>
): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<TerraformRollbackData>
        onSubmit={(values: TerraformRollbackData) => {
          const payload = {
            ...values,
            spec: {
              ...values.spec
            }
          }
          onUpdate?.(payload)
        }}
        initialValues={setInitialValues(initialValues)}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),

          ...IdentifierValidation(),
          spec: Yup.object().shape({
            provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired'))
          })
        })}
      >
        {(formik: FormikProps<TerraformRollbackData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isEmpty(initialValues.identifier)}
                  />
                </div>

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    name="spec.provisionerIdentifier"
                    label={getString('pipelineSteps.provisionerIdentifier')}
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(values.spec.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.spec.provisionerIdentifier}
                      type="String"
                      variableName="spec.provisionerIdentifier"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('spec.provisionerIdentifier', value)
                      }}
                    />
                  )}
                </div>

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    multiTypeDurationProps={{ enableConfigureOptions: false, expressions }}
                  />
                  {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.timeout as string}
                      type="String"
                      variableName="step.timeout"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('timeout', value)
                      }}
                    />
                  )}
                </div>
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const TerraformRollbackInputStep: React.FC<TerraformRollbackProps> = ({ inputSetData, readonly }) => {
  const { getString } = useStrings()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name="spec.provisionerIdentifier"
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
        />
      )}
    </>
  )
}

const TerraformRollbackVariableStep: React.FC<TerraformRollbackVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const TerraformRollbackWidgetWithRef = React.forwardRef(TerraformRollbackWidget)

export class TerraformRollback extends PipelineStep<TerraformRollbackData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }
  protected type = StepType.TerraformRollback
  protected defaultValues: TerraformRollbackData = {
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: '',
      delegateSelectors: []
    }
  }
  protected stepIcon: IconName = 'terraform-apply'
  protected stepName = 'Terraform Rollback'
  validateInputSet(
    data: TerraformRollbackData,
    template?: TerraformRollbackData,
    getString?: (key: string, vars?: Record<string, any>) => string
  ): FormikErrors<TerraformRollbackData> {
    const errors = {} as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }
  renderStep(props: StepProps<TerraformRollbackData, unknown>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <TerraformRollbackInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformRollbackVariableStep
          {...(customStepProps as TerraformRollbackVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <TerraformRollbackWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }
}
