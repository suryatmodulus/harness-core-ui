import React from 'react'
import { IconName, Formik, FormInput, Layout, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'

import { isEmpty } from 'lodash-es'
import { FormikProps, yupToFormErrors, FormikErrors } from 'formik'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StepElementConfig, TerraformRollbackStepInfo } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'

import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TFRollbackFormData extends StepElementConfig, TerraformRollbackStepInfo {}
interface TerraformRollbackProps {
  initialValues: TFRollbackFormData
  onUpdate?: (data: TFRollbackFormData) => void
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: TFRollbackFormData
    path?: string
  }
  readonly?: boolean
}

export interface TerraformRollbackVariableStepProps {
  initialValues: TFRollbackFormData
  stageIdentifier: string
  onUpdate?(data: TFRollbackFormData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TFRollbackFormData
}

function TerraformRollbackWidget(
  props: TerraformRollbackProps,
  formikRef: StepFormikFowardRef<TFRollbackFormData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<TFRollbackFormData>
        onSubmit={(values: TFRollbackFormData) => {
          onUpdate?.(values)
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),

          ...IdentifierValidation()

          // provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired'))
        })}
      >
        {(formik: FormikProps<TFRollbackFormData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
                </div>

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    name="provisionerIdentifier"
                    label={getString('pipelineSteps.provisionerIdentifier')}
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(values.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.provisionerIdentifier}
                      type="String"
                      variableName="provisionerIdentifier"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('provisionerIdentifier', value)
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

export class TerraformRollback extends PipelineStep<TFRollbackFormData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformRollback
  protected defaultValues: TFRollbackFormData = {
    identifier: '',
    timeout: '10m',

    provisionerIdentifier: ''
  }
  protected stepIcon: IconName = 'terraform-apply-new'
  protected stepName = 'Terraform Rollback'
  validateInputSet(
    data: TFRollbackFormData,
    template?: TFRollbackFormData,
    getString?: (key: StringKeys, vars?: Record<string, any>) => string
  ): FormikErrors<TFRollbackFormData> {
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
  renderStep(props: StepProps<TFRollbackFormData, unknown>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep } = props

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
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }
}
