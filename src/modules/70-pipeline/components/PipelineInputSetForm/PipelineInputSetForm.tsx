import React from 'react'
import { Layout, getMultiTypeFromValue, MultiTypeInputType, Text, Icon, Color, IconName } from '@wings-software/uicore'
import { isEmpty, get } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type { DeploymentStageConfig, PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { PubSubPipelineActions } from '@pipeline/factories/PubSubPipelineAction'
import { PipelineActions } from '@pipeline/factories/PubSubPipelineAction/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { StageInputSetForm } from './StageInputSetForm'
import { CICodebaseInputSetForm } from './CICodebaseInputSetForm'
import { StepWidget } from '../AbstractSteps/StepWidget'
import factory from '../PipelineSteps/PipelineStepFactory'
import type {
  CustomVariablesData,
  CustomVariableInputSetExtraProps
} from '../PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AbstractStepFactory } from '../AbstractSteps/AbstractStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'
import { getStageFromPipeline } from '../PipelineStudio/StepUtil'
import { PipelineVariablesContextProvider } from '../PipelineVariablesContext/PipelineVariablesContext'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import css from './PipelineInputSetForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface PipelineInputSetFormProps {
  originalPipeline: PipelineInfoConfig
  template: PipelineInfoConfig
  path?: string
  readonly?: boolean
  maybeContainerClass?: string
  viewType: StepViewType
  isRunPipelineForm?: boolean
}

const stageTypeToIconMap: Record<string, IconName> = {
  Deployment: 'cd-main',
  ci: 'ci-main',
  Pipeline: 'pipeline',
  Custom: 'pipeline-custom',
  Approval: 'approval-stage-icon'
}

function StageForm({
  allValues,
  path,
  template,
  readonly,
  viewType
}: {
  allValues?: StageElementWrapperConfig
  template?: StageElementWrapperConfig
  path: string
  readonly?: boolean
  viewType: StepViewType
}): JSX.Element {
  const { getString } = useStrings()
  const icon = stageTypeToIconMap[allValues?.stage?.type || 'Deployment']
  return (
    <div id={`Stage.${allValues?.stage?.identifier}`}>
      <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'medium', right: 0, bottom: 0 }}>
        <Icon name={icon} size={18} />
        <Text color={Color.BLACK_100} font={{ weight: 'semi-bold' }}>
          Stage: {allValues?.stage?.name || ''}
        </Text>
      </Layout.Horizontal>

      <div className={css.topAccordion}>
        {template?.stage?.variables && (
          <div id={`Stage.${allValues?.stage?.identifier}.Variables`} className={cx(css.accordionSummary)}>
            <Text font={{ weight: 'semi-bold' }} padding={{ top: 'medium', bottom: 'medium' }}>
              {getString('variablesText')}
            </Text>
            <div className={css.nestedAccordions}>
              <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
                factory={factory as unknown as AbstractStepFactory}
                initialValues={{
                  variables: (allValues?.stage?.variables || []) as AllNGVariables[],
                  canAddVariable: true
                }}
                type={StepType.CustomVariable}
                readonly={readonly}
                stepViewType={viewType}
                customStepProps={{
                  template: { variables: template?.stage?.variables as AllNGVariables[] },
                  path,
                  allValues: { variables: (allValues?.stage?.variables || []) as AllNGVariables[] }
                }}
              />
            </div>
          </div>
        )}
        {template?.stage?.spec && (
          <StageInputSetForm
            stageIdentifier={template?.stage?.identifier}
            path={`${path}.spec`}
            deploymentStageTemplate={template?.stage.spec as DeploymentStageConfig}
            deploymentStage={allValues?.stage?.spec as DeploymentStageConfig}
            readonly={readonly}
            viewType={viewType}
          />
        )}
      </div>
    </div>
  )
}

