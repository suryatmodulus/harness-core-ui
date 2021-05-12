import React from 'react'
import { Label, NestedAccordionPanel, FormInput } from '@wings-software/uicore'
import { connect } from 'formik'
import { get, set, isEmpty, pickBy, identity } from 'lodash-es'
import cx from 'classnames'
import List from '@common/components/List/List'
import type {
  DeploymentStageConfig,
  K8SDirectInfrastructure,
  ServiceSpec,
  StepElement,
  ExecutionWrapper,
  ExecutionWrapperConfig,
  ServiceConfig,
  PipelineInfrastructure
} from 'services/cd-ng'
import { String, useStrings } from 'framework/strings'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'

import { CollapseForm } from './CollapseForm'
import { getStepFromStage } from '../PipelineStudio/StepUtil'
import { StepWidget } from '../AbstractSteps/StepWidget'
import { StepViewType } from '../AbstractSteps/Step'
import css from './PipelineInputSetForm.module.scss'
// import { deployStageStep } from '@common/components/AddDrawer/__tests__/mockResponses'
function StepForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  path
}: {
  template?: ExecutionWrapperConfig
  allValues?: ExecutionWrapperConfig
  values?: ExecutionWrapperConfig
  onUpdate: (data: ExecutionWrapper) => void
  readonly?: boolean
  path: string
}): JSX.Element {
  return (
    <>
      <Label>{allValues?.step?.name}</Label>
      <StepWidget<ExecutionWrapper>
        factory={factory}
        readonly={readonly}
        path={path}
        template={template?.step}
        initialValues={values?.step || {}}
        allValues={allValues?.step || {}}
        type={(allValues?.step?.type as StepType) || ''}
        onUpdate={onUpdate}
        stepViewType={StepViewType.InputSet}
      />
    </>
  )
}
export interface StageInputSetFormProps {
  deploymentStage?: DeploymentStageConfig
  deploymentStageTemplate: DeploymentStageConfig
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any
  readonly?: boolean
  stageIdentifier?: string
}

