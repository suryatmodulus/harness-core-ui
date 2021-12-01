import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { DockerHubStepProps } from './DockerHubStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DockerHubStepInputSet: React.FC<DockerHubStepProps> = ({ template, path, readonly, stepViewType }) => {
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
                  tooltipProps={{ dataTooltipId: 'dockerHubConnector' }}
                >
                  {getString('pipelineSteps.dockerHubConnectorLabel')}
                </Text>
              ),
              type: Connectors.DOCKER,
              multiTypeProps: {
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              }
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.repo as string) === MultiTypeInputType.RUNTIME && {
            'spec.repo': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.tags as string) === MultiTypeInputType.RUNTIME && {
            'spec.tags': {}
          })
        }}
        isInputSetView={true}
      />
      <CIStepOptionalConfig
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
          ...(getMultiTypeFromValue(template?.spec?.remoteCacheRepo) === MultiTypeInputType.RUNTIME && {
            'spec.remoteCacheRepo': {}
          })
        }}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
