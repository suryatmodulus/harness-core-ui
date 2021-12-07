import React from 'react'
import { Text, Formik, FormikForm, Accordion, Color } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { Connectors } from '@connectors/constants'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'

import StepCommonFields from '@pipeline/components/StepCommonFields/StepCommonFields'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './RestoreCacheGCSStepFunctionConfigs'
import type {
  RestoreCacheGCSStepData,
  RestoreCacheGCSStepDataUI,
  RestoreCacheGCSStepProps
} from './RestoreCacheGCSStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { ArchiveFormatOptions } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheGCSStepBase = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    allowableTypes,
    onChange
  }: RestoreCacheGCSStepProps,
  formikRef: StepFormikFowardRef<RestoreCacheGCSStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()

  const { getString } = useStrings()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RestoreCacheGCSStepData, RestoreCacheGCSStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { archiveFormatOptions: ArchiveFormatOptions }
      )}
      formName="restoreCacheGcs"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<RestoreCacheGCSStepDataUI, RestoreCacheGCSStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig,
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
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
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              enableFields={{
                name: {},
                'spec.connectorRef': {
                  label: (
                    <Text
                      className={css.inpLabel}
                      color={Color.GREY_600}
                      font={{ size: 'small', weight: 'semi-bold' }}
                      style={{ display: 'flex', alignItems: 'center' }}
                      tooltipProps={{ dataTooltipId: 'restoreCacheGcpConnector' }}
                    >
                      {getString('pipelineSteps.gcpConnectorLabel')}
                    </Text>
                  ),
                  type: Connectors.GCP
                },
                'spec.bucket': { tooltipId: 'gcsBucket' },
                'spec.key': { tooltipId: 'restoreCacheKey' }
              }}
              formik={formik}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <CIStepOptionalConfig
                      stepViewType={stepViewType}
                      enableFields={{ 'spec.archiveFormat': {}, 'spec.failIfKeyNotFound': {} }}
                      readonly={readonly}
                      allowableTypes={allowableTypes}
                    />
                    <StepCommonFields disabled={readonly} allowableTypes={allowableTypes} />
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

export const RestoreCacheGCSStepBaseWithRef = React.forwardRef(RestoreCacheGCSStepBase)
