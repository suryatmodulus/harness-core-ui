import React from 'react'
import { NestedAccordionPanel } from '@wings-software/uicore'

import type { PipelineInfrastructure, Infrastructure } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface InfrastructureCardProps {
  infrastructure: PipelineInfrastructure
  originalInfrastructure: PipelineInfrastructure
  metadataMap: PipelineVariablesData['metadataMap']
  stageIdentifier: string
  onUpdateInfrastructure(data: Infrastructure): void
  readonly?: boolean
}

export function InfrastructureCard(props: InfrastructureCardProps): React.ReactElement {
  const {
    infrastructure,
    originalInfrastructure,
    onUpdateInfrastructure,
    stageIdentifier,
    metadataMap,
    readonly
  } = props
  const { stepsFactory } = usePipelineContext()

  return (
    <React.Fragment>
      <VariablesListTable
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
