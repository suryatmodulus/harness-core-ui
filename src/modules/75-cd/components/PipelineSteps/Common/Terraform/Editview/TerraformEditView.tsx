import React from 'react'
import {
  Button,
  Formik,
  FormInput,
  Text,
  Accordion,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  ExpressionInput,
  Icon,
  Layout,
  Color,
  Label
} from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'

import type { FormikProps } from 'formik'

import { Classes, Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'

import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { TFMonaco } from './TFMonacoEditor'

import TfVarFileList from './TFVarFileList'
import { ConfigurationTypes, TFFormData, TerraformProps } from '../TerraformInterfaces'
import ConfigForm from './ConfigForm'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformVarfile.module.scss'

const setInitialValues = (data: TFFormData): TFFormData => {
  return data
}

export default function TerraformEditView(
  props: TerraformProps,
  formikRef: StepFormikFowardRef<TFFormData>
): React.ReactElement {
  const { stepType, isNewStep = true } = props
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const planValidationSchema = Yup.object().shape({
    name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    identifier: IdentifierSchema(),
    spec: Yup.object().shape({
      provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired')),
      configuration: Yup.object().shape({
        command: Yup.string().required(getString('pipelineSteps.commandRequired'))
      })
    })
  })
  const regularValidationSchema = Yup.object().shape({
    name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
    identifier: IdentifierSchema(),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired')),
      configuration: Yup.object().shape({
        type: Yup.string().required(getString('pipelineSteps.configurationTypeRequired'))
      })
    })
  })
  let configurationTypes: SelectOption[]
  if (stepType === StepType.TerraformApply) {
    configurationTypes = [
      { label: getString('inline'), value: ConfigurationTypes.Inline },
      { label: getString('pipelineSteps.configTypes.fromPlan'), value: ConfigurationTypes.InheritFromPlan }
    ]
  } else {
    configurationTypes = [
      { label: getString('inline'), value: ConfigurationTypes.Inline },
      { label: getString('pipelineSteps.configTypes.fromPlan'), value: ConfigurationTypes.InheritFromPlan },
      { label: getString('pipelineSteps.configTypes.fromApply'), value: ConfigurationTypes.InheritFromApply }
    ]
  }

  const [showModal, setShowModal] = React.useState(false)

  const modalProps = {
    isOpen: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    style: { width: 1000 }
  }
  return (
    <>
      <Formik<TFFormData>
        onSubmit={values => {
          const payload = {
            ...values
          }
          onUpdate?.(payload as any)
        }}
        formName="terraformEdit"
        initialValues={setInitialValues(initialValues as any)}
        validationSchema={stepType === StepType.TerraformPlan ? planValidationSchema : regularValidationSchema}
      >
        {(formik: FormikProps<TFFormData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)

          return (
            <>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier inputLabel={getString('cd.stepName')} isIdentifierEditable={isNewStep} />
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
                    isReadonly={props.readonly}
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
              <div className={cx(css.fieldBorder, css.addMarginBottom)} />

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.MultiTextInput
                  name="spec.provisionerIdentifier"
                  label={getString('pipelineSteps.provisionerIdentifier')}
                  multiTextInputProps={{ expressions }}
                />
                {getMultiTypeFromValue(values.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.spec?.provisionerIdentifier as string}
                    type="String"
                    variableName="spec.provisionerIdentifier"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('spec.provisionerIdentifier', value)
                    }}
                    isReadonly={props.readonly}
                  />
                )}
              </div>

              <div className={cx(css.fieldBorder, css.addMarginBottom)} />
              {formik.values?.spec?.configuration?.type === ConfigurationTypes.Inline && (
                <>
                  <Layout.Vertical className={cx(css.addMarginBottom)}>
                    <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                      {getString('cd.configurationFile')}
                    </Label>
                    <div className={cx(css.configFile, css.addMarginBottom)}>
                      <Label style={{ color: '#000000' }} className={css.configFileLabel}>
                        {getString('secret.labelFile')}
                      </Label>
                      <div className={css.configField}>
                        {!formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath && (
                          <Text className={css.configPlaceHolder}>-{getString('cd.configFilePlaceHolder')}-</Text>
                        )}
                        {formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath && (
                          <Text intent="primary">
                            /{formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath}
                          </Text>
                        )}
                        <Icon name="edit" onClick={() => setShowModal(true)} data-name="config-edit" />
                      </div>
                    </div>
                  </Layout.Vertical>
                  <div className={cx(css.fieldBorder, css.addMarginBottom)} />
                  <div className={css.addMarginTop}>
                    <Accordion activeId="step-1" className={stepCss.accordion}>
                      <Accordion.Panel
                        id="step-1"
                        summary={getString('cd.optionalConfig')}
                        details={
                          <>
                            {formik.values?.spec?.configuration?.type === ConfigurationTypes.Inline && (
                              <div className={cx(stepCss.formGroup, stepCss.md)}>
                                <FormInput.MultiTextInput
                                  name="spec.configuration.spec.workspace"
                                  label={getString('pipelineSteps.workspace')}
                                  multiTextInputProps={{ expressions }}
                                />
                                {getMultiTypeFromValue(formik.values.spec?.configuration?.spec?.workspace) ===
                                  MultiTypeInputType.RUNTIME && (
                                  <ConfigureOptions
                                    value={formik.values?.spec?.configuration?.spec?.workspace as string}
                                    type="String"
                                    variableName="configuration.spec.workspace"
                                    showRequiredField={false}
                                    showDefaultField={false}
                                    showAdvanced={true}
                                    onChange={value => {
                                      formik.setFieldValue('values.spec.configuration.spec.workspace', value)
                                    }}
                                    isReadonly={props.readonly}
                                  />
                                )}
                              </div>
                            )}
                            <div className={cx(css.fieldBorder, css.addMarginBottom)} />
                            <TfVarFileList formik={formik} isReadonly={props.readonly} />
                            <div className={cx(css.fieldBorder, css.addMarginBottom)} />
                            <div
                              className={cx(
                                stepCss.formGroup,
                                stepCss.alignStart,
                                css.addMarginTop,
                                css.addMarginBottom
                              )}
                            >
                              <MultiTypeFieldSelector
                                name="spec.configuration.spec.backendConfig.spec.content"
                                label={
                                  <Text style={{ color: 'rgb(11, 11, 13)' }}>{getString('cd.backEndConfig')}</Text>
                                }
                                defaultValueToReset=""
                                allowedTypes={[
                                  MultiTypeInputType.EXPRESSION,
                                  MultiTypeInputType.FIXED,
                                  MultiTypeInputType.RUNTIME
                                ]}
                                expressionRender={() => {
                                  return (
                                    <ExpressionInput
                                      value={
                                        formik.values.spec?.configuration?.spec?.backendConfig?.spec?.content || ''
                                      }
                                      name="spec.configuration.spec.backendConfig.spec.content"
                                      onChange={value => {
                                        setFieldValue('spec.configuration.spec.backendConfig.type', 'Inline')
                                        setFieldValue('spec.configuration.spec.backendConfig.spec.content', value)
                                      }}
                                    />
                                  )
                                }}
                              >
                                <TFMonaco
                                  name="spec.configuration.spec.backendConfig.spec.content"
                                  formik={formik}
                                  title={getString('cd.backEndConfig')}
                                />
                              </MultiTypeFieldSelector>
                              {getMultiTypeFromValue(
                                formik.values.spec?.configuration?.spec?.backendConfig?.spec?.content
                              ) === MultiTypeInputType.RUNTIME && (
                                <ConfigureOptions
                                  value={
                                    formik.values.spec?.configuration?.spec?.backendConfig?.spec?.content as string
                                  }
                                  type="String"
                                  variableName="spec.configuration.spec.backendConfig.spec.content"
                                  showRequiredField={false}
                                  showDefaultField={false}
                                  showAdvanced={true}
                                  onChange={value =>
                                    setFieldValue('spec.configuration.spec.backendConfig.spec.content', value)
                                  }
                                  isReadonly={props.readonly}
                                />
                              )}
                            </div>
                            <div className={cx(css.fieldBorder, css.addMarginBottom)} />
                            <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                              <MultiTypeList
                                multiTextInputProps={{ expressions }}
                                name="spec.configuration.spec.targets"
                                multiTypeFieldSelectorProps={{
                                  label: (
                                    <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                                      {getString('pipeline.targets.title')}
                                    </Text>
                                  )
                                }}
                                style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
                              />
                            </div>
                            <div className={cx(css.fieldBorder, css.addMarginBottom)} />
                            <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                              <MultiTypeMap
                                valueMultiTextInputProps={{ expressions }}
                                name="spec.configuration.spec.environmentVariables"
                                multiTypeFieldSelectorProps={{
                                  disableTypeSelection: true,

                                  label: (
                                    <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
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
                            </div>
                          </>
                        }
                      />
                    </Accordion>
                  </div>

                  {showModal && (
                    <Dialog
                      onClose={() => setShowModal(false)}
                      className={cx(Classes.DIALOG)}
                      {...modalProps}
                      title={getString('pipelineSteps.configFiles')}
                      isCloseButtonShown
                    >
                      <ConfigForm
                        onClick={data => {
                          const configObject = {
                            ...data.spec?.configuration?.spec?.configFiles
                          }

                          if (configObject?.store.spec.gitFetchType === 'Branch') {
                            delete configObject.store.spec.commitId
                          } else if (configObject?.store.spec.gitFetchType === 'Commit') {
                            delete configObject.store.spec.branch
                          }
                          const valObj = {
                            ...formik.values,
                            spec: {
                              ...formik.values?.spec,
                              configuration: {
                                ...formik.values?.spec?.configuration,
                                spec: {
                                  ...formik.values?.spec?.configuration?.spec,
                                  configFiles: { ...configObject }
                                }
                              }
                            }
                          }

                          formik.setValues(valObj)

                          setShowModal(false)
                        }}
                        data={formik.values}
                        onHide={() => setShowModal(false)}
                        isReadonly={props.readonly}
                      />
                    </Dialog>
                  )}
                </>
              )}
            </>
          )
        }}
      </Formik>
    </>
  )
}