function ExecutionWrapperInputSetForm(props: {
  stepsTemplate: ExecutionWrapperConfig[]
  formik: StageInputSetFormProps['formik']
  path: string
  allValues?: ExecutionWrapperConfig[]
  values?: ExecutionWrapperConfig[]
  readonly?: boolean
}): JSX.Element {
  const { stepsTemplate, allValues, values, path, formik, readonly } = props
  return (
    <>
      {stepsTemplate?.map((item, index) => {
        if (item.step) {
          const originalStep = getStepFromStage(item.step?.identifier || '', allValues)
          const initialValues = getStepFromStage(item.step?.identifier || '', values)
          return originalStep && originalStep.step ? (
            <StepForm
              key={item.step.identifier || index}
              template={item}
              allValues={originalStep}
              values={initialValues}
              path={`${path}[${index}].step`}
              readonly={readonly}
              onUpdate={data => {
                if (initialValues) {
                  if (!initialValues.step) {
                    initialValues.step = { identifier: originalStep.step?.identifier || '' }
                  }

                  const execObj = {
                    ...data,
                    spec: {
                      ...pickBy(data.spec, identity)
                    }
                  }

                  initialValues.step = {
                    ...execObj,
                    identifier: originalStep.step?.identifier || ''
                  }

                  formik?.setValues(set(formik?.values, `${path}[${index}].step`, initialValues.step))
                }
              }}
            />
          ) : null
        } else if (item.parallel) {
          return ((item.parallel as unknown) as StepElement[]).map((nodep: ExecutionWrapper, indexp) => {
            if (nodep.step) {
              const originalStep = getStepFromStage(nodep.step?.identifier || '', allValues)
              const initialValues = getStepFromStage(nodep.step?.identifier || '', values)
              return originalStep && originalStep.step ? (
                <StepForm
                  key={nodep.step.identifier || index}
                  template={nodep}
                  allValues={originalStep}
                  values={initialValues}
                  readonly={readonly}
                  path={`${path}[${index}].parallel[${indexp}].step`}
                  onUpdate={data => {
                    if (initialValues) {
                      if (!initialValues.step) {
                        initialValues.step = { identifier: originalStep.step?.identifier || '', timeout: '10m' }
                      }
                      initialValues.step = { ...data, identifier: originalStep.step?.identifier || '', timeout: '10m' }
                      formik?.setValues(
                        set(formik?.values, `${path}[${index}].parallel[${indexp}].step`, initialValues.step)
                      )
                    }
                  }}
                />
              ) : null
            } else if (nodep.stepGroup) {
              const stepGroup = getStepFromStage(nodep.stepGroup.identifier, allValues)
              const initialValues = getStepFromStage(nodep.stepGroup?.identifier || '', values)
              return (
                <>
                  <CollapseForm
                    header={stepGroup?.stepGroup?.name || ''}
                    headerProps={{ font: { size: 'normal' } }}
                    headerColor="var(--black)"
                  >
                    <ExecutionWrapperInputSetForm
                      stepsTemplate={nodep.stepGroup.steps}
                      formik={formik}
                      readonly={readonly}
                      path={`${path}[${index}].parallel[${indexp}].stepGroup.steps`}
                      allValues={stepGroup?.stepGroup?.steps}
                      values={initialValues?.stepGroup?.steps}
                    />
                  </CollapseForm>
                  {nodep.stepGroup.rollbackSteps && (
                    <CollapseForm
                      header={stepGroup?.stepGroup?.name + ' (Rollback)' || ''}
                      headerProps={{ font: { size: 'normal' } }}
                      headerColor="var(--black)"
                    >
                      <ExecutionWrapperInputSetForm
                        stepsTemplate={nodep.stepGroup.rollbackSteps}
                        formik={formik}
                        readonly={readonly}
                        path={`${path}[${index}].parallel[${indexp}].stepGroup.rollbackSteps`}
                        allValues={stepGroup?.stepGroup?.rollbackSteps}
                        values={initialValues?.stepGroup?.rollbackSteps}
                      />
                    </CollapseForm>
                  )}
                </>
              )
            }
          })
        } else if (item.stepGroup) {
          const stepGroup = getStepFromStage(item.stepGroup.identifier, allValues)
          const initialValues = getStepFromStage(item.stepGroup?.identifier || '', values)
          return (
            <>
              <CollapseForm
                header={stepGroup?.stepGroup?.name || ''}
                headerProps={{ font: { size: 'normal' } }}
                headerColor="var(--black)"
              >
                <ExecutionWrapperInputSetForm
                  stepsTemplate={item.stepGroup.steps}
                  formik={formik}
                  readonly={readonly}
                  path={`${path}[${index}].stepGroup.steps`}
                  allValues={stepGroup?.stepGroup?.steps}
                  values={initialValues?.stepGroup?.steps}
                />
              </CollapseForm>
              {item.stepGroup.rollbackSteps && (
                <CollapseForm
                  header={stepGroup?.stepGroup?.name + ' (Rollback)' || ''}
                  headerProps={{ font: { size: 'normal' } }}
                  headerColor="var(--black)"
                >
                  <ExecutionWrapperInputSetForm
                    stepsTemplate={item.stepGroup.rollbackSteps}
                    formik={formik}
                    readonly={readonly}
                    path={`${path}[${index}].stepGroup.rollbackSteps`}
                    allValues={stepGroup?.stepGroup?.rollbackSteps}
                    values={initialValues?.stepGroup?.rollbackSteps}
                  />
                </CollapseForm>
              )}
            </>
          )
        }
      })}
    </>
  )
}

