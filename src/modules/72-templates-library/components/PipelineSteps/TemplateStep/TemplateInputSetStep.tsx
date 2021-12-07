import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { StepElementConfig } from 'services/cd-ng'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface TemplateInputSetStepProps {
  initialValues: TemplateStepData
  onUpdate?: (data: TemplateStepData) => void
  onChange?: (data: TemplateStepData) => void
  allowableTypes: MultiTypeInputType[]
  stepViewType?: StepViewType
  readonly?: boolean
  template?: TemplateStepData
  path?: string
}

export default function TemplateInputSetStep(props: TemplateInputSetStepProps): React.ReactElement {
  const { template, path, readonly, initialValues, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      <StepWidget<Partial<StepElementConfig>>
        factory={factory}
        initialValues={initialValues.template?.templateInputs || {}}
        template={template?.template.templateInputs as Partial<StepElementConfig>}
        readonly={readonly}
        type={initialValues.template?.templateInputs?.type as StepType}
        path={`${prefix}template.templateInputs`}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
      />
      {getMultiTypeFromValue(template?.template.templateInputs?.spec?.delegateSelectors) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <MultiTypeDelegateSelector
            expressions={expressions}
            inputProps={{ projectIdentifier, orgIdentifier }}
            allowableTypes={allowableTypes}
            label={getString('delegate.DelegateSelector')}
            name={`${prefix}template.templateInputs.spec.delegateSelectors`}
            disabled={readonly}
          />
        </div>
      )}
    </>
  )
}
