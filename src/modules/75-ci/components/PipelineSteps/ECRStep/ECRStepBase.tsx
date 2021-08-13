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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './ECRStepFunctionConfigs'
import type { ECRStepProps, ECRStepData, ECRStepDataUI } from './ECRStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const ECRStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: ECRStepProps,
  formikRef: StepFormikFowardRef<ECRStepData>
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
  // const values = getInitialValuesInCorrectFormat<ECRStepData, ECRStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<ECRStepData, ECRStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="ciEcrStep"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: ECRStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<ECRStepDataUI, ECRStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<ECRStepData>) => {
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
                  tooltipProps={{ dataTooltipId: 'ecrConnector' }}
                >
                  {getString('pipelineSteps.awsConnectorLabel')}
                </Text>
              }
              type={'Aws'}
              width={getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560}
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
              name="spec.region"
              label={
                <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'region' }}>
                  {getString('regionLabel')}
                </Text>
              }
              multiTextInputProps={{
                placeholder: getString('pipelineSteps.regionPlaceholder'),
                multiTextInputProps: { expressions },
                disabled: readonly
              }}
            />
            <MultiTypeTextField
              name="spec.account"
              label={
                <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'ecrAccount' }}>
                  {getString('common.accountId')}
                </Text>
              }
              multiTextInputProps={{
                multiTextInputProps: { expressions },
                disabled: readonly
              }}
            />
            <MultiTypeTextField
              name="spec.imageName"
              label={
                <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'imageName' }}>
                  {getString('imageNameLabel')}
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
                      disabled={readonly}
                      tooltipProps={{ dataTooltipId: 'optimize' }}
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
                      name="spec.remoteCacheImage"
                      label={
                        <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'ecrRemoteCache' }}>
                          {getString('ci.remoteCacheImage.label')}
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

export const ECRStepBaseWithRef = React.forwardRef(ECRStepBase)