export const StageInputSetFormInternal: React.FC<StageInputSetFormProps> = ({
  deploymentStageTemplate,
  deploymentStage,
  path,
  formik,
  readonly,
  stageIdentifier
}) => {
  const deploymentStageInputSet = get(formik?.values, path, {})
  const { getString } = useStrings()
  const isPropagating = deploymentStage?.serviceConfig?.useFromStage
  return (
    <>
      {deploymentStageTemplate.serviceConfig && (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Service`}
          panelClassName={css.nestedAccordions}
          summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="service" />
            </div>
          }
          details={
            <>
              {deploymentStage?.serviceConfig?.serviceRef && (
                <StepWidget<ServiceConfig>
                  factory={factory}
                  initialValues={deploymentStageInputSet?.serviceConfig || {}}
                  template={deploymentStageTemplate?.serviceConfig || {}}
                  type={StepType.DeployService}
                  stepViewType={StepViewType.InputSet}
                  path={`${path}.serviceConfig`}
                  readonly={readonly}
                  customStepProps={{ stageIdentifier }}
                />
              )}
              {(deploymentStage?.serviceConfig?.serviceDefinition?.type === 'Kubernetes' || isPropagating) && (
                <StepWidget<ServiceSpec>
                  factory={factory}
                  initialValues={
                    isPropagating && deploymentStageInputSet
                      ? deploymentStageInputSet?.serviceConfig?.stageOverrides
                      : deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec || {}
                  }
                  template={
                    isPropagating && deploymentStageTemplate
                      ? deploymentStageTemplate?.serviceConfig?.stageOverrides
                      : deploymentStageTemplate?.serviceConfig?.serviceDefinition?.spec || {}
                  }
                  type={StepType.K8sServiceSpec}
                  stepViewType={StepViewType.InputSet}
                  path={
                    isPropagating
                      ? `${path}.serviceConfig.stageOverrides`
                      : `${path}.serviceConfig.serviceDefinition.spec`
                  }
                  readonly={readonly}
                  customStepProps={{ stageIdentifier }}
                  onUpdate={(data: any) => {
                    if (deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec) {
                      deploymentStageInputSet.serviceConfig.serviceDefinition.spec = data
                      formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                    }
                    if (deploymentStageInputSet?.serviceConfig?.stageOverrides && isPropagating) {
                      deploymentStageInputSet.serviceConfig.stageOverrides = data
                      formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                    }
                  }}
                />
              )}
            </>
          }
        />
      )}

      {deploymentStageTemplate.infrastructure && (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Infrastructure`}
          panelClassName={css.nestedAccordions}
          summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="infrastructureText" />
            </div>
          }
          details={
            <>
              {(deploymentStageTemplate.infrastructure as any)?.spec?.namespace && (
                <FormInput.Text
                  label={<String stringID="pipelineSteps.build.infraSpecifications.namespace" />}
                  name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.namespace`}
                />
              )}
              {deploymentStageTemplate.infrastructure?.environmentRef && (
                <StepWidget<PipelineInfrastructure>
                  factory={factory}
                  initialValues={deploymentStageInputSet?.infrastructure || {}}
                  template={deploymentStageTemplate?.infrastructure || {}}
                  type={StepType.DeployEnvironment}
                  stepViewType={StepViewType.InputSet}
                  path={`${path}.infrastructure`}
                  readonly={readonly}
                />
              )}
              {deploymentStageTemplate.infrastructure.infrastructureDefinition && (
                <StepWidget<K8SDirectInfrastructure>
                  factory={factory}
                  template={deploymentStageTemplate.infrastructure.infrastructureDefinition.spec}
                  initialValues={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec || {}}
                  allValues={deploymentStage?.infrastructure?.infrastructureDefinition?.spec || {}}
                  type={
                    (deploymentStage?.infrastructure?.infrastructureDefinition?.type as StepType) ||
                    StepType.KubernetesDirect
                  }
                  path={`${path}.infrastructure.infrastructureDefinition.spec`}
                  readonly={readonly}
                  onUpdate={data => {
                    if (deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec) {
                      deploymentStageInputSet.infrastructure.infrastructureDefinition.spec = data
                      formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                    }
                  }}
                  stepViewType={StepViewType.InputSet}
                />
              )}
            </>
          }
        />
      )}
      {(deploymentStageTemplate as any).sharedPaths && (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.SharedPaths`}
          panelClassName={css.nestedAccordions}
          summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="pipelineSteps.build.stageSpecifications.sharedPaths" />
            </div>
          }
          details={<List name={`${isEmpty(path) ? '' : `${path}.`}sharedPaths`} />}
        />
      )}
      {(deploymentStageTemplate as ServiceSpec).variables && (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Variables`}
          panelClassName={css.nestedAccordions}
          summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="variablesText" />
            </div>
          }
          details={<div>WIP</div>}
        />
      )}
      {deploymentStageTemplate.execution && (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Execution`}
          panelClassName={css.nestedAccordions}
          summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="executionText" />
            </div>
          }
          details={
            <>
              {deploymentStageTemplate.execution?.steps && (
                <CollapseForm
                  header={getString('executionText')}
                  headerProps={{ font: { size: 'normal' } }}
                  headerColor="var(--black)"
                >
                  <ExecutionWrapperInputSetForm
                    stepsTemplate={deploymentStageTemplate.execution.steps}
                    path={`${path}.execution.steps`}
                    allValues={deploymentStage?.execution?.steps}
                    values={deploymentStageInputSet?.execution?.steps}
                    formik={formik}
                    readonly={readonly}
                  />
                </CollapseForm>
              )}
              {deploymentStageTemplate.execution?.rollbackSteps && (
                <CollapseForm
                  header={getString('rollbackSteps')}
                  headerProps={{ font: { size: 'normal' } }}
                  headerColor="var(--black)"
                >
                  <ExecutionWrapperInputSetForm
                    stepsTemplate={deploymentStageTemplate.execution.rollbackSteps}
                    path={`${path}.execution.rollbackSteps`}
                    allValues={deploymentStage?.execution?.rollbackSteps}
                    values={deploymentStageInputSet?.execution?.rollbackSteps}
                    formik={formik}
                    readonly={readonly}
                  />
                </CollapseForm>
              )}
            </>
          }
        />
      )}
    </>
  )
}
export const StageInputSetForm = connect(StageInputSetFormInternal)
