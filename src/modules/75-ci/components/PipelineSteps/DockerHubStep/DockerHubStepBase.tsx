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
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './DockerHubStepFunctionConfigs'
import type { DockerHubStepProps, DockerHubStepData, DockerHubStepDataUI } from './DockerHubStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DockerHubStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: DockerHubStepProps,
  formikRef: StepFormikFowardRef<DockerHubStepData>
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
  // const values = getInitialValuesInCorrectFormat<DockerHubStepData, DockerHubStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<DockerHubStepData, DockerHubStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: DockerHubStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<DockerHubStepDataUI, DockerHubStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<DockerHubStepData>) => {
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
              <FormMultiTypeConnectorField
                label={
                  <Text style={{ display: 'flex', alignItems: 'center' }}>
                    {getString('pipelineSteps.dockerHubConnectorLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.dockerHubConnectorInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                type={'DockerRegistry'}
                width={
                  getMultiTypeFromValue(formik?.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560
                }
                name="spec.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                multiTypeProps={{ expressions, disabled: readonly }}
                style={{ marginBottom: 0 }}
              />
              <MultiTypeTextField
                name="spec.repo"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('dockerRegistry')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.dockerRegistryInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
              <MultiTypeList
                name="spec.tags"
                multiTextInputProps={{ expressions }}
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('tagsLabel')}
                      <Button icon="question" minimal tooltip={getString('tagsInfo')} iconProps={{ size: 14 }} />
                    </Text>
                  )
                }}
                style={{ marginTop: 'var(--spacing-xsmall)' }}
                disabled={readonly}
              />
            </div>
            <div className={css.fieldsSection}>
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
              <FormMultiTypeCheckboxField
                name="spec.optimize"
                className={css.checkboxField}
                label={getString('ci.optimize')}
                multiTypeTextbox={{
                  children: (
                    <Button icon="question" minimal tooltip={getString('ci.optimizeInfo')} iconProps={{ size: 14 }} />
                  ),
                  expressions
                }}
                disabled={readonly}
              />
              <MultiTypeTextField
                name="spec.dockerfile"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('pipelineSteps.dockerfileLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.dockerfileInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
              <MultiTypeTextField
                name="spec.context"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('pipelineSteps.contextLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.contextInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
              <MultiTypeMap
                name="spec.labels"
                valueMultiTextInputProps={{ expressions }}
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('pipelineSteps.labelsLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.labelsInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  )
                }}
                style={{ marginTop: 'var(--spacing-xsmall)', marginBottom: 'var(--spacing-small)' }}
                disabled={readonly}
              />
              <MultiTypeMap
                name="spec.buildArgs"
                valueMultiTextInputProps={{ expressions }}
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('pipelineSteps.buildArgsLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.buildArgsInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  )
                }}
                disabled={readonly}
              />
              <MultiTypeTextField
                name="spec.target"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('pipelineSteps.targetLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.targetInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly
                }}
              />
              <MultiTypeTextField
                name="spec.remoteCacheImage"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('ci.remoteCacheImage.label')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('ci.remoteCacheImage.dockerInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions },
                  disabled: readonly,
                  placeholder: getString('ci.remoteCacheImage.placeholder')
                }}
              />
              <StepCommonFields disabled={readonly} />
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const DockerHubStepBaseWithRef = React.forwardRef(DockerHubStepBase)
