import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Text,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@wings-software/uicore'
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

import { DelegateSelectors } from '@common/components'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformDestroy.module.scss'

export const configurationTypes: SelectOption[] = [
  { label: 'Inherit From Plan', value: 'InheritFromPlan' },
  { label: 'Inherit From Apply', value: 'InheritFromApply' }
]

export interface TerraformDestroyData extends StepElementConfig {
  delegateSelectors: string[]
  spec: {
    provisionerIdentifier: string
    configuration: {
      type: string
    }
  }
}

interface TerraformDestroyProps {
  initialValues: TerraformDestroyData
  onUpdate?: (data: TerraformDestroyData) => void
  stepViewType?: StepViewType
  inputSetData?: {
    template?: TerraformDestroyData
    path?: string
  }
  readonly?: boolean
}

export interface TerraformDestroyVariableStepProps {
  initialValues: TerraformDestroyData
  stageIdentifier: string
  onUpdate?(data: TerraformDestroyData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TerraformDestroyData
}

const setInitialValues = (data: TerraformDestroyData): TerraformDestroyData => {
  return {
    ...data,
    delegateSelectors: data?.delegateSelectors,
    spec: {
      provisionerIdentifier: data?.spec?.provisionerIdentifier,
      configuration: {
        type: data?.spec?.configuration?.type
      }
    }
  }
}
function TerraformDestroyWidget(
  props: TerraformDestroyProps,
  formikRef: StepFormikFowardRef<TerraformDestroyData>
): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  // const defaultValueToReset = ['']
  const [delegateSelectors, setDelegateSelectors] = React.useState<Array<string>>([])
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<TerraformDestroyData>
        onSubmit={(values: TerraformDestroyData) => {
          const payload = {
            ...values,
            spec: {
              ...values.spec,
              delegateSelectors
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
            provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired')),
            configuration: Yup.object().shape({
              type: Yup.string().required(getString('pipelineSteps.configurationTypeRequired'))
            })
          })
        })}
      >
        {(formik: FormikProps<TerraformDestroyData>) => {
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
                      value={values.spec.provisionerIdentifier as string}
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
                  <FormInput.Select
                    items={configurationTypes}
                    name="spec.configuration.type"
                    label={getString('pipelineSteps.configurationType')}
                    placeholder={getString('pipelineSteps.configurationType')}
                  />
                </div>

                <Layout.Vertical padding={{ bottom: 'medium' }} className={css.formData}>
                  <>
                    <Text margin={{ bottom: 'medium' }}>{getString('delegate.DelegateSelector')}</Text>
                    <DelegateSelectors
                      fill
                      className={css.formInput}
                      allowNewTag={false}
                      placeholder={getString('delegate.DelegateselectionPlaceholder')}
                      selectedItems={delegateSelectors}
                      onChange={data => {
                        setDelegateSelectors(data as Array<string>)
                      }}
                    ></DelegateSelectors>
                  </>
                </Layout.Vertical>

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

const TerraformDestroyInputStep: React.FC<TerraformDestroyProps> = ({ inputSetData, readonly }) => {
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

const TerraformRollbackVariableStep: React.FC<TerraformDestroyVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const TerraformDestroyWidgetWithRef = React.forwardRef(TerraformDestroyWidget)

export class TerraformDestroy extends PipelineStep<TerraformDestroyData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }
  protected type = StepType.TerraformDestroy
  protected defaultValues: TerraformDestroyData = {
    identifier: '',
    timeout: '10m',
    delegateSelectors: [],
    spec: {
      provisionerIdentifier: '',
      configuration: {
        type: ''
      }
    }
  }
  protected stepIcon: IconName = 'terraform-apply'
  protected stepName = 'Terraform Delete'
  validateInputSet(
    data: TerraformDestroyData,
    template?: TerraformDestroyData,
    getString?: (key: string, vars?: Record<string, any>) => string
  ): FormikErrors<TerraformDestroyData> {
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
  renderStep(props: StepProps<TerraformDestroyData, unknown>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <TerraformDestroyInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformRollbackVariableStep
          {...(customStepProps as TerraformDestroyVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <TerraformDestroyWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }
}
