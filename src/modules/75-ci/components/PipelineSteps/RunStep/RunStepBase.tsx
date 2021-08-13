import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion
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

import StepCommonFields, {
  GetImagePullPolicyOptions,
  GetShellOptions
} from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useGitScope } from '@ci/services/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
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
  const gitScope = useGitScope()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RunStepData, RunStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions(), shellOptions: GetShellOptions() }
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
                <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'connector' }}>
                  {getString('pipelineSteps.connectorLabel')}
                </Text>
              }
              type={['Gcp', 'Aws', 'DockerRegistry']}
              width={getMultiTypeFromValue(formik?.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560}
              name="spec.connectorRef"
              placeholder={getString('select')}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              multiTypeProps={{ expressions, disabled: readonly }}
              gitScope={gitScope}
              style={{ marginBottom: 'var(--spacing-small)' }}
            />
            <MultiTypeTextField
              name="spec.image"
              label={
                <Text
                  tooltipProps={{
                    dataTooltipId: 'image'
                  }}
                >
                  {getString('imageLabel')}
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
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    tooltipProps={{ dataTooltipId: 'runCommand' }}
                  >
                    {getString('commandLabel')}
                  </Text>
                }
                defaultValueToReset=""
                skipRenderValueInExpressionLabel
                allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                expressionRender={() => {
                  return (
                    <ShellScriptMonacoField
                      title={getString('commandLabel')}
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
                  title={getString('commandLabel')}
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
                  isReadonly={readonly}
                />
              )}
            </div>
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <FormMultiTypeCheckboxField
                      name="spec.privileged"
                      label={getString('ci.privileged')}
                      multiTypeTextbox={{
                        expressions
                      }}
                      tooltipProps={{ dataTooltipId: 'privileged' }}
                      disabled={readonly}
                    />
                    <MultiTypeList
                      name="spec.reportPaths"
                      placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
                      multiTextInputProps={{ expressions }}
                      multiTypeFieldSelectorProps={{
                        label: (
                          <Text
                            style={{ display: 'flex', alignItems: 'center' }}
                            tooltipProps={{ dataTooltipId: 'reportPaths' }}
                          >
                            {getString('pipelineSteps.reportPathsLabel')}
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
                          <Text
                            style={{ display: 'flex', alignItems: 'center' }}
                            tooltipProps={{ dataTooltipId: 'environmentVariables' }}
                          >
                            {getString('environmentVariables')}
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
                          <Text
                            style={{ display: 'flex', alignItems: 'center' }}
                            tooltipProps={{ dataTooltipId: 'outputVariables' }}
                          >
                            {getString('pipelineSteps.outputVariablesLabel')}
                          </Text>
                        )
                      }}
                      disabled={readonly}
                    />
                    <StepCommonFields enableFields={['spec.imagePullPolicy', 'spec.shell']} disabled={readonly} />
                  </>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RunStepBaseWithRef = React.forwardRef(RunStepBase)
