import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { JFrogArtifactoryStepProps } from './JFrogArtifactoryStep'
import { CIStep } from '../CIStep/CIStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const JFrogArtifactoryStepInputSet: React.FC<JFrogArtifactoryStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  allowableTypes
}) => {
  const { getString } = useStrings()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && {
            description: {}
          }),
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
                  {getString('pipelineSteps.connectorLabel')}
                </Text>
              ),
              type: Connectors.Artifactory
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.target) === MultiTypeInputType.RUNTIME && {
            'spec.target': { tooltipId: 'jFrogArtifactoryTarget' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.sourcePath) === MultiTypeInputType.RUNTIME && {
            'spec.sourcePath': {}
          })
        }}
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
