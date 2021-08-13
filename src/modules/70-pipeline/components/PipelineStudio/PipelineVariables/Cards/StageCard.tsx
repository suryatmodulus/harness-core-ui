import React from 'react'
import produce from 'immer'
import { defaultTo, set } from 'lodash-es'
import { Text, Color, NestedAccordionPanel } from '@wings-software/uicore'
import cx from 'classnames'
import type { DeploymentStageConfig, StageElementConfig } from 'services/cd-ng'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { AllNGVariables } from '@pipeline/utils/types'

import { ServiceCardPanel } from './ServiceCard'
import { InfrastructureCardPanel } from './InfrastructureCard'
import { ExecutionCardPanel } from './ExecutionCard'
import VariableAccordionSummary from '../VariableAccordionSummary'
import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface StageCardProps {
  stage: StageElementConfig
  originalStage: StageElementConfig
  metadataMap: PipelineVariablesData['metadataMap']
  readonly?: boolean
  path?: string
}

export default function StageCard(props: StageCardProps): React.ReactElement {
  const { stage, originalStage, metadataMap, readonly, path } = props
  const { updateStage, stepsFactory } = usePipelineContext()
  const { getString } = useStrings()
  const stageSpec = stage.spec as DeploymentStageConfig
  const originalSpec = originalStage.spec as DeploymentStageConfig

  return (
    <NestedAccordionPanel
      isDefaultOpen
      collapseProps={{
        keepChildrenMounted: true
      }}
      key={`${path}.${originalStage.identifier}`}
      id={`${path}.${originalStage.identifier}`}
      addDomId
      summary={
        <VariableAccordionSummary>
          <Text className={css.stageTitle} color={Color.BLACK}>
            {`Stage:${originalStage.name}`}
          </Text>
        </VariableAccordionSummary>
      }
      summaryClassName={css.stageSummary}
      details={
        <div className={css.variableCard}>
          <VariablesListTable
            data={stage}
            className={css.variablePaddingL0}
            originalData={originalStage}
            metadataMap={metadataMap}
          />

          {originalSpec && (
            <React.Fragment>
              <NestedAccordionPanel
                isDefaultOpen
                key={`${path}.${originalStage.identifier}.variables`}
                id={`${path}.${originalStage.identifier}.variables`}
                addDomId
                summary={
                  <VariableAccordionSummary>
                    <Text className={css.stageTitle} color={Color.BLACK}>
                      {getString('customVariables.title')}
                    </Text>
                  </VariableAccordionSummary>
                }
                collapseProps={{
                  keepChildrenMounted: true
                }}
                summaryClassName={css.variableBorderBottom}
                details={
                  <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                    factory={stepsFactory}
                    initialValues={{
                      variables: defaultTo(originalStage.variables, []) as AllNGVariables[],
                      canAddVariable: true
                    }}
                    readonly={readonly}
                    type={StepType.CustomVariable}
                    stepViewType={StepViewType.InputVariable}
                    onUpdate={({ variables }: CustomVariablesData) => {
                      updateStage({ ...originalStage, variables })
                    }}
                    customStepProps={{
                      variableNamePrefix: `${originalStage.identifier}.variables.`,
                      domId: `Stage.${originalStage.identifier}.Variables-panel`,
                      className: cx(css.customVariables, css.customVarPadL1),
                      // heading: <b>{getString('customVariables.title')}</b>,
                      path: `${path}.customVariables`,
                      yamlProperties: (defaultTo(stage.variables, []) as AllNGVariables[]).map?.(
                        variable =>
                          metadataMap[variable.value || /* istanbul ignore next */ '']?.yamlProperties ||
                          /* istanbul ignore next */ {}
                      )
                    }}
                  />
                }
              />
              {/* TODO: Temporary disable for  CI (TBD)*/}
              {stage.type === 'Deployment' ? (
                <>
                  {stageSpec.serviceConfig && originalSpec.serviceConfig ? (
                    <ServiceCardPanel
                      serviceConfig={stageSpec.serviceConfig}
                      originalServiceConfig={originalSpec.serviceConfig}
                      metadataMap={metadataMap}
                      readonly={readonly}
                      stageIdentifier={originalStage.identifier}
                      path={`${path}.${originalStage.identifier}`}
                      onUpdateServiceConfig={serviceSpec => {
                        updateStage(
                          produce(originalStage, draft => {
                            if (serviceSpec.artifacts) {
                              set(draft, 'spec.serviceConfig.serviceDefinition.spec.artifacts', serviceSpec.artifacts)
                            }
                            if (serviceSpec.manifests) {
                              set(draft, 'spec.serviceConfig.serviceDefinition.spec.manifest', serviceSpec.manifests)
                            }
                            if (serviceSpec.variables) {
                              set(draft, 'spec.serviceConfig.serviceDefinition.spec.variables', serviceSpec.variables)
                            }
                          })
                        )
                      }}
                    />
                  ) : /* istanbul ignore next */ null}
                  {stageSpec.infrastructure && originalSpec.infrastructure ? (
                    <InfrastructureCardPanel
                      infrastructure={stageSpec.infrastructure}
                      originalInfrastructure={originalSpec.infrastructure}
                      metadataMap={metadataMap}
                      stageIdentifier={originalStage.identifier}
                      readonly={readonly}
                      path={`${path}.${originalStage.identifier}.Infrastructure`}
                      onUpdateInfrastructure={infrastructure => {
                        updateStage(
                          produce(originalStage, draft => {
                            set(draft, 'spec.infrastructure', infrastructure)
                          })
                        )
                      }}
                      onUpdateInfrastructureProvisioner={provisioner => {
                        updateStage(
                          produce(originalStage, draft => {
                            set(draft, 'spec.infrastructure.infrastructureDefinition.provisioner', provisioner)
                          })
                        )
                      }}
                    />
                  ) : /* istanbul ignore next */ null}
                  {stageSpec.execution && originalSpec.execution ? (
                    <ExecutionCardPanel
                      id={`${path}.${originalStage.identifier}.Execution`}
                      title={getString('executionText')}
                      execution={stageSpec.execution}
                      originalExecution={originalSpec.execution}
                      metadataMap={metadataMap}
                      stageIdentifier={originalStage.identifier}
                      readonly={readonly}
                      path={`${path}.${originalStage.identifier}.Execution`}
                      onUpdateExecution={execution => {
                        updateStage(
                          produce(originalStage, draft => {
                            set(draft, 'spec.execution', execution)
                          })
                        )
                      }}
                    />
                  ) : /* istanbul ignore next */ null}
                </>
              ) : /* istanbul ignore next */ null}
            </React.Fragment>
          )}
        </div>
      }
    />
  )
}
