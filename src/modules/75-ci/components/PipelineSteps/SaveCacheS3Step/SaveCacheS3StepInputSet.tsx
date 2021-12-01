import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { SaveCacheS3StepProps } from './SaveCacheS3Step'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SaveCacheS3StepInputSet: React.FC<SaveCacheS3StepProps> = ({ template, path, readonly, stepViewType }) => {
  const { getString } = useStrings()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'saveCacheS3Connector' }}
                >
                  {getString('pipelineSteps.awsConnectorLabel')}
                </Text>
              ),
              type: Connectors.AWS,
              multiTypeProps: {
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              }
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.region) === MultiTypeInputType.RUNTIME && {
            'spec.region': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && {
            'spec.bucket': { tooltipId: 's3Bucket' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.key) === MultiTypeInputType.RUNTIME && {
            'spec.key': { tooltipId: 'saveCacheKey' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.sourcePaths as string) === MultiTypeInputType.RUNTIME && {
            'spec.sourcePaths': {}
          })
        }}
        isInputSetView={true}
      />
      <CIStepOptionalConfig
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.endpoint) === MultiTypeInputType.RUNTIME && {
            'spec.endpoint': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && {
            'spec.archiveFormat': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.override) === MultiTypeInputType.RUNTIME && {
            'spec.override': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.pathStyle) === MultiTypeInputType.RUNTIME && {
            'spec.pathStyle': {}
          })
        }}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
