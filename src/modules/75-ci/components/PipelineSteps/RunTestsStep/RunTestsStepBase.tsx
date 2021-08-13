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

import StepCommonFields, {
  GetImagePullPolicyOptions /*,{ /*usePullOptions }*/
} from '@pipeline/components/StepCommonFields/StepCommonFields'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { useGitScope } from '@ci/services/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
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
  const gitScope = useGitScope()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  const buildToolOptions = [
    { label: 'Bazel', value: 'Bazel' },
    { label: 'Maven', value: 'Maven' }
  ]
  const languageOptions = [{ label: 'Java', value: 'Java' }]

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
        { buildToolOptions, languageOptions, imagePullPolicyOptions: GetImagePullPolicyOptions() }
      )}
      formName="ciRunTests"
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
              style={{ marginBottom: 0, marginTop: 'var(--spacing-small)' }}
            />
            <MultiTypeTextField
              name="spec.image"
              label={
                <Text
                  margin={{ top: 'small' }}
                  tooltipProps={{
                    dataTooltipId: 'image'
                  }}
                >
                  {getString('imageLabel')}
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
                <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'runTestsArgs' }}>
                  {getString('argsLabel')}
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
                <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'runTestsBuildTool' }}>
                  {getString('buildToolLabel')}
                </Text>
              }
              multiTypeInputProps={{
                selectItems: buildToolOptions,
                multiTypeInputProps: { expressions },
                disabled: readonly
              }}
              disabled={readonly}
            />
            <MultiTypeSelectField
              name="spec.language"
              label={
                <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'runTestsLanguage' }}>
                  {getString('languageLabel')}
                </Text>
              }
              multiTypeInputProps={{
                selectItems: languageOptions,
                multiTypeInputProps: { expressions },
                disabled: readonly
              }}
              disabled={readonly}
            />
            <MultiTypeTextField
              name="spec.packages"
              label={
                <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'runTestsPackages' }}>
                  {getString('packagesLabel')}
                </Text>
              }
              multiTextInputProps={{
                multiTextInputProps: { expressions },
                disabled: readonly
              }}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
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
                        <Text tooltipProps={{ dataTooltipId: 'runTestsTestAnnotations' }}>
                          {getString('testAnnotationsLabel')}
                        </Text>
                      }
                      multiTextInputProps={{
                        multiTextInputProps: { expressions },
                        disabled: readonly
                      }}
                      style={{ marginBottom: 'var(--spacing-small)' }}
                    />
                    <div
                      className={cx(css.fieldsGroup, css.withoutSpacing)}
                      style={{ marginBottom: 'var(--spacing-small)' }}
                    >
                      <MultiTypeFieldSelector
                        name="spec.preCommand"
                        label={
                          <Text
                            style={{ display: 'flex', alignItems: 'center' }}
                            tooltipProps={{ dataTooltipId: 'runTestsPreCommand' }}
                          >
                            {getString('preCommandLabel')}
                          </Text>
                        }
                        defaultValueToReset=""
                        allowedTypes={[
                          MultiTypeInputType.EXPRESSION,
                          MultiTypeInputType.FIXED,
                          MultiTypeInputType.RUNTIME
                        ]}
                        expressionRender={() => {
                          return (
                            <ShellScriptMonacoField
                              name="spec.preCommand"
                              scriptType="Bash"
                              disabled={readonly}
                              expressions={expressions}
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
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <div
                      className={cx(css.fieldsGroup, css.withoutSpacing)}
                      style={{ marginBottom: 'var(--spacing-small)' }}
                    >
                      <MultiTypeFieldSelector
                        name="spec.postCommand"
                        label={
                          <Text
                            style={{ display: 'flex', alignItems: 'center' }}
                            tooltipProps={{ dataTooltipId: 'runTestsPostCommand' }}
                          >
                            {getString('postCommandLabel')}
                          </Text>
                        }
                        defaultValueToReset=""
                        allowedTypes={[
                          MultiTypeInputType.EXPRESSION,
                          MultiTypeInputType.FIXED,
                          MultiTypeInputType.RUNTIME
                        ]}
                        skipRenderValueInExpressionLabel
                        expressionRender={() => {
                          return (
                            <ShellScriptMonacoField
                              name="spec.postCommand"
                              scriptType="Bash"
                              disabled={readonly}
                              expressions={expressions}
                            />
                          )
                        }}
                        style={{ flexGrow: 1, marginBottom: 0 }}
                        disableTypeSelection={readonly}
                      >
                        <ShellScriptMonacoField
                          name="spec.postCommand"
                          scriptType="Bash"
                          disabled={readonly}
                          expressions={expressions}
                        />
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
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <MultiTypeList
                      name="spec.reportPaths"
                      placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
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
                      multiTextInputProps={{ expressions }}
                      style={{ marginBottom: 'var(--spacing-small)' }}
                      disabled={readonly}
                    />
                    <MultiTypeMap
                      name="spec.envVariables"
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
                      valueMultiTextInputProps={{ expressions }}
                      style={{ marginBottom: 'var(--spacing-small)' }}
                      disabled={readonly}
                    />
                    <MultiTypeList
                      name="spec.outputVariables"
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
                      multiTextInputProps={{ expressions }}
                      disabled={readonly}
                    />
                    <StepCommonFields enableFields={['spec.imagePullPolicy']} disabled={readonly} />
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

export const RunTestsStepBaseWithRef = React.forwardRef(RunTestsStepBase)
