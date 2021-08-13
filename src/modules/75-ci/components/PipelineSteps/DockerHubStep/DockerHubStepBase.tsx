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
import { useGitScope } from '@ci/services/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
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
  const gitScope = useGitScope()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

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
      formName="dockerHubStep"
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
            <FormInput.InputWithIdentifier
              inputName="name"
              idName="identifier"
              isIdentifierEditable={isNewStep}
              inputLabel={getString('pipelineSteps.stepNameLabel')}
              inputGroupProps={{ disabled: readonly }}
            />
            <FormMultiTypeConnectorField
              label={
                <Text
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'dockerHubConnector' }}
                >
                  {getString('pipelineSteps.dockerHubConnectorLabel')}
                </Text>
              }
              type={'DockerRegistry'}
              width={getMultiTypeFromValue(formik?.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560}
              name="spec.connectorRef"
              placeholder={getString('select')}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              multiTypeProps={{ expressions, disabled: readonly }}
              gitScope={gitScope}
              style={{ marginBottom: 0 }}
            />
            <MultiTypeTextField
              name="spec.repo"
              label={
                <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'dockerHubRepository' }}>
                  {getString('connectors.docker.dockerRepository')}
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
                  <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'tags' }}>
                    {getString('tagsLabel')}
                  </Text>
                )
              }}
              style={{ marginTop: 'var(--spacing-xsmall)' }}
              disabled={readonly}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <FormMultiTypeCheckboxField
                      name="spec.optimize"
                      label={getString('ci.optimize')}
                      multiTypeTextbox={{
                        expressions
                      }}
                      tooltipProps={{ dataTooltipId: 'optimize' }}
                      disabled={readonly}
                    />
                    <MultiTypeTextField
                      name="spec.dockerfile"
                      label={
                        <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'dockerfile' }}>
                          {getString('pipelineSteps.dockerfileLabel')}
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
                        <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'context' }}>
                          {getString('pipelineSteps.contextLabel')}
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
                          <Text
                            style={{ display: 'flex', alignItems: 'center' }}
                            tooltipProps={{ dataTooltipId: 'labels' }}
                          >
                            {getString('pipelineSteps.labelsLabel')}
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
                          <Text
                            style={{ display: 'flex', alignItems: 'center' }}
                            tooltipProps={{ dataTooltipId: 'buildArgs' }}
                          >
                            {getString('pipelineSteps.buildArgsLabel')}
                          </Text>
                        )
                      }}
                      disabled={readonly}
                    />
                    <MultiTypeTextField
                      name="spec.target"
                      label={
                        <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'target' }}>
                          {getString('pipelineSteps.targetLabel')}
                        </Text>
                      }
                      multiTextInputProps={{
                        multiTextInputProps: { expressions },
                        disabled: readonly
                      }}
                    />
                    <MultiTypeTextField
                      name="spec.remoteCacheRepo"
                      label={
                        <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'dockerHubRemoteCache' }}>
                          {getString('ci.remoteCacheRepository.label')}
                        </Text>
                      }
                      multiTextInputProps={{
                        multiTextInputProps: { expressions },
                        disabled: readonly,
                        placeholder: getString('ci.remoteCacheImage.placeholder')
                      }}
                    />
                    <StepCommonFields disabled={readonly} />
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

export const DockerHubStepBaseWithRef = React.forwardRef(DockerHubStepBase)
