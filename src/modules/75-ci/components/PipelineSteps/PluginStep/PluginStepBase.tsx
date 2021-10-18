import React from 'react'
import { Text, Formik, FormikForm, Accordion, Color } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { Connectors } from '@connectors/constants'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import StepCommonFields, { GetImagePullPolicyOptions } from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './PluginStepFunctionConfigs'
import type { PluginStepProps, PluginStepData, PluginStepDataUI } from './PluginStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const PluginStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: PluginStepProps,
  formikRef: StepFormikFowardRef<PluginStepData>
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

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<PluginStepData, PluginStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions() }
      )}
      formName="pluginStep"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: PluginStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<PluginStepDataUI, PluginStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<PluginStepData>) => {
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
                  tooltipId: 'pluginImageInfo',
                  multiTextInputProps: {
                    placeholder: getString('pluginImagePlaceholder'),
                    multiTextInputProps: { expressions },
                    disabled: readonly
                  }
                }
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
                      enableFields={{ 'spec.privileged': {}, 'spec.settings': {}, 'spec.reportPaths': {} }}
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

export const PluginStepBaseWithRef = React.forwardRef(PluginStepBase)
