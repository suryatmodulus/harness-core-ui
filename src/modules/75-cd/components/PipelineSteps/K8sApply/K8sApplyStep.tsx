import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Button,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import cx from 'classnames'
import { FieldArray, FormikProps, yupToFormErrors } from 'formik'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'
import type {} from 'formik'
import { isEmpty } from 'lodash-es'
import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, K8sApplyStepInfo } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings, UseStringsReturn } from 'framework/exports'

import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface K8sApplyData extends StepElementConfig {
  spec: Omit<K8sApplyStepInfo, 'skipDryRun' | 'skipSteadyStateCheck'> & {
    skipDryRun: boolean
    skipSteadyStateCheck?: boolean
  }
}

export interface K8sApplyVariableStepProps {
  initialValues: K8sApplyData
  stageIdentifier: string
  onUpdate?(data: K8sApplyFormData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sApplyData
}

interface FilePathConfig {
  value: string
  id: string
}
interface K8sApplyFormData extends StepElementConfig {
  spec: {
    skipDryRun: boolean
    skipSteadyStateCheck?: boolean
    filePaths?: FilePathConfig[]
  }
}

interface K8sApplyProps {
  initialValues: K8sApplyData
  onUpdate?: (data: K8sApplyData) => void
  stepViewType?: StepViewType
  isNewStep?: boolean
  isDisabled?: boolean
  inputSetData?: {
    template?: K8sApplyData
    path?: string
  }
  readonly?: boolean
}

const formatData = (data: K8sApplyFormData): K8sApplyData => {
  return {
    ...data,
    spec: {
      skipDryRun: data?.spec?.skipDryRun,
      skipSteadyStateCheck: data?.spec?.skipSteadyStateCheck,
      filePaths: (data?.spec?.filePaths || [])?.map((item: FilePathConfig) => item.value)
    }
  }
}
const setInitialValues = (data: K8sApplyData): K8sApplyFormData => {
  return {
    ...data,
    spec: {
      skipDryRun: data?.spec?.skipDryRun,
      skipSteadyStateCheck: data?.spec?.skipSteadyStateCheck,
      filePaths: (data?.spec?.filePaths || [])?.map((item: string) => ({
        value: item,
        id: uuid()
      }))
    }
  }
}

function K8sApplyDeployWidget(props: K8sApplyProps, formikRef: StepFormikFowardRef<K8sApplyData>): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, isDisabled } = props
  const { getString } = useStrings()
  const defaultValueToReset = ['']
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<K8sApplyFormData>
        onSubmit={(values: K8sApplyFormData) => {
          const payload = formatData(values)
          onUpdate?.(payload)
        }}
        initialValues={setInitialValues(initialValues)}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          ...IdentifierValidation()
        })}
      >
        {(formik: FormikProps<K8sApplyFormData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{ disabled: isDisabled }}
                  />
                </div>
                <div className={stepCss.formGroup}>
                  <MultiTypeFieldSelector
                    defaultValueToReset={defaultValueToReset}
                    name={'spec.filePaths'}
                    label={getString('fileFolderPathText')}
                    disableTypeSelection
                  >
                    <FieldArray
                      name="spec.filePaths"
                      render={arrayHelpers => (
                        <Layout.Vertical>
                          {values?.spec?.filePaths?.map((path: FilePathConfig, index: number) => (
                            <Layout.Horizontal
                              key={path.id}
                              flex={{ distribution: 'space-between' }}
                              style={{ alignItems: 'end' }}
                            >
                              <FormInput.MultiTextInput
                                label=""
                                placeholder={'Enter overrides file path'}
                                name={`spec.filePaths[${index}].value`}
                                multiTextInputProps={{
                                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                  expressions,
                                  textProps: { disabled: isDisabled }
                                }}
                                disabled={isDisabled}
                                style={{ width: '430px' }}
                              />

                              {values?.spec?.filePaths && values?.spec?.filePaths?.length > 1 && (
                                <Button
                                  minimal
                                  icon="minus"
                                  onClick={() => arrayHelpers.remove(index)}
                                  disabled={isDisabled}
                                />
                              )}
                            </Layout.Horizontal>
                          ))}
                          <span>
                            <Button
                              minimal
                              text={getString('addFileText')}
                              intent="primary"
                              onClick={() => {
                                arrayHelpers.push({ value: '', id: uuid() })
                              }}
                              disabled={isDisabled}
                            />
                          </span>
                        </Layout.Vertical>
                      )}
                    />
                  </MultiTypeFieldSelector>
                </div>
                <div className={cx(stepCss.formGroup, stepCss.sm)}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    multiTypeDurationProps={{ enableConfigureOptions: false, disabled: isDisabled }}
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
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormMultiTypeCheckboxField
                    name="spec.skipDryRun"
                    label={getString('pipelineSteps.skipDryRun')}
                    disabled={isDisabled}
                  />
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormMultiTypeCheckboxField
                    name="spec.skipSteadyStateCheck"
                    disabled={isDisabled}
                    label={getString('pipelineSteps.skipSteadyStateCheck')}
                  />
                </div>
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8sApplyInputStep: React.FC<K8sApplyProps> = ({ inputSetData, readonly }) => {
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

      {getMultiTypeFromValue(inputSetData?.template?.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.skipDryRun`}
          className={stepCss.checkbox}
          label={getString('pipelineSteps.skipDryRun')}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.skipSteadyStateCheck) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.skipSteadyStateCheck`}
          className={stepCss.checkbox}
          label={getString('pipelineSteps.skipSteadyStateCheck')}
        />
      )}
    </>
  )
}

const K8sApplyVariableStep: React.FC<K8sApplyVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return (
    <VariablesListTable
      className={stepCss.topSpacingLarge}
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
    />
  )
}

const K8sApplyDeployWidgetWithRef = React.forwardRef(K8sApplyDeployWidget)
export class K8sApplyStep extends PipelineStep<K8sApplyData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<K8sApplyData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly
    } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8sApplyInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          readonly={!!inputSetData?.readonly}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sApplyVariableStep
          {...(customStepProps as K8sApplyVariableStepProps)}
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(formatData(data))}
        />
      )
    }
    return (
      <K8sApplyDeployWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        readonly={!!inputSetData?.readonly}
        isDisabled={readonly}
        ref={formikRef}
      />
    )
  }
  validateInputSet(data: K8sApplyData, template: K8sApplyData, getString?: UseStringsReturn['getString']): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  protected type = StepType.K8sApply
  protected stepName = 'K8s Apply'
  protected stepIcon: IconName = 'code'

  protected defaultValues: K8sApplyData = {
    identifier: '',
    timeout: '10m',
    spec: {
      filePaths: [],
      skipDryRun: false,
      skipSteadyStateCheck: false
    }
  }
}
