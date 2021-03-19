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
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/exports'
import { useStrings } from 'framework/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@cd/components/PipelineSteps/ShellScriptStep/ShellScriptMonaco'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
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
  { initialValues, onUpdate }: RunStepProps,
  formikRef: StepFormikFowardRef<RunStepData>
): JSX.Element => {
  const {
    state: { pipelineView },

    getStageFromPipeline
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { stage: currentStage } = getStageFromPipeline(pipelineView.splitViewData.selectedStageId || '')

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
                isIdentifierEditable={isEmpty(initialValues.identifier)}
                inputLabel={getString('pipelineSteps.stepNameLabel')}
              />
              <FormMultiTypeTextAreaField
                className={css.removeBpLabelMargin}
                name="description"
                label={<Text margin={{ bottom: 'xsmall' }}>{getString('description')}</Text>}
                multiTypeTextArea={{ expressions }}
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
                multiTypeProps={{ expressions }}
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
                  placeholder: getString('imagePlaceholder')
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
                  allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                  expressionRender={() => {
                    return (
                      <ExpressionInput
                        value={formik?.values?.spec?.command || ''}
                        name="spec.command"
                        items={expressions}
                        onChange={value => formik?.setFieldValue('spec.command', value)}
                      />
                    )
                  }}
                  style={{ flexGrow: 1, marginBottom: 0 }}
                >
                  <ShellScriptMonacoField name="spec.command" scriptType="Bash" />
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
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
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
              />
              <StepCommonFields />
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RunStepBaseWithRef = React.forwardRef(RunStepBase)
