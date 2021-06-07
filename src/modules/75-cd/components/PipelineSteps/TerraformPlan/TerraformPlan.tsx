import React from 'react'
import {
  IconName,
  FormInput,
  Accordion,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  Button,
  Icon,
  ExpressionInput,
  Layout,
  Label,
  Color
} from '@wings-software/uicore'
import { Classes, Dialog, IOptionProps } from '@blueprintjs/core'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'

import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { isEmpty } from 'lodash-es'
import { yupToFormErrors, FormikErrors, FormikProps, Formik } from 'formik'

import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
// import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { StringKeys } from 'framework/strings'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useStrings } from 'framework/strings'

import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { StringNGVariable } from 'services/cd-ng'

import {
  CommandTypes,
  onSubmitTFPlanData,
  TerraformPlanData,
  TerraformPlanProps,
  TerraformVariableStepProps,
  TFPlanFormData
} from '../Common/Terraform/TerraformInterfaces'
import TfVarFileList from './TfPlanVarFileList'
import ConfigForm from './TfPlanConfigForm'

import TerraformInputStep from './TfPlanInputStep'
import { TerraformVariableStep } from './TfPlanVariableView'

import { TFMonaco } from '../Common/Terraform/Editview/TFMonacoEditor'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../Common/Terraform/Editview/TerraformVarfile.module.scss'

const setInitialValues = (data: TFPlanFormData): TFPlanFormData => {
  return data
}

