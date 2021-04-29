import React from 'react'
import {
  IconName,
  FormInput,
  Layout,
  Accordion,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  Button,
  SelectOption
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'

import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { isEmpty } from 'lodash-es'
import { yupToFormErrors, FormikErrors, FormikProps, Formik } from 'formik'

import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
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

import {
  CommandTypes,
  onSubmitTFPlanData,
  TerraformPlanData,
  TerraformPlanProps,
  TerraformVariableStepProps,
  TFPlanFormData
} from '../Common/Terraform/TerraformInterfaces'

import GitStore from './GitStore'
import TfVarFileList from './TFVarFileList'

import TerraformInputStep from './TerraformInputStep'
import { TerraformVariableStep } from './TerraformVariableView'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function TerraformPlanWidget(
  props: TerraformPlanProps,
  formikRef: StepFormikFowardRef<TFPlanFormData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const configurationTypes: SelectOption[] = [
    { label: getString('filters.apply'), value: CommandTypes.Apply },
    { label: getString('pipelineSteps.destroy'), value: CommandTypes.Destroy }
  ]
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  return (
    <Formik<TFPlanFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={initialValues}
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
            <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.MultiTextInput
                  name="spec.provisionerIdentifier"
                  label={getString('pipelineSteps.provisionerIdentifier')}
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
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.Select
                  items={configurationTypes}
                  name="spec.configuration.command"
                  label={getString('commandLabel')}
                  placeholder={getString('commandLabel')}
                />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeConnectorField
                  label={
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
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
                />
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
                        name="spec.configuration.backendConfig.content"
                        label={getString('pipelineSteps.backendConfig')}
                        onChange={ev => {
                          formik.setFieldValue('spec.configuration.backendConfig.content', ev.target.value)
                        }}
                      />
                    </>
                  }
                />
                <Accordion.Panel
                  id="step-4"
                  summary={getString('pipeline.targets.title')}
                  details={
                    <MultiTypeList
                      name="spec.configuration.targets"
                      multiTypeFieldSelectorProps={{
                        label: (
                          <Text style={{ display: 'flex', alignItems: 'center' }}>
                            {getString('pipeline.targets.title')}
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
                      name="spec.configuration.environmentVariables"
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
    return {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec?.configuration,
          command: data.spec?.configuration?.command,
          targets: Array.isArray(data.spec?.configuration?.targets)
            ? data.spec?.configuration?.targets.map(target => ({
                value: target,
                id: uuid()
              }))
            : [{ value: '', id: uuid() }],
          environmentVariables: Array.isArray(data.spec?.configuration?.environmentVariables)
            ? data.spec?.configuration?.environmentVariables.map(variable => ({
                key: variable.name,
                value: variable.description,
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
          initialValues={this.getInitialValues(initialValues)}
          onUpdate={(data: any) => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
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
