import React from 'react'
import { Label, FormInput, MultiTypeInputType, Icon, Layout, Text, Button } from '@wings-software/uicore'
import { connect } from 'formik'
import { get, set, isEmpty, pickBy, identity } from 'lodash-es'
import cx from 'classnames'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type {
  DeploymentStageConfig,
  ServiceSpec,
  StepElement,
  ExecutionWrapper,
  ExecutionWrapperConfig,
  ServiceConfig,
  PipelineInfrastructure,
  Infrastructure,
  StageOverridesConfig
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'

import { CollapseForm } from './CollapseForm'
import { getStepFromStage } from '../PipelineStudio/StepUtil'
import { StepWidget } from '../AbstractSteps/StepWidget'
import { StepViewType } from '../AbstractSteps/Step'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import css from './PipelineInputSetForm.module.scss'

function ServiceDependencyForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  path
}: {
  template?: any
  allValues?: any
  values?: any
  onUpdate: (data: any) => void
  readonly?: boolean
  path: string
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      <Label>
        <Icon
          padding={{ right: 'small' }}
          name={factory.getStepIcon(allValues.type || /* istanbul ignore next */ '')}
        />
        {getString('pipeline.serviceDependencyText')}: {getString('pipeline.stepLabel', allValues)}
      </Label>
      <div>
        <StepWidget<ExecutionWrapper>
          factory={factory}
          readonly={readonly}
          path={path}
          template={template}
          initialValues={values || {}}
          allValues={allValues || {}}
          type={(allValues?.type as StepType) || ''}
          onUpdate={onUpdate}
          stepViewType={StepViewType.InputSet}
        />
      </div>
    </Layout.Vertical>
  )
}

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
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      <Label>
        <Icon
          padding={{ right: 'small' }}
          name={factory.getStepIcon(allValues?.step?.type || /* istanbul ignore next */ '')}
        />
        {getString('pipeline.execution.stepTitlePrefix')}
        {getString('pipeline.stepLabel', allValues?.step)}
      </Label>
      <div>
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
      </div>
    </Layout.Vertical>
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
        /* istanbul ignore else */ if (item.step) {
          const originalStep = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', allValues)
          const initialValues = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', values)
          return originalStep && /* istanbul ignore next */ originalStep.step ? (
            /* istanbul ignore next */ <StepForm
              key={item.step.identifier || index}
              template={item}
              allValues={originalStep}
              values={initialValues}
              path={`${path}[${index}].step`}
              readonly={readonly}
              onUpdate={data => {
                /* istanbul ignore next */
                if (initialValues) {
                  if (!initialValues.step) {
                    initialValues.step = {
                      identifier: originalStep.step?.identifier || '',
                      name: originalStep.step?.name || '',
                      type: originalStep.step?.type || ''
                    }
                  }

                  const execObj = {
                    ...data,
                    spec: {
                      ...pickBy(data.spec, identity)
                    }
                  }

                  initialValues.step = {
                    ...execObj,
                    identifier: originalStep.step?.identifier || '',
                    name: originalStep.step?.name || '',
                    type: originalStep.step?.type || ''
                  }

                  formik?.setValues(set(formik?.values, `${path}[${index}].step`, initialValues.step))
                }
              }}
            />
          ) : null
        } else if (item.parallel) {
          return (item.parallel as unknown as StepElement[]).map((nodep: ExecutionWrapper, indexp) => {
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
                        initialValues.step = {
                          identifier: originalStep.step?.identifier || '',
                          name: originalStep.step?.name || '',
                          type: originalStep.step?.type || '',
                          timeout: '10m'
                        }
                      }
                      initialValues.step = {
                        ...data,
                        identifier: originalStep.step?.identifier || '',
                        name: originalStep.step?.name || '',
                        type: originalStep.step?.type || '',
                        timeout: '10m'
                      }
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
  const { expressions } = useVariablesExpression()
  const isPropagating = deploymentStage?.serviceConfig?.useFromStage

  return (
    <>
      {deploymentStageTemplate.serviceConfig && (
        <div id={`Stage.${stageIdentifier}.Service`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('service')}</div>
          <div className={css.nestedAccordions}>
            {deploymentStageTemplate?.serviceConfig?.serviceRef && (
              /* istanbul ignore next */ <StepWidget<ServiceConfig>
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
              /* istanbul ignore next */ <StepWidget<ServiceSpec>
                factory={factory}
                initialValues={
                  isPropagating && deploymentStageInputSet
                    ? (deploymentStageInputSet?.serviceConfig?.stageOverrides as StageOverridesConfig)
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
                customStepProps={{
                  stageIdentifier,
                  allValues:
                    isPropagating && deploymentStageInputSet
                      ? deploymentStage?.serviceConfig?.stageOverrides
                      : deploymentStage?.serviceConfig.serviceDefinition?.spec
                }}
                onUpdate={(data: any) => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec) {
                    deploymentStageInputSet.serviceConfig.serviceDefinition.spec = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.serviceConfig?.stageOverrides && isPropagating) {
                    deploymentStageInputSet.serviceConfig.stageOverrides = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {deploymentStageTemplate.infrastructure && (
        <div id={`Stage.${stageIdentifier}.Infrastructure`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('infrastructureText')}</div>

          <div className={css.nestedAccordions}>
            {(deploymentStageTemplate.infrastructure as any).spec?.namespace && (
              <FormInput.MultiTextInput
                label={
                  <Text flex font="small" margin={{ bottom: 'xsmall' }}>
                    {getString('pipelineSteps.build.infraSpecifications.namespace')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipeline.namespaceTooltip')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.namespace`}
                multiTextInputProps={{
                  expressions,
                  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                }}
                disabled={readonly}
              />
            )}
            {(deploymentStageTemplate.infrastructure as any).spec?.serviceAccountName && (
              <FormInput.MultiTextInput
                label={getString('pipeline.infraSpecifications.serviceAccountName')}
                name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.serviceAccountName`}
                multiTextInputProps={{
                  expressions,
                  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                }}
                disabled={readonly}
              />
            )}
            {(deploymentStageTemplate.infrastructure as any).spec?.initTimeout && (
              <FormMultiTypeDurationField
                label={
                  <Text flex={{ justifyContent: 'start' }} font="small">
                    {getString('pipeline.infraSpecifications.initTimeout')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.timeoutInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.initTimeout`}
                multiTypeDurationProps={{
                  expressions,
                  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                }}
                disabled={readonly}
              />
            )}
            {deploymentStageTemplate.infrastructure?.environmentRef && (
              /* istanbul ignore next */ <StepWidget<PipelineInfrastructure>
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
              /* istanbul ignore next */ <StepWidget<Infrastructure>
                factory={factory}
                template={deploymentStageTemplate.infrastructure.infrastructureDefinition.spec}
                initialValues={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec || {}}
                allValues={
                  deploymentStage?.infrastructure?.infrastructureDefinition?.spec || /* istanbul ignore next */ {}
                }
                type={
                  (deploymentStage?.infrastructure?.infrastructureDefinition?.type as StepType) ||
                  /* istanbul ignore next */ StepType.KubernetesDirect
                }
                path={`${path}.infrastructure.infrastructureDefinition.spec`}
                readonly={readonly}
                onUpdate={data => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec) {
                    deploymentStageInputSet.infrastructure.infrastructureDefinition.spec = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                }}
                stepViewType={StepViewType.InputSet}
              />
            )}
          </div>
        </div>
      )}

      {deploymentStageTemplate.infrastructure?.infrastructureDefinition?.provisioner && (
        /* istanbul ignore next */ <div
          id={`Stage.${stageIdentifier}.infrastructure.infrastructureDefinition?.provisioner`}
          className={cx(css.accordionSummary)}
        >
          <div className={css.inputheader}>{getString('pipeline.provisionerSteps')}</div>

          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps && (
              <ExecutionWrapperInputSetForm
                stepsTemplate={deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps}
                path={`${path}.infrastructure.infrastructureDefinition.provisioner.steps`}
                allValues={deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps}
                values={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.provisioner?.steps}
                formik={formik}
                readonly={readonly}
              />
            )}
            {deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps && (
              <ExecutionWrapperInputSetForm
                stepsTemplate={
                  deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps
                }
                path={`${path}.infrastructure.infrastructureDefinition.provisioner.rollbackSteps`}
                allValues={deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps}
                values={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.provisioner?.rollbackSteps}
                formik={formik}
                readonly={readonly}
              />
            )}
          </div>
        </div>
      )}
      {(deploymentStageTemplate as any).sharedPaths && (
        /* istanbul ignore next */ <div
          id={`Stage.${stageIdentifier}.SharedPaths`}
          className={cx(css.accordionSummary)}
        >
          <div className={css.nestedAccordions}>
            <MultiTypeListInputSet
              name={`${isEmpty(path) ? '' : `${path}.`}sharedPaths`}
              multiTextInputProps={{
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                expressions
              }}
              multiTypeFieldSelectorProps={{
                label: (
                  <div className={css.inputheader} style={{ padding: 0 }}>
                    {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                  </div>
                ),
                allowedTypes: [MultiTypeInputType.FIXED]
              }}
              disabled={readonly}
            />
          </div>
        </div>
      )}
      {(deploymentStageTemplate as ServiceSpec).variables && (
        /* istanbul ignore next */ <div id={`Stage.${stageIdentifier}.Variables`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('variablesText')}</div>

          <div className={css.nestedAccordions}>WIP</div>
        </div>
      )}
      {(deploymentStageTemplate as any).serviceDependencies && (
        <div id={`Stage.${stageIdentifier}.ServiceDependencies`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('pipeline.serviceDependenciesText')}</div>

          <div className={css.nestedAccordions}>
            {(deploymentStageTemplate as any).serviceDependencies &&
              (deploymentStageTemplate as any).serviceDependencies.map(({ identifier }: any, index: number) => (
                <ServiceDependencyForm
                  template={(deploymentStageTemplate as any).serviceDependencies[index]}
                  path={`${path}.serviceDependencies[${index}]`}
                  allValues={(deploymentStage as any)?.serviceDependencies?.[index]}
                  values={deploymentStageInputSet?.serviceDependencies?.[index]}
                  readonly={readonly}
                  key={identifier}
                  onUpdate={data => {
                    const originalServiceDependency = (deploymentStage as any)?.serviceDependencies?.[index]
                    let initialValues = deploymentStageInputSet?.serviceDependencies?.[index]

                    if (initialValues) {
                      if (!initialValues) {
                        initialValues = {
                          identifier: originalServiceDependency.identifier || '',
                          name: originalServiceDependency.name || '',
                          type: originalServiceDependency.type || ''
                        }
                      }

                      initialValues = {
                        ...data,
                        identifier: originalServiceDependency.identifier || '',
                        name: originalServiceDependency.name || '',
                        type: originalServiceDependency.type || ''
                      }

                      formik?.setValues(set(formik?.values, `${path}.serviceDependencies[${index}]`, initialValues))
                    }
                  }}
                />
              ))}
          </div>
        </div>
      )}
      {deploymentStageTemplate.execution && (
        <div id={`Stage.${stageIdentifier}.Execution`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('executionText')}</div>

          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.execution?.steps && (
              <ExecutionWrapperInputSetForm
                stepsTemplate={deploymentStageTemplate.execution.steps}
                path={`${path}.execution.steps`}
                allValues={deploymentStage?.execution?.steps}
                values={deploymentStageInputSet?.execution?.steps}
                formik={formik}
                readonly={readonly}
              />
            )}
            {deploymentStageTemplate.execution?.rollbackSteps && (
              <ExecutionWrapperInputSetForm
                stepsTemplate={deploymentStageTemplate.execution.rollbackSteps}
                path={`${path}.execution.rollbackSteps`}
                allValues={deploymentStage?.execution?.rollbackSteps}
                values={deploymentStageInputSet?.execution?.rollbackSteps}
                formik={formik}
                readonly={readonly}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
export const StageInputSetForm = connect(StageInputSetFormInternal)
