import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { GCRStepProps } from './GCRStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const GCRStepInputSet: React.FC<GCRStepProps> = ({ template, path, readonly, stepViewType, allowableTypes }) => {
  const { getString } = useStrings()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'gcrConnector' }}
                >
                  {getString('pipelineSteps.gcpConnectorLabel')}
                </Text>
              ),
              type: Connectors.GCP
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.host) === MultiTypeInputType.RUNTIME && { 'spec.host': {} }),
          ...(getMultiTypeFromValue(template?.spec?.projectID) === MultiTypeInputType.RUNTIME && {
            'spec.projectID': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.imageName) === MultiTypeInputType.RUNTIME && {
            'spec.imageName': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.tags as string) === MultiTypeInputType.RUNTIME && {
            'spec.tags': {}
          })
        }}
        path={path || ''}
      />
      <CIStepOptionalConfig
        stepViewType={stepViewType}
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.dockerfile) === MultiTypeInputType.RUNTIME && {
            'spec.dockerfile': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.context) === MultiTypeInputType.RUNTIME && { 'spec.context': {} }),
          ...(getMultiTypeFromValue(template?.spec?.labels as string) === MultiTypeInputType.RUNTIME && {
            'spec.labels': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.buildArgs as string) === MultiTypeInputType.RUNTIME && {
            'spec.buildArgs': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.optimize) === MultiTypeInputType.RUNTIME && {
            'spec.optimize': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.target) === MultiTypeInputType.RUNTIME && {
            'spec.target': { tooltipId: 'target' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.remoteCacheImage) === MultiTypeInputType.RUNTIME && {
            'spec.remoteCacheImage': {}
          })
        }}
        allowableTypes={allowableTypes}
        path={path || ''}
      />
      <StepCommonFieldsInputSet
        path={path}
        readonly={readonly}
        template={template}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
      />
    </FormikForm>
  )
}
