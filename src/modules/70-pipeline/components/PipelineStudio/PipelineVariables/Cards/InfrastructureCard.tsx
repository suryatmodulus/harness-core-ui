import React from 'react'
import { NestedAccordionPanel } from '@wings-software/uicore'

import type { PipelineInfrastructure, Infrastructure, ExecutionElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { FeatureFlag } from '@common/featureFlags'

import { ExecutionCardPanel } from './ExecutionCard'
import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface InfrastructureCardProps {
  infrastructure: PipelineInfrastructure
  originalInfrastructure: PipelineInfrastructure
  metadataMap: PipelineVariablesData['metadataMap']
  stageIdentifier: string
  onUpdateInfrastructure(data: Infrastructure): void
  onUpdateInfrastructureProvisioner(data: ExecutionElementConfig): void

  readonly?: boolean
}

export function InfrastructureCard(props: InfrastructureCardProps): React.ReactElement {
  const {
    infrastructure,
    originalInfrastructure,
    onUpdateInfrastructure,
    onUpdateInfrastructureProvisioner,
    stageIdentifier,
    metadataMap,
    readonly
  } = props
  const { stepsFactory } = usePipelineContext()
  const { getString } = useStrings()
  const isProvisionerEnabled = useFeatureFlag(FeatureFlag.NG_PROVISIONERS)

  return (
    <React.Fragment>
      <VariablesListTable
        className={css.variablesTable}
        data={infrastructure.environment}
        originalData={originalInfrastructure.environment}
        metadataMap={metadataMap}
      />
      <StepWidget<Infrastructure>
        factory={stepsFactory}
        initialValues={originalInfrastructure.infrastructureDefinition?.spec || {}}
        type={originalInfrastructure.infrastructureDefinition?.type as StepType}
        stepViewType={StepViewType.InputVariable}
        onUpdate={onUpdateInfrastructure}
        readonly={readonly}
        customStepProps={{
          stageIdentifier,
          metadataMap,
          variablesData: infrastructure
        }}
      />
      {isProvisionerEnabled &&
      infrastructure.infrastructureDefinition &&
      originalInfrastructure.infrastructureDefinition ? (
        <ExecutionCardPanel
          id={`Stage.${stageIdentifier}.Provisioner`}
          title={getString('common.provisioner')}
          execution={infrastructure.infrastructureDefinition.provisioner || ({} as any)}
          originalExecution={originalInfrastructure.infrastructureDefinition.provisioner || ({} as any)}
          metadataMap={metadataMap}
          stageIdentifier={stageIdentifier}
          readonly={readonly}
          onUpdateExecution={onUpdateInfrastructureProvisioner}
        />
      ) : /* istanbul ignore next */ null}
    </React.Fragment>
  )
}

export function InfrastructureCardPanel(props: InfrastructureCardProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <NestedAccordionPanel
      isDefaultOpen
      addDomId
      id={`Stage.${props.stageIdentifier}.Infrastructure`}
      summary={getString('infrastructureText')}
      panelClassName={css.panel}
      details={<InfrastructureCard {...props} />}
    />
  )
}
