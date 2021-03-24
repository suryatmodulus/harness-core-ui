import React from 'react'
import {
  IconName,
  Button,
  Formik,
  FormInput,
  Text,
  Accordion,
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

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'

import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import GitStore from '../Common/Terraform/GitStore'
import BaseForm from '../Common/Terraform/BaseForm'

import TfVarFileList from '../Common/Terraform/TfVarFileList'
import type { TerraformData } from '../Common/Terraform/TerraformIntefaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const configurationTypes: SelectOption[] = [
  { label: 'Inline', value: 'Inline' },
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

const setInitialValues = (data: TerraformData): TerraformData => {
  return {
    ...data,
    delegateSelectors: data?.delegateSelectors,
    spec: {
      provisionerIdentifier: data?.spec?.provisionerIdentifier,
      configuration: {
        type: data?.spec?.configuration?.type,
        spec: {
          varFiles: [
            {
              type: 'Remote',
              store: {
                spec: {
                  gitFetchType: 'Branch',
                  branch: 'main',
                  paths: ['test']
                }
              }
            }
          ]
        }
      }
    }
  }
}
function TerraformDestroyWidget(
  props: TerraformDestroyProps,
  formikRef: StepFormikFowardRef<TerraformData>
): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<TerraformData>
        onSubmit={(values: TerraformData) => {
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
            provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired')),
            configuration: Yup.object().shape({
              type: Yup.string().required(getString('pipelineSteps.configurationTypeRequired'))
            })
          })
        })}
      >
        {(formik: FormikProps<TerraformData>) => {
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
                <BaseForm formik={formik} />

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

                <Accordion activeId="step-1" className={stepCss.accordion}>
                  <Accordion.Panel
                    id="step-1"
                    summary={getString('pipelineSteps.configFiles')}
                    details={<GitStore formik={formik} />}
                  />

                  <Accordion.Panel
                    id="step-2"
                    summary={getString('pipelineSteps.terraformVarFiles')}
                    details={<TfVarFileList formik={formik} />}
                  />

                  <Accordion.Panel
                    id="step-3"
                    summary={getString('pipelineSteps.backendConfig')}
                    details={
                      <>
                        <FormInput.TextArea
                          name="spec.backendConfig.content"
                          label={getString('pipelineSteps.backendConfig')}
                        />
                      </>
                    }
                  />
                  <Accordion.Panel
                    id="step-4"
                    summary={getString('cf.targets.title')}
                    details={
                      <MultiTypeList
                        name="spec.targets"
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Text style={{ display: 'flex', alignItems: 'center' }}>
                              {getString('cf.targets.title')}
                            </Text>
                          )
                        }}
                        style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
                      />
                    }
                  />
                  <Accordion.Panel
                    id="step-5"
                    summary={getString('environmentVariables')}
                    details={
                      <MultiTypeMap
                        name="spec.environmentVariables"
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Text style={{ display: 'flex', alignItems: 'center' }}>
                              {getString('environmentVariables')}
                              <Button
                                icon="question"
                                minimal
                                tooltip={getString('dependencyEnvironmentVariablesInfo')}
                                iconProps={{ size: 14 }}
                              />
                            </Text>
                          )
                        }}
                      />
                    }
                  />
                </Accordion>
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

export class TerraformDestroy extends PipelineStep<TerraformData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }
  protected type = StepType.TerraformDestroy
  protected defaultValues: TerraformData = {
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
