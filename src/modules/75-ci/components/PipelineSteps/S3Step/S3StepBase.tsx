import React from 'react'
import { Text, Formik, FormikForm, Accordion, Color } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { Connectors } from '@connectors/constants'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'

import StepCommonFields /*,{ /*usePullOptions }*/ from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './S3StepFunctionConfigs'
import type { S3StepData, S3StepDataUI, S3StepProps } from './S3Step'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const S3StepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: S3StepProps,
  formikRef: StepFormikFowardRef<S3StepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<S3StepData, S3StepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<S3StepData, S3StepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="ciS3Base"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: S3StepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<S3StepDataUI, S3StepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<S3StepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              formik={formik}
              expressions={expressions}
              enableFields={{
                'spec.connectorRef': {
                  label: (
                    <Text
                      className={css.inpLabel}
                      color={Color.GREY_600}
                      font={{ size: 'small', weight: 'semi-bold' }}
                      style={{ display: 'flex', alignItems: 'center' }}
                      tooltipProps={{ dataTooltipId: 's3Connector' }}
                    >
                      {getString('pipelineSteps.awsConnectorLabel')}
                    </Text>
                  ),
                  type: Connectors.AWS
                },
                'spec.region': {},
                'spec.bucket': { tooltipId: 's3Bucket' },
                'spec.sourcePath': {}
              }}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <CIStepOptionalConfig
                      enableFields={{ 'spec.endpoint': {}, 'spec.target': { tooltipId: 'gcsS3Target' } }}
                      readonly={readonly}
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

export const S3StepBaseWithRef = React.forwardRef(S3StepBase)
