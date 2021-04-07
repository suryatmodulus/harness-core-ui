import React from 'react'
import {
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

import type { FormikProps } from 'formik'
import { useStrings } from 'framework/exports'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'

import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import GitStore from './GitStore'
import BaseForm from './BaseForm'

import TfVarFileList from './TFVarFileList'
import {
  ConfigurationTypes,
  onSubmitTerraformData,
  TerraformData,
  TerraformProps,
  TerraformStoreTypes
} from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const setInitialValues = (data: TerraformData): TerraformData => {
  return data
}

export default function TerraformEditView(
  props: TerraformProps,
  formikRef: StepFormikFowardRef<TerraformData>
): React.ReactElement {
  const { stepType, isNewStep = true } = props
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const planValidationSchema = Yup.object().shape({
    name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),

    ...IdentifierValidation(),
    spec: Yup.object().shape({
      provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired')),
      configuration: Yup.object().shape({
        command: Yup.string().required(getString('pipelineSteps.commandRequired'))
      })
    })
  })
  const regularValidationSchema = Yup.object().shape({
    name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),

    ...IdentifierValidation(),
    spec: Yup.object().shape({
      provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired')),
      configuration: Yup.object().shape({
        type: Yup.string().required(getString('pipelineSteps.configurationTypeRequired'))
      })
    })
  })

  const configurationTypes: SelectOption[] = [
    { label: getString('inline'), value: ConfigurationTypes.Inline },
    { label: getString('pipelineSteps.configTypes.fromPlan'), value: ConfigurationTypes.InheritFromPlan }
  ]
  return (
    <>
      <Formik<TerraformData>
        onSubmit={(values: TerraformData) => {
          const payload = onSubmitTerraformData(values)
          onUpdate?.(payload)
        }}
        initialValues={setInitialValues(initialValues)}
        validationSchema={stepType === StepType.TerraformPlan ? planValidationSchema : regularValidationSchema}
      >
        {(formik: FormikProps<TerraformData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
                </div>
                {stepType !== StepType.TerraformPlan && (
                  <BaseForm formik={formik} configurationTypes={configurationTypes} />
                )}
                {stepType === StepType.TerraformPlan && (
                  <BaseForm formik={formik} configurationTypes={configurationTypes} showCommand={true} />
                )}
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

                {(formik.values?.spec?.configuration?.type === ConfigurationTypes.Inline ||
                  stepType === StepType.TerraformPlan) && (
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
                            name="spec.backendConfig.spec.content"
                            label={getString('pipelineSteps.backendConfig')}
                            onChange={ev => {
                              formik.setFieldValue('spec.backendConfig.type', TerraformStoreTypes.Inline)
                              formik.setFieldValue('spec.backendConfig.spec.content', ev.target.value)
                            }}
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
                )}
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}
