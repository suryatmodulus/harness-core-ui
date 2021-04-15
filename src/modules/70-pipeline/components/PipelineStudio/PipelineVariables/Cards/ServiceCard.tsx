import React from 'react'
import { NestedAccordionPanel } from '@wings-software/uicore'

import type { ServiceConfig, ServiceSpec } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { useStrings } from 'framework/exports'

import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

const StepsMap: Record<string, StepType> = {
  Kubernetes: StepType.K8sServiceSpec
}

export interface ServiceCardProps {
  serviceConfig: ServiceConfig
  originalServiceConfig: ServiceConfig
  metadataMap: PipelineVariablesData['metadataMap']
  stageIdentifier: string
  onUpdateServiceConfig(data: ServiceSpec): void
  readonly?: boolean
}

export function ServiceCard(props: ServiceCardProps): React.ReactElement {
  const { serviceConfig, originalServiceConfig, metadataMap, stageIdentifier, onUpdateServiceConfig, readonly } = props
  const { stepsFactory } = usePipelineContext()

  return (
    <React.Fragment>
      <VariablesListTable
        data={serviceConfig.service}
        originalData={originalServiceConfig.service}
        metadataMap={metadataMap}
      />
      <StepWidget<ServiceSpec>
        factory={stepsFactory}
        initialValues={originalServiceConfig.serviceDefinition?.spec || {}}
        type={StepsMap[originalServiceConfig.serviceDefinition?.type || '']}
        stepViewType={StepViewType.InputVariable}
        onUpdate={onUpdateServiceConfig}
        readonly={readonly}
        customStepProps={{
          stageIdentifier,
          metadataMap,
          variablesData: serviceConfig.serviceDefinition?.spec
        }}
      />
    </React.Fragment>
  )
}

export function ServiceCardPanel(props: ServiceCardProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <NestedAccordionPanel
      isDefaultOpen
      addDomId
      id={`Stage.${props.stageIdentifier}.Service`}
      summary={getString('service')}
      panelClassName={css.panel}
      details={<ServiceCard {...props} />}
    />
  )
}
