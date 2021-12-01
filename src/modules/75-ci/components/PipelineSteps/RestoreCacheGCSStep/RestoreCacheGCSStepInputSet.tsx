import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { RestoreCacheGCSStepProps } from './RestoreCacheGCSStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheGCSStepInputSet: React.FC<RestoreCacheGCSStepProps> = ({
  template,
  path,
  readonly,
  stepViewType
}) => {
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
                  tooltipProps={{ dataTooltipId: 'restoreCacheGcpConnector' }}
                >
                  {getString('pipelineSteps.gcpConnectorLabel')}
                </Text>
              ),
              type: Connectors.GCP,
              multiTypeProps: {
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              }
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && {
            'spec.bucket': { tooltipId: 'gcsBucket' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.key) === MultiTypeInputType.RUNTIME && {
            'spec.key': { tooltipId: 'restoreCacheKey' }
          })
        }}
        isInputSetView={true}
      />
      <CIStepOptionalConfig
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && {
            'spec.archiveFormat': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.failIfKeyNotFound) === MultiTypeInputType.RUNTIME && {
            'spec.failIfKeyNotFound': {}
          })
        }}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
        isInputSetView={true}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
