/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Formik, FormikForm, Accordion, Color, Container } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import get from 'lodash/get'
import type { K8sDirectInfraYaml } from 'services/ci'
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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './SaveCacheGCSStepFunctionConfigs'
import type { SaveCacheGCSStepProps, SaveCacheGCSStepData, SaveCacheGCSStepDataUI } from './SaveCacheGCSStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { ArchiveFormatOptions } from '../../../constants/Constants'
import { useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SaveCacheGCSStepBase = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    allowableTypes,
    onChange
  }: SaveCacheGCSStepProps,
  formikRef: StepFormikFowardRef<SaveCacheGCSStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type') as K8sDirectInfraYaml['type']

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<SaveCacheGCSStepData, SaveCacheGCSStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { archiveFormatOptions: ArchiveFormatOptions }
      )}
      formName="savedCacheGcs"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<SaveCacheGCSStepDataUI, SaveCacheGCSStepData>(
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
                      tooltipProps={{ dataTooltipId: 'gcpConnector' }}
                    >
                      {getString('pipelineSteps.gcpConnectorLabel')}
                    </Text>
                  ),
                  type: Connectors.GCP
                },
                'spec.bucket': { tooltipId: 'gcsBucket' },
                'spec.key': { tooltipId: 'saveCacheKey' },
                'spec.sourcePaths': {}
              }}
              formik={formik}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    <CIStepOptionalConfig
                      stepViewType={stepViewType}
                      enableFields={{ 'spec.archiveFormat': {}, 'spec.override': {} }}
                      readonly={readonly}
                      allowableTypes={allowableTypes}
                    />
                    <StepCommonFields
                      disabled={readonly}
                      allowableTypes={allowableTypes}
                      buildInfrastructureType={buildInfrastructureType}
                    />
                  </Container>
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
