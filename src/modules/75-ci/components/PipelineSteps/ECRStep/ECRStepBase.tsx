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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './ECRStepFunctionConfigs'
import type { ECRStepProps, ECRStepData, ECRStepDataUI } from './ECRStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
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
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

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
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              expressions={expressions}
              enableFields={{
                'spec.imageName': {},
                'spec.connectorRef': {
                  label: (
                    <Text
                      className={css.inpLabel}
                      color={Color.GREY_600}
                      font={{ size: 'small', weight: 'semi-bold' }}
                      style={{ display: 'flex', alignItems: 'center' }}
                      tooltipProps={{ dataTooltipId: 'ecrConnector' }}
                    >
                      {getString('pipelineSteps.awsConnectorLabel')}
                    </Text>
                  ),
                  type: Connectors.AWS
                },
                'spec.region': {},
                'spec.account': {},
                'spec.tags': {}
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
                      readonly={readonly}
                      enableFields={{
                        'spec.optimize': {},
                        'spec.dockerfile': {},
                        'spec.context': {},
                        'spec.labels': {},
                        'spec.buildArgs': {},
                        'spec.target': { tooltipId: 'target' },
                        'spec.remoteCacheImage': {}
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
