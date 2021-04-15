import React from 'react'
import { Layout, Card, NestedAccordionPanel, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import type { DeploymentStageConfig, PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { String, useStrings } from 'framework/exports'
import type { AllNGVariables } from '@pipeline/utils/types'
import { CollapseForm } from './CollapseForm'
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
  return (
    <NestedAccordionPanel
      isDefaultOpen
      addDomId
      id={`Stage.${allValues?.stage?.identifier}`}
      summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
      panelClassName={css.nestedAccordions}
      summary={
        <div className={css.stagesTreeBulletSquare}>
          <span>{allValues?.stage?.name || ''}</span>
        </div>
      }
      details={
        <>
          {template?.stage?.variables && (
            <NestedAccordionPanel
              isDefaultOpen
              addDomId
              id={`Stage.${allValues?.stage?.identifier}.Variables`}
              summary={
                <div className={css.stagesTreeBulletCircle}>
                  <String stringID="variablesText" />
                </div>
              }
              summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
              panelClassName={css.nestedAccordions}
              details={
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
              }
            />
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
        </>
      }
    />
  )
}

export const PipelineInputSetForm: React.FC<PipelineInputSetFormProps> = props => {
  const { originalPipeline, template, path = '', readonly } = props
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" padding="medium" className={css.container}>
      {(originalPipeline as any)?.variables?.length > 0 && (
        <CollapseForm header={getString('customVariables.pipelineVariablesTitle')}>
          <Card>
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
          </Card>
        </CollapseForm>
      )}
      {getMultiTypeFromValue((template?.properties?.ci?.codebase?.build as unknown) as string) ===
        MultiTypeInputType.RUNTIME && (
        <>
          <div className={css.header}>{getString('ciCodebase')}</div>
          <CICodebaseInputSetForm path={path} readonly={readonly} />
        </>
      )}
      <>
        <div className={css.header}>
          <String stringID="pipeline-list.listStages" />
        </div>
        {template?.stages?.map((stageObj, index) => {
          const pathPrefix = !isEmpty(path) ? `${path}.` : ''
          if (stageObj.stage) {
            const allValues = getStageFromPipeline(stageObj?.stage?.identifier || '', originalPipeline)
            return (
              <Card key={stageObj?.stage?.identifier || index}>
                <StageForm
                  template={stageObj}
                  allValues={allValues}
                  path={`${pathPrefix}stages[${index}].stage`}
                  readonly={readonly}
                />
              </Card>
            )
          } else if (stageObj.parallel) {
            return ((stageObj.parallel as unknown) as StageElementWrapperConfig[]).map((stageP, indexp) => {
              const allValues = getStageFromPipeline(stageP?.stage?.identifier || '', originalPipeline)
              return (
                <Card key={`${stageObj?.stage?.identifier}-${stageP.stage?.identifier}-${indexp}`}>
                  <StageForm
                    template={stageP}
                    allValues={allValues}
                    path={`${pathPrefix}stages[${index}].parallel[${indexp}].stage`}
                    readonly={readonly}
                  />
                </Card>
              )
            })
          }
        })}
      </>
    </Layout.Vertical>
  )
}
