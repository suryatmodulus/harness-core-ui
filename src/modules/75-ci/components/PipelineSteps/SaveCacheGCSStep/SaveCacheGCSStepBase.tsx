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
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'

import StepCommonFields from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useGitScope } from '@ci/services/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './SaveCacheGCSStepFunctionConfigs'
import type { SaveCacheGCSStepProps, SaveCacheGCSStepData, SaveCacheGCSStepDataUI } from './SaveCacheGCSStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SaveCacheGCSStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: SaveCacheGCSStepProps,
  formikRef: StepFormikFowardRef<SaveCacheGCSStepData>
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

  const archiveFormatOptions = [
    { label: 'Tar', value: 'Tar' },
    { label: 'Gzip', value: 'Gzip' }
  ]

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<SaveCacheGCSStepData, SaveCacheGCSStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { archiveFormatOptions }
      )}
      formName="savedCacheGcs"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: SaveCacheGCSStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<SaveCacheGCSStepDataUI, SaveCacheGCSStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<SaveCacheGCSStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <FormInput.InputWithIdentifier
              inputName="name"
              idName="identifier"
              isIdentifierEditable={isNewStep}
              inputLabel={getString('pipelineSteps.stepNameLabel')}
              inputGroupProps={{
                disabled: readonly
              }}
            />
            <FormMultiTypeConnectorField
              label={
                <Text
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'gcpConnector' }}
                >
                  {getString('pipelineSteps.gcpConnectorLabel')}
                </Text>
              }
              type={'Gcp'}
              width={getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560}
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
              name="spec.bucket"
              label={
                <Text tooltipProps={{ dataTooltipId: 'gcsBucket' }}>{getString('pipelineSteps.bucketLabel')}</Text>
              }
              multiTextInputProps={{
                multiTextInputProps: { expressions },
                disabled: readonly
              }}
              style={{ marginBottom: 'var(--spacing-small)' }}
            />
            <MultiTypeTextField
              name="spec.key"
              label={<Text tooltipProps={{ dataTooltipId: 'saveCacheKey' }}>{getString('keyLabel')}</Text>}
              multiTextInputProps={{
                multiTextInputProps: { expressions },
                disabled: readonly
              }}
              style={{ marginBottom: 'var(--spacing-small)' }}
            />
            <MultiTypeList
              name="spec.sourcePaths"
              multiTextInputProps={{ expressions }}
              multiTypeFieldSelectorProps={{
                label: (
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    tooltipProps={{ dataTooltipId: 'saveCacheSourcePaths' }}
                  >
                    {getString('pipelineSteps.sourcePathsLabel')}
                  </Text>
                )
              }}
              disabled={readonly}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <MultiTypeSelectField
                      name="spec.archiveFormat"
                      label={
                        <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'archiveFormat' }}>
                          {getString('archiveFormat')}
                        </Text>
                      }
                      multiTypeInputProps={{
                        selectItems: archiveFormatOptions,
                        multiTypeInputProps: { expressions },
                        disabled: readonly
                      }}
                      style={{ marginBottom: 'var(--spacing-medium)' }}
                      disabled={readonly}
                    />
                    <FormMultiTypeCheckboxField
                      name="spec.override"
                      label={getString('override')}
                      multiTypeTextbox={{
                        expressions,
                        disabled: readonly
                      }}
                      style={{ marginBottom: 'var(--spacing-medium)' }}
                      disabled={readonly}
                      tooltipProps={{ dataTooltipId: 'saveCacheOverride' }}
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

export const SaveCacheGCSStepBaseWithRef = React.forwardRef(SaveCacheGCSStepBase)