const PipelineInputSetFormInternal: React.FC<PipelineInputSetFormProps> = props => {
  const { originalPipeline, template, path = '', readonly, viewType, maybeContainerClass = '' } = props
  const { getString } = useStrings()

  const isCloneCodebaseEnabledAtLeastAtOneStage = originalPipeline?.stages?.some(stage =>
    get(stage, 'stage.spec.cloneCodebase')
  )
  const { expressions } = useVariablesExpression()

  return (
    <PipelineVariablesContextProvider pipeline={originalPipeline}>
      <Layout.Vertical spacing="medium" className={cx(css.container, maybeContainerClass)}>
        {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormMultiTypeDurationField
              multiTypeDurationProps={{
                enableConfigureOptions: false,
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                expressions,
                disabled: readonly
              }}
              className={stepCss.checkbox}
              label={getString('pipelineSteps.timeoutLabel')}
              name="timeout"
              disabled={readonly}
            />
          </div>
        ) : null}
        {template?.variables && template?.variables?.length > 0 && (
          <>
            <div className={css.subheading}>{getString('customVariables.pipelineVariablesTitle')}</div>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (originalPipeline.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              readonly={readonly}
              type={StepType.CustomVariable}
              stepViewType={viewType}
              customStepProps={{
                template: { variables: (template?.variables || []) as AllNGVariables[] },
                path,
                allValues: { variables: (originalPipeline?.variables || []) as AllNGVariables[] }
              }}
            />
          </>
        )}
        {isCloneCodebaseEnabledAtLeastAtOneStage &&
          getMultiTypeFromValue(template?.properties?.ci?.codebase?.build as unknown as string) ===
            MultiTypeInputType.RUNTIME && (
            <>
              <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'medium', right: 0, bottom: 0 }}>
                <Text color={Color.BLACK_100} font={{ weight: 'semi-bold' }}>
                  {getString('ciCodebase')}
                </Text>
              </Layout.Horizontal>
              <div className={css.topAccordion}>
                <div className={css.accordionSummary}>
                  <div className={css.nestedAccordions} style={{ width: '50%' }}>
                    <CICodebaseInputSetForm path={path} readonly={readonly} />
                  </div>
                </div>
              </div>
            </>
          )}
        <>
          {template?.stages?.map((stageObj, index) => {
            const pathPrefix = !isEmpty(path) ? `${path}.` : ''
            if (stageObj.stage) {
              const allValues = getStageFromPipeline(stageObj?.stage?.identifier || '', originalPipeline)
              return (
                <Layout.Vertical key={stageObj?.stage?.identifier || index}>
                  <StageForm
                    template={stageObj}
                    allValues={allValues}
                    path={`${pathPrefix}stages[${index}].stage`}
                    readonly={readonly}
                    viewType={viewType}
                  />
                </Layout.Vertical>
              )
            } else if (stageObj.parallel) {
              return stageObj.parallel.map((stageP, indexp) => {
                const allValues = getStageFromPipeline(stageP?.stage?.identifier || '', originalPipeline)
                return (
                  <Layout.Vertical key={`${stageObj?.stage?.identifier}-${stageP.stage?.identifier}-${indexp}`}>
                    <StageForm
                      template={stageP}
                      allValues={allValues}
                      path={`${pathPrefix}stages[${index}].parallel[${indexp}].stage`}
                      readonly={readonly}
                      viewType={viewType}
                    />
                  </Layout.Vertical>
                )
              })
            }
          })}
        </>
      </Layout.Vertical>
    </PipelineVariablesContextProvider>
  )
}
export const PipelineInputSetForm: React.FC<PipelineInputSetFormProps> = props => {
  const [template, setTemplate] = React.useState(props.template)
  const accountPathProps = useParams<AccountPathProps>()
  React.useEffect(() => {
    if (props.isRunPipelineForm) {
      PubSubPipelineActions.publish(PipelineActions.RunPipeline, {
        pipeline: props.originalPipeline,
        accountPathProps,
        template: props.template
      }).then(data => {
        if (data.length > 0) {
          setTemplate(Object.assign(props.template, ...data))
        }
      })
    }
  }, [])
  return (
    <PipelineVariablesContextProvider pipeline={props.originalPipeline}>
      <PipelineInputSetFormInternal {...props} template={template} />
    </PipelineVariablesContextProvider>
  )
}
