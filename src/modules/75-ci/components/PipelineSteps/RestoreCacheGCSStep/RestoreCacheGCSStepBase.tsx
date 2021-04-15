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
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/exports'
import { useStrings } from 'framework/exports'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'

import StepCommonFields from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './RestoreCacheGCSStepFunctionConfigs'
import type {
  RestoreCacheGCSStepData,
  RestoreCacheGCSStepDataUI,
  RestoreCacheGCSStepProps
} from './RestoreCacheGCSStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheGCSStepBase = (
  { initialValues, onUpdate }: RestoreCacheGCSStepProps,
  formikRef: StepFormikFowardRef<RestoreCacheGCSStepData>
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

  const archiveFormatOptions = [
    { label: 'tar', value: 'tar' },
    { label: 'gzip', value: 'gzip' }
  ]

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RestoreCacheGCSStepData, RestoreCacheGCSStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { archiveFormatOptions }
      )}
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: RestoreCacheGCSStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RestoreCacheGCSStepDataUI, RestoreCacheGCSStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RestoreCacheGCSStepData>) => {
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
              <FormMultiTypeConnectorField
                label={
                  <Text style={{ display: 'flex', alignItems: 'center' }}>
                    {getString('pipelineSteps.gcpConnectorLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.restoreCacheGcpConnectorInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                type={'Gcp'}
                width={
                  getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560
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
                name="spec.bucket"
                label={
                  <Text>
                    {getString('pipelineSteps.bucketLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.GCSBucketInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions }
                }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <MultiTypeTextField
                name="spec.key"
                label={
                  <Text>
                    {getString('keyLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.restoreCacheKeyInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions }
                }}
              />
            </div>
            <div className={css.fieldsSection}>
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
              <MultiTypeSelectField
                name="spec.archiveFormat"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('archiveFormat')}
                    <Button icon="question" minimal tooltip={getString('archiveFormatInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: archiveFormatOptions,
                  multiTypeInputProps: { expressions }
                }}
                style={{ marginBottom: 'var(--spacing-medium)' }}
              />
              <FormMultiTypeCheckboxField
                name="spec.failIfKeyNotFound"
                label={getString('failIfKeyNotFound')}
                multiTypeTextbox={{ expressions }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <StepCommonFields />
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RestoreCacheGCSStepBaseWithRef = React.forwardRef(RestoreCacheGCSStepBase)