function TerraformPlanWidget(
  props: TerraformPlanProps,
  formikRef: StepFormikFowardRef<TFPlanFormData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const commandTypeOptions: IOptionProps[] = [
    { label: getString('filters.apply'), value: CommandTypes.Apply },
    { label: getString('pipelineSteps.destroy'), value: CommandTypes.Destroy }
  ]

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const modalProps = {
    isOpen: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    style: { width: 1000 }
  }

  const [showModal, setShowModal] = React.useState(false)
  return (
    <Formik<TFPlanFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={setInitialValues(initialValues)}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),

        ...IdentifierValidation(),
        spec: Yup.object().shape({
          provisionerIdentifier: Yup.string().required(getString('pipelineSteps.provisionerIdentifierRequired')),
          configuration: Yup.object().shape({
            command: Yup.string().required(getString('pipelineSteps.commandRequired'))
          })
        })
      })}
    >
      {(formik: FormikProps<TFPlanFormData>) => {
        const { values, setFieldValue } = formik
        setFormikRef(formikRef, formik)
        return (
          <>
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
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.RadioGroup
                  name="spec.configuration.command"
                  label={getString('commandLabel')}
                  radioGroup={{ inline: true }}
                  items={commandTypeOptions}
                  className={css.radioBtns}
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
                  />
                )}
              </div>

              <div className={cx(css.fieldBorder, css.addMarginBottom)} />
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeConnectorField
                  label={
                    <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                      {getString('connectors.title.secretManager')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('connectors.title.secretManager')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  }
                  category={'SECRET_MANAGER'}
                  width={
                    getMultiTypeFromValue(formik.values?.spec?.configuration?.secretManagerRef) ===
                    MultiTypeInputType.RUNTIME
                      ? 200
                      : 260
                  }
                  name="spec.configuration.secretManagerRef"
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  style={{ marginBottom: 10 }}
                  multiTypeProps={{ expressions }}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
              </div>

              <div className={cx(css.fieldBorder, css.addMarginBottom)} />
              <Layout.Vertical className={cx(css.addMarginBottom)}>
                <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                  {getString('cd.configurationFile')}
                </Label>
                <div className={cx(css.configFile, css.addMarginBottom)}>
                  <Label style={{ color: '#000000' }} className={css.configFileLabel}>
                    {getString('secret.labelFile')}
                  </Label>
                  <div className={css.configField}>
                    {!formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath && (
                      <Text className={css.configPlaceHolder}>-{getString('cd.configFilePlaceHolder')}-</Text>
                    )}
                    {formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath && (
                      <Text intent="primary">
                        /{formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath}
                      </Text>
                    )}
                    <Icon name="edit" onClick={() => setShowModal(true)} />
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
                        <div className={cx(stepCss.formGroup, stepCss.md)}>
                          <FormInput.MultiTextInput
                            name="spec.configuration.workspace"
                            label={getString('pipelineSteps.workspace')}
                            multiTextInputProps={{ expressions }}
                          />
                          {getMultiTypeFromValue(formik.values.spec?.configuration?.workspace) ===
                            MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formik.values?.spec?.configuration?.workspace as string}
                              type="String"
                              variableName="spec.configuration.workspace"
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value => {
                                /* istanbul ignore else */
                                formik.setFieldValue('values.spec.configuration.workspace', value)
                              }}
                            />
                          )}
                        </div>
                        <div className={cx(css.fieldBorder, css.addMarginBottom)} />
                        <TfVarFileList formik={formik} />
                        <div className={cx(css.fieldBorder, css.addMarginBottom)} />
                        <div
                          className={cx(stepCss.formGroup, stepCss.alignStart, css.addMarginTop, css.addMarginBottom)}
                        >
                          <MultiTypeFieldSelector
                            name="spec.configuration.backendConfig.spec.content"
                            label={<Text style={{ color: 'rgb(11, 11, 13)' }}>{getString('cd.backEndConfig')}</Text>}
                            defaultValueToReset=""
                            allowedTypes={[
                              MultiTypeInputType.EXPRESSION,
                              MultiTypeInputType.FIXED,
                              MultiTypeInputType.RUNTIME
                            ]}
                            expressionRender={() => {
                              return (
                                <ExpressionInput
                                  value={formik.values.spec?.configuration?.backendConfig?.spec?.content || ''}
                                  name="spec.configuration.backendConfig.spec.content"
                                  onChange={value =>
                                    setFieldValue('spec.configuration.backendConfig.spec.content', value)
                                  }
                                />
                              )
                            }}
                            skipRenderValueInExpressionLabel
                          >
                            <TFMonaco name="spec.configuration.backendConfig.spec.content" formik={formik} />
                          </MultiTypeFieldSelector>
                          {getMultiTypeFromValue(formik.values.spec?.configuration?.backendConfig?.spec?.content) ===
                            MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formik.values.spec?.configuration?.backendConfig?.spec?.content as string}
                              type="String"
                              variableName="spec.configuration.backendConfig.spec.content"
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value => setFieldValue('spec.configuration.backendConfig.spec.content', value)}
                            />
                          )}
                        </div>
                        <div className={cx(css.fieldBorder, css.addMarginBottom)} />
                        <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                          <MultiTypeList
                            name="spec.configuration.targets"
                            multiTextInputProps={{ expressions }}
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
                            name="spec.configuration.environmentVariables"
                            valueMultiTextInputProps={{ expressions }}
                            multiTypeFieldSelectorProps={{
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
            </>

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
                    const valObj = {
                      ...formik.values,
                      spec: {
                        ...formik.values?.spec,
                        configuration: {
                          ...formik.values?.spec?.configuration,

                          configFiles: data.spec?.configuration?.configFiles
                        }
                      }
                    }

                    formik.setValues(valObj)

                    setShowModal(false)
                  }}
                  data={formik.values}
                  onHide={() => setShowModal(false)}
                />
              </Dialog>
            )}
          </>
        )
      }}
    </Formik>
  )
}
const TerraformPlanWidgetWithRef = React.forwardRef(TerraformPlanWidget)
export class TerraformPlan extends PipelineStep<TFPlanFormData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformPlan
  protected defaultValues: TFPlanFormData = {
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: ''
    }
  }
  protected stepIcon: IconName = 'terraform-apply-new'
  protected stepName = 'Terraform Plan'
  validateInputSet(
    data: TFPlanFormData,
    template?: TFPlanFormData,
    getString?: (key: StringKeys, vars?: Record<string, any>) => string
  ): FormikErrors<TFPlanFormData> {
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

  private getInitialValues(data: TFPlanFormData): TerraformPlanData {
    const envVars = data.spec?.configuration?.environmentVariables as StringNGVariable[]
    return {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec?.configuration,

          configFiles: data.spec?.configuration?.configFiles,
          command: data.spec?.configuration?.command,
          targets: Array.isArray(data.spec?.configuration?.targets)
            ? data.spec?.configuration?.targets.map(target => ({
                value: target,
                id: uuid()
              }))
            : [{ value: '', id: uuid() }],
          environmentVariables: Array.isArray(envVars)
            ? envVars.map(variable => ({
                key: variable.name,
                value: variable?.value,
                id: uuid()
              }))
            : [{ key: '', value: '', id: uuid() }]
        }
      }
    }
  }

  processFormData(data: any): TFPlanFormData {
    return onSubmitTFPlanData(data)
  }

  renderStep(props: StepProps<TFPlanFormData, unknown>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, formikRef, isNewStep } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <TerraformInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={inputSetData?.path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformVariableStep
          {...(customStepProps as TerraformVariableStepProps)}
          initialValues={this.getInitialValues(initialValues)}
          onUpdate={(data: any) => onUpdate?.(this.processFormData(data))}
        />
      )
    }
    return (
      <TerraformPlanWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        stepType={StepType.TerraformPlan}
      />
    )
  }
}
