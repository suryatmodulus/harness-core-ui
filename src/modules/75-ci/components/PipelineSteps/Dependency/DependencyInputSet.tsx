import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { DependencyProps } from './Dependency'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DependencyInputSet: React.FC<DependencyProps> = ({ template, path, readonly, stepViewType }) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
      <CIStep
        stepLabel={getString('dependencyNameLabel')}
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description as string) === MultiTypeInputType.RUNTIME && {
            'spec.description': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'dependencyConnectorInfo' }}
                >
                  {getString('pipelineSteps.connectorLabel')}
                </Text>
              ),
              type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER],
              multiTypeProps: {
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              }
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && {
            'spec.image': {
              tooltipId: 'image',
              multiTextInputProps: {
                placeholder: getString('dependencyImagePlaceholder'),
                disabled: readonly,
                multiTextInputProps: {
                  expressions,
                  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
                  textProps: {
                    autoComplete: 'off'
                  }
                }
              }
            }
          })
        }}
        isInputSetView={true}
      />
      <CIStepOptionalConfig
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.privileged) === MultiTypeInputType.RUNTIME && {
            'spec.privileged': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.envVariables as string) === MultiTypeInputType.RUNTIME && {
            'spec.envVariables': { tooltipId: 'dependencyEnvironmentVariables' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.entrypoint as string) === MultiTypeInputType.RUNTIME && {
            'spec.entrypoint': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.args as string) === MultiTypeInputType.RUNTIME && {
            'spec.args': {}
          })
        }}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} withoutTimeout />
    </FormikForm>
  )
}
