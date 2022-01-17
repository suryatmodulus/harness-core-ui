/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, FontVariation, MultiTypeInputType, NestedAccordionPanel, Text } from '@wings-software/uicore'

import { isEmpty, lowerCase } from 'lodash-es'
import type { ServiceConfig, ServiceSpec } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { useStrings } from 'framework/strings'
import VariableListTagRow from '@pipeline/components/VariablesListTable/VariableListTagRow'
import VariableAccordionSummary from '../VariableAccordionSummary'
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
  path?: string
  allowableTypes: MultiTypeInputType[]
}

export function ServiceCard(props: ServiceCardProps): React.ReactElement {
  const {
    serviceConfig,
    originalServiceConfig,
    metadataMap,
    stageIdentifier,
    onUpdateServiceConfig,
    readonly,
    allowableTypes
  } = props
  const { stepsFactory } = usePipelineContext()
  const { getString } = useStrings()
  return (
    <React.Fragment>
      <VariablesListTable
        data={serviceConfig.service}
        originalData={originalServiceConfig.service}
        metadataMap={metadataMap}
        className={css.variablePaddingL2}
      />
      {!isEmpty(originalServiceConfig.service?.tags) && (
        <VariableListTagRow
          metadataMap={metadataMap}
          name={lowerCase(getString('tagsLabel'))}
          tags={originalServiceConfig.service?.tags}
          fqn=""
          className={css.variablePaddingTagL3}
        />
      )}
      <StepWidget<ServiceSpec>
        factory={stepsFactory}
        initialValues={originalServiceConfig.serviceDefinition?.spec || {}}
        type={StepsMap[originalServiceConfig.serviceDefinition?.type || '']}
        stepViewType={StepViewType.InputVariable}
        allowableTypes={allowableTypes}
        onUpdate={onUpdateServiceConfig}
        readonly={readonly}
        customStepProps={{
          stageIdentifier,
          metadataMap,
          variablesData: serviceConfig.serviceDefinition?.spec,
          path: props.path
        }}
      />
    </React.Fragment>
  )
}

export function ServiceCardPanel(props: ServiceCardProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      addDomId
      id={`${props.path}.Service`}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {getString('service')}
          </Text>
        </VariableAccordionSummary>
      }
      panelClassName={css.panel}
      summaryClassName={css.accordianSummaryL1}
      details={<ServiceCard {...props} path={`${props.path}.Service`} />}
      collapseProps={{
        keepChildrenMounted: true
      }}
    />
  )
}
