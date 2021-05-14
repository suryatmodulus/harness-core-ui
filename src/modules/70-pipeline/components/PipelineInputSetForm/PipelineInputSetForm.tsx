import React from 'react'
import { Layout, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import type { DeploymentStageConfig, PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'

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
import { StepViewType } from '../AbstractSteps/Step'
import { getStageFromPipeline } from '../PipelineStudio/StepUtil'
import css from './PipelineInputSetForm.module.scss'

export interface PipelineInputSetFormProps {
  originalPipeline: PipelineInfoConfig
  template: PipelineInfoConfig
  path?: string
  readonly?: boolean
}

function StageForm({
  allValues,
  path,
  template,
  readonly
}: {
  allValues?: StageElementWrapperConfig
  template?: StageElementWrapperConfig
  path: string
  readonly?: boolean
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <div
      id={`Stage.${allValues?.stage?.identifier}`}
      className={cx(css.accordionSummary)}
      title={allValues?.stage?.name || ''}
    >
      <div className={css.nestedAccordions}>
        {template?.stage?.variables && (
          <div
            id={`Stage.${allValues?.stage?.identifier}.Variables`}
            title={getString('variablesText')}
            className={cx(css.accordionSummary)}
          >
            <div className={css.nestedAccordions}>
              <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
                factory={(factory as unknown) as AbstractStepFactory}
                initialValues={{
                  variables: (allValues?.stage?.variables || []) as AllNGVariables[],
                  canAddVariable: true
                }}
                type={StepType.CustomVariable}
                readonly={readonly}
                stepViewType={StepViewType.InputSet}
                customStepProps={{
                  template: { variables: template?.stage?.variables as AllNGVariables[] },
                  path
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
          />
        )}
      </div>
    </div>
  )
}

export const PipelineInputSetForm: React.FC<PipelineInputSetFormProps> = props => {
  const { originalPipeline, template, path = '', readonly } = props
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" padding="xlarge" className={css.container}>
      {(originalPipeline as any)?.variables?.length > 0 && (
        <div>
          <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
            factory={(factory as unknown) as AbstractStepFactory}
            initialValues={{
              variables: (originalPipeline.variables || []) as AllNGVariables[],
              canAddVariable: true
            }}
            readonly={readonly}
            type={StepType.CustomVariable}
            stepViewType={StepViewType.InputSet}
            customStepProps={{
              template: { variables: (template?.variables || []) as AllNGVariables[] },
              path
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue((template?.properties?.ci?.codebase?.build as unknown) as string) ===
        MultiTypeInputType.RUNTIME && (
        <>
          <div className={css.header}>{getString('ciCodebase')}</div>
          <CICodebaseInputSetForm path={path} readonly={readonly} />
        </>
      )}
      <>
        {template?.stages?.map((stageObj, index) => {
          const pathPrefix = !isEmpty(path) ? `${path}.` : ''
          if (stageObj.stage) {
            const allValues = getStageFromPipeline(stageObj?.stage?.identifier || '', originalPipeline)
            return (
              <div key={stageObj?.stage?.identifier || index}>
                <StageForm
                  template={stageObj}
                  allValues={allValues}
                  path={`${pathPrefix}stages[${index}].stage`}
                  readonly={readonly}
                />
              </div>
            )
          } else if (stageObj.parallel) {
            return ((stageObj.parallel as unknown) as StageElementWrapperConfig[]).map((stageP, indexp) => {
              const allValues = getStageFromPipeline(stageP?.stage?.identifier || '', originalPipeline)
              return (
                <div key={`${stageObj?.stage?.identifier}-${stageP.stage?.identifier}-${indexp}`}>
                  <StageForm
                    template={stageP}
                    allValues={allValues}
                    path={`${pathPrefix}stages[${index}].parallel[${indexp}].stage`}
                    readonly={readonly}
                  />
                </div>
              )
            })
          }
        })}
      </>
    </Layout.Vertical>
  )
}
