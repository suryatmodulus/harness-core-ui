import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  ExpressionInput
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { FormMultiTypeCheckboxField } from '@common/components'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'

import StepCommonFields /*,{ /*usePullOptions }*/ from '@pipeline/components/StepCommonFields/StepCommonFields'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { RunTestsStepProps, RunTestsStepData, RunTestsStepDataUI } from './RunTestsStep'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './RunTestsStepFunctionConfigs'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunTestsStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: RunTestsStepProps,
  formikRef: StepFormikFowardRef<RunTestsStepData>
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

  const buildToolOptions = [
    { label: 'Bazel', value: 'bazel' },
    { label: 'Maven', value: 'maven' }
  ]
  const languageOptions = [{ label: 'Java', value: 'java' }]

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<RunTestsStepData, RunTestsStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RunTestsStepData, RunTestsStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { buildToolOptions, languageOptions }
      )}
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: RunTestsStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RunTestsStepDataUI, RunTestsStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RunTestsStepData>) => {
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
                style={{ marginBottom: 0, marginTop: 'var(--spacing-small)' }}
              />
              <MultiTypeTextField
                name="spec.image"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('imageLabel')}
                    <Button icon="question" minimal tooltip={getString('imageInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTextInputProps={{
                  placeholder: getString('imagePlaceholder'),
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
              <MultiTypeTextField
                name="spec.args"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('argsLabel')}
                    <Button icon="question" minimal tooltip={getString('runTestsArgsInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
              <MultiTypeSelectField
                name="spec.buildTool"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('buildToolLabel')}
                    <Button icon="question" minimal tooltip={getString('buildToolInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: buildToolOptions,
                  multiTypeInputProps: { expressions },
                  disabled: readonly
                }}
              />
              <MultiTypeSelectField
                name="spec.language"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('languageLabel')}
                    <Button icon="question" minimal tooltip={getString('languageInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: languageOptions,
                  multiTypeInputProps: { expressions },
                  disabled: readonly
                }}
              />
              <MultiTypeTextField
                name="spec.packages"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('packagesLabel')}
                    <Button icon="question" minimal tooltip={getString('packagesInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
            </div>
            <div className={css.fieldsSection}>
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
              <FormMultiTypeCheckboxField
                name="spec.runOnlySelectedTests"
                label={getString('runOnlySelectedTestsLabel')}
                multiTypeTextbox={{ expressions, disabled: readonly }}
                style={{ marginBottom: 'var(--spacing-small)' }}
                disabled={readonly}
              />
              <MultiTypeTextField
                name="spec.testAnnotations"
                label={
                  <Text>
                    {getString('testAnnotationsLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('testAnnotationsInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <div className={cx(css.fieldsGroup, css.withoutSpacing)} style={{ marginBottom: 'var(--spacing-small)' }}>
                <MultiTypeFieldSelector
                  name="spec.preCommand"
                  label={
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('preCommandLabel')}
                      <Button icon="question" minimal tooltip={getString('preCommandInfo')} iconProps={{ size: 14 }} />
                    </Text>
                  }
                  defaultValueToReset=""
                  allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                  expressionRender={() => {
                    return (
                      <ExpressionInput
                        value={formik?.values?.spec?.preCommand || ''}
                        name="spec.preCommand"
                        items={expressions}
                        onChange={value => formik?.setFieldValue('spec.preCommand', value)}
                      />
                    )
                  }}
                  style={{ flexGrow: 1, marginBottom: 0 }}
                  disableTypeSelection={readonly}
                >
                  <ShellScriptMonacoField name="spec.preCommand" scriptType="Bash" disabled={readonly} />
                </MultiTypeFieldSelector>
                {getMultiTypeFromValue(formik?.values?.spec?.preCommand) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik?.values?.spec?.preCommand as string}
                    type={getString('string')}
                    variableName="spec.preCommand"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik?.setFieldValue('spec.preCommand', value)}
                  />
                )}
              </div>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)} style={{ marginBottom: 'var(--spacing-small)' }}>
                <MultiTypeFieldSelector
                  name="spec.postCommand"
                  label={
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('postCommandLabel')}
                      <Button icon="question" minimal tooltip={getString('postCommandInfo')} iconProps={{ size: 14 }} />
                    </Text>
                  }
                  defaultValueToReset=""
                  allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                  expressionRender={() => {
                    return (
                      <ExpressionInput
                        value={formik?.values?.spec?.postCommand || ''}
                        name="spec.postCommand"
                        items={expressions}
                        onChange={value => formik?.setFieldValue('spec.postCommand', value)}
                      />
                    )
                  }}
                  style={{ flexGrow: 1, marginBottom: 0 }}
                  disableTypeSelection={readonly}
                >
                  <ShellScriptMonacoField name="spec.postCommand" scriptType="Bash" disabled={readonly} />
                </MultiTypeFieldSelector>
                {getMultiTypeFromValue(formik?.values?.spec?.postCommand) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik?.values?.spec?.postCommand as string}
                    type={getString('string')}
                    variableName="spec.postCommand"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik?.setFieldValue('spec.postCommand', value)}
                  />
                )}
              </div>
              <MultiTypeList
                name="spec.reportPaths"
                placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
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
                multiTextInputProps={{ expressions }}
                style={{ marginBottom: 'var(--spacing-small)' }}
                disabled={readonly}
              />
              <MultiTypeMap
                name="spec.envVariables"
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
                valueMultiTextInputProps={{ expressions }}
                style={{ marginBottom: 'var(--spacing-small)' }}
                disabled={readonly}
              />
              <MultiTypeList
                name="spec.outputVariables"
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
                multiTextInputProps={{ expressions }}
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

export const RunTestsStepBaseWithRef = React.forwardRef(RunTestsStepBase)
