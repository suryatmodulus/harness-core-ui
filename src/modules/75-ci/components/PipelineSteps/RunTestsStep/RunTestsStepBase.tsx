import React, { FormEvent } from 'react'
import {
  Text,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion,
  RadioButtonGroup,
  CodeBlock,
  Container,
  Color
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { Connectors } from '@connectors/constants'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { FormMultiTypeCheckboxField } from '@common/components'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'

import StepCommonFields, {
  GetImagePullPolicyOptions /*,{ /*usePullOptions }*/
} from '@pipeline/components/StepCommonFields/StepCommonFields'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { RunTestsStepProps, RunTestsStepData, RunTestsStepDataUI } from './RunTestsStep'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './RunTestsStepFunctionConfigs'
import { CIStep } from '../CIStep/CIStep'
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
  } = usePipelineContext()

  const [mavenSetupQuestionAnswer, setMavenSetupQuestionAnswer] = React.useState('yes')

  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  const buildToolOptions = [
    { label: 'Bazel', value: 'Bazel' },
    { label: 'Maven', value: 'Maven' },
    { label: 'Gradle', value: 'Gradle' }
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
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              expressions={expressions}
              enableFields={{
                description: {},
                'spec.connectorRef': {
                  label: (
                    <Text
                      className={css.inpLabel}
                      color={Color.GREY_600}
                      font={{ size: 'small', weight: 'semi-bold' }}
                      style={{ display: 'flex', alignItems: 'center' }}
                      tooltipProps={{ dataTooltipId: 'connector' }}
                    >
                      {getString('pipelineSteps.connectorLabel')}
                    </Text>
                  ),
                  type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER]
                },
                'spec.image': {
                  tooltipId: 'image',
                  multiTextInputProps: {
                    placeholder: getString('imagePlaceholder'),
                    disabled: readonly,
                    multiTextInputProps: {
                      expressions
                    }
                  }
                }
              }}
              formik={formik}
            />
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              <MultiTypeSelectField
                name="spec.language"
                label={
                  <Text
                    className={css.inpLabel}
                    color={Color.GREY_600}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    tooltipProps={{ dataTooltipId: 'runTestsLanguage' }}
                  >
                    {getString('languageLabel')}
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: languageOptions,
                  multiTypeInputProps: {
                    allowableTypes: [MultiTypeInputType.FIXED],
                    expressions
                  },
                  disabled: readonly
                }}
                disabled={readonly}
              />
            </Container>
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              <MultiTypeSelectField
                name="spec.buildTool"
                label={
                  <Text
                    className={css.inpLabel}
                    color={Color.GREY_600}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    tooltipProps={{ dataTooltipId: 'runTestsBuildTool' }}
                  >
                    {getString('buildToolLabel')}
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: buildToolOptions,
                  multiTypeInputProps: {
                    allowableTypes: [MultiTypeInputType.FIXED],
                    expressions
                  },
                  disabled: readonly
                }}
                disabled={readonly}
              />
            </Container>
            {(formik.values?.spec?.language as any)?.value === 'Java' &&
              (formik.values?.spec?.buildTool as any)?.value === 'Maven' && (
                <>
                  <Text margin={{ top: 'small', bottom: 'small' }} color="grey800">
                    {getString('ci.runTestsMavenSetupTitle')}
                  </Text>
                  <Text font={{ size: 'small' }}>{getString('ci.runTestsMavenSetupText1')}</Text>
                  <RadioButtonGroup
                    name="run-tests-maven-setup"
                    inline={true}
                    selectedValue={mavenSetupQuestionAnswer}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      setMavenSetupQuestionAnswer(e.currentTarget.value)
                    }}
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' }
                    ]}
                    margin={{ bottom: 'small' }}
                  />
                  {mavenSetupQuestionAnswer === 'yes' && (
                    <>
                      <Text
                        font={{ size: 'small' }}
                        margin={{ bottom: 'xsmall' }}
                        tooltipProps={{ dataTooltipId: 'runTestsMavenSetupText2' }}
                      >
                        {getString('ci.runTestsMavenSetupText2')}
                      </Text>
                      <CodeBlock
                        allowCopy
                        codeToCopy="${env.HARNESS_JAVA_AGENT}"
                        format="pre"
                        snippet={getString('ci.runTestsMavenSetupSample')}
                      />
                    </>
                  )}
                </>
              )}
            {(formik.values?.spec?.language as any)?.value === 'Java' &&
              (formik.values?.spec?.buildTool as any)?.value === 'Gradle' && (
                <>
                  <Text margin={{ top: 'small', bottom: 'small' }} color="grey800">
                    {getString('ci.gradleNotesTitle')}
                  </Text>
                  <CodeBlock
                    allowCopy
                    codeToCopy={`tasks.withType(Test) {
  if(System.getProperty("HARNESS_JAVA_AGENT")) {
    jvmArgs += [System.getProperty("HARNESS_JAVA_AGENT")]
  }
}

gradle.projectsEvaluated {
        tasks.withType(Test) {
            filter {
                setFailOnNoMatchingTests(false)
            }
        }
}`}
                    format="pre"
                    snippet={getString('ci.gradleNote1')}
                  />
                  <Text margin={{ top: 'small' }} color="grey800">
                    {getString('ci.gradleNote2')}
                  </Text>
                </>
              )}
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              <MultiTypeTextField
                name="spec.args"
                label={
                  <Text
                    className={css.inpLabel}
                    color={Color.GREY_600}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    tooltipProps={{ dataTooltipId: 'runTestsArgs' }}
                  >
                    {getString('argsLabel')}
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
            </Container>
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              <MultiTypeTextField
                name="spec.packages"
                label={
                  <Text
                    className={css.inpLabel}
                    color={Color.GREY_600}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    tooltipProps={{ dataTooltipId: 'runTestsPackages' }}
                  >
                    {getString('packagesLabel')}
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
            </Container>
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
                      <FormMultiTypeCheckboxField
                        name="spec.runOnlySelectedTests"
                        label={getString('runOnlySelectedTestsLabel')}
                        multiTypeTextbox={{ expressions, disabled: readonly }}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                        disabled={readonly}
                      />
                    </Container>
                    <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
                      <MultiTypeTextField
                        name="spec.testAnnotations"
                        label={
                          <Text
                            className={css.inpLabel}
                            color={Color.GREY_600}
                            font={{ size: 'small', weight: 'semi-bold' }}
                            tooltipProps={{ dataTooltipId: 'runTestsTestAnnotations' }}
                          >
                            {getString('testAnnotationsLabel')}
                          </Text>
                        }
                        multiTextInputProps={{
                          multiTextInputProps: { expressions },
                          disabled: readonly
                        }}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                      />
                    </Container>
                    <Container className={css.bottomMargin5}>
                      <div
                        className={cx(css.fieldsGroup, css.withoutSpacing)}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                      >
                        <MultiTypeFieldSelector
                          name="spec.preCommand"
                          label={
                            <Text
                              className={css.inpLabel}
                              color={Color.GREY_600}
                              font={{ size: 'small', weight: 'semi-bold' }}
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
                    </Container>
                    <Container className={css.bottomMargin5}>
                      <div
                        className={cx(css.fieldsGroup, css.withoutSpacing)}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                      >
                        <MultiTypeFieldSelector
                          name="spec.postCommand"
                          label={
                            <Text
                              className={css.inpLabel}
                              color={Color.GREY_600}
                              font={{ size: 'small', weight: 'semi-bold' }}
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
                    </Container>
                    <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
                      <MultiTypeList
                        name="spec.reportPaths"
                        placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Text
                              className={css.inpLabel}
                              color={Color.GREY_800}
                              font={{ size: 'small', weight: 'semi-bold' }}
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
                    </Container>
                    <Container className={cx(css.formGroup, css.bottomMargin5)}>
                      <MultiTypeMap
                        name="spec.envVariables"
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Text
                              className={css.inpLabel}
                              color={Color.GREY_800}
                              font={{ size: 'small', weight: 'semi-bold' }}
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
                    </Container>
                    <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
                      <MultiTypeList
                        name="spec.outputVariables"
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Text
                              className={css.inpLabel}
                              color={Color.GREY_800}
                              font={{ size: 'small', weight: 'semi-bold' }}
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
                    </Container>
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
