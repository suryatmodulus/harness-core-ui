import React from 'react'
import produce from 'immer'
import { set } from 'lodash-es'
import { Text, Color, NestedAccordionPanel } from '@wings-software/uicore'

import type { StageElement, DeploymentStage, StageElementConfig } from 'services/cd-ng'
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
import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface StageCardProps {
  stage: StageElement
  originalStage: StageElement
  metadataMap: PipelineVariablesData['metadataMap']
  readonly?: boolean
}

export default function StageCard(props: StageCardProps): React.ReactElement {
  const { stage, originalStage, metadataMap, readonly } = props
  const { updateStage, stepsFactory } = usePipelineContext()
  const { getString } = useStrings()
  const stageSpec = stage.spec as DeploymentStage
  const originalSpec = originalStage.spec as DeploymentStage

  return (
    <NestedAccordionPanel
      isDefaultOpen
      key={originalStage.identifier}
      id={`Stage.${originalStage.identifier}`}
      addDomId
      summary={
        <Text className={css.stageTitle} color={Color.BLACK}>
          {originalStage.name}
        </Text>
      }
      summaryClassName={css.stageSummary}
      detailsClassName={css.stageDetails}
      details={
        <div className={css.variableCard}>
          <VariablesListTable data={stage} originalData={originalStage} metadataMap={metadataMap} />

          {originalSpec && (
            <React.Fragment>
              <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                factory={stepsFactory}
                initialValues={{
                  variables: ((originalStage as DeploymentStage).variables || []) as AllNGVariables[],
                  canAddVariable: true
                }}
                readonly={readonly}
                type={StepType.CustomVariable}
                stepViewType={StepViewType.InputVariable}
                onUpdate={({ variables }: CustomVariablesData) => {
                  updateStage({ ...originalStage, variables } as StageElementConfig)
                }}
                customStepProps={{
                  variableNamePrefix: `${originalStage.identifier}.variables.`,
                  domId: `Stage.${originalStage.identifier}.Variables-panel`,
                  className: css.customVariables,
                  heading: <b>{getString('customVariables.title')}</b>,
                  yamlProperties: ((stage as DeploymentStage).variables as AllNGVariables[])?.map?.(
                    variable =>
                      metadataMap[variable.value || /* istanbul ignore next */ '']?.yamlProperties ||
                      /* istanbul ignore next */ {}
                  )
                }}
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
                          }) as StageElementConfig
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
                      onUpdateInfrastructure={infrastructure => {
                        updateStage(
                          produce(originalStage, draft => {
                            set(draft, 'spec.infrastructure', infrastructure)
                          }) as StageElementConfig
                        )
                      }}
                      onUpdateInfrastructureProvisioner={provisioner => {
                        updateStage(
                          produce(originalStage, draft => {
                            set(draft, 'spec.infrastructure.infrastructureDefinition.provisioner', provisioner)
                          }) as StageElementConfig
                        )
                      }}
                    />
                  ) : /* istanbul ignore next */ null}
                  {stageSpec.execution && originalSpec.execution ? (
                    <ExecutionCardPanel
                      id={`Stage.${originalStage.identifier}.Execution`}
                      title={getString('executionText')}
                      execution={stageSpec.execution}
                      originalExecution={originalSpec.execution}
                      metadataMap={metadataMap}
                      stageIdentifier={originalStage.identifier}
                      readonly={readonly}
                      onUpdateExecution={execution => {
                        updateStage(
                          produce(originalStage, draft => {
                            set(draft, 'spec.execution', execution)
                          }) as StageElementConfig
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
