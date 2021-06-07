import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm
} from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'

import StepCommonFields /*,{ /*usePullOptions }*/ from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { RunStepProps, RunStepData, RunStepDataUI } from './RunStep'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './RunStepFunctionConfigs'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: RunStepProps,
  formikRef: StepFormikFowardRef<RunStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { stage: currentStage } = getStageFromPipeline(selectedStageId || '')

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<RunStepData, RunStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RunStepData, RunStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="ciRunStep"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || [],
          getString
        })
      }}
      onSubmit={(_values: RunStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RunStepDataUI, RunStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RunStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <div className={css.fieldsSection}>
              <FormInput.InputWithIdentifier
                inputName="name"
                idName="identifier"
                isIdentifierEditable={isNewStep}
                inputLabel={getString('pipelineSteps.stepNameLabel')}
                inputGroupProps={{ disabled: readonly }}
              />
              <FormMultiTypeTextAreaField
                className={css.removeBpLabelMargin}
                name="description"
                label={<Text margin={{ bottom: 'xsmall' }}>{getString('description')}</Text>}
                multiTypeTextArea={{ expressions, disabled: readonly }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <FormMultiTypeConnectorField
                label={
                  <Text style={{ display: 'flex', alignItems: 'center' }}>
                    {getString('pipelineSteps.connectorLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.connectorInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                type={['Gcp', 'Aws', 'DockerRegistry']}
                width={
                  getMultiTypeFromValue(formik?.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560
                }
                name="spec.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                multiTypeProps={{ expressions, disabled: readonly }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <MultiTypeTextField
                name="spec.image"
                label={
                  <Text>
                    {getString('imageLabel')}
                    <Button icon="question" minimal tooltip={getString('imageInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTextInputProps={{
                  placeholder: getString('imagePlaceholder'),
                  disabled: readonly,
                  multiTextInputProps: {
                    expressions
                  }
                }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <MultiTypeFieldSelector
                  name="spec.command"
                  label={
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('commandLabel')}
                      <Button icon="question" minimal tooltip={getString('commandInfo')} iconProps={{ size: 14 }} />
                    </Text>
                  }
                  defaultValueToReset=""
                  skipRenderValueInExpressionLabel
                  allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                  expressionRender={() => {
                    return (
                      <ShellScriptMonacoField
                        name="spec.command"
                        scriptType="Bash"
                        expressions={expressions}
                        disabled={readonly}
                      />
                    )
                  }}
                  style={{ flexGrow: 1, marginBottom: 0 }}
                  disableTypeSelection={readonly}
                >
                  <ShellScriptMonacoField
                    name="spec.command"
                    scriptType="Bash"
                    disabled={readonly}
                    expressions={expressions}
                  />
                </MultiTypeFieldSelector>
                {getMultiTypeFromValue(formik?.values?.spec?.command) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik?.values?.spec?.command as string}
                    type={getString('string')}
                    variableName="spec.command"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik?.setFieldValue('spec.command', value)}
                  />
                )}
              </div>
            </div>
            <div className={css.fieldsSection}>
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'large' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
              <FormMultiTypeCheckboxField
                name="spec.privileged"
                className={css.checkboxField}
                label={getString('ci.privileged')}
                multiTypeTextbox={{
                  children: (
                    <Button icon="question" minimal tooltip={getString('ci.privilegedInfo')} iconProps={{ size: 14 }} />
                  ),
                  expressions
                }}
                disabled={readonly}
              />
              <MultiTypeList
                name="spec.reportPaths"
                placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
                multiTextInputProps={{ expressions }}
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('pipelineSteps.reportPathsLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.reportPathsInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  )
                }}
                style={{ marginBottom: 'var(--spacing-small)' }}
                disabled={readonly}
              />
              <MultiTypeMap
                name="spec.envVariables"
                valueMultiTextInputProps={{ expressions }}
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('environmentVariables')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('environmentVariablesInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  )
                }}
                style={{ marginBottom: 'var(--spacing-small)' }}
                disabled={readonly}
              />
              <MultiTypeList
                name="spec.outputVariables"
                multiTextInputProps={{ expressions }}
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('pipelineSteps.outputVariablesLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.outputVariablesInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  )
                }}
                disabled={readonly}
              />
              <StepCommonFields disabled={readonly} />
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RunStepBaseWithRef = React.forwardRef(RunStepBase)
