/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, FontVariation, MultiTypeInputType, NestedAccordionPanel, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty, lowerCase } from 'lodash-es'
import type { PipelineInfrastructure, Infrastructure, ExecutionElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import VariableListTagRow from '@pipeline/components/VariablesListTable/VariableListTagRow'
import { ExecutionCardPanel } from './ExecutionCard'
import type { PipelineVariablesData } from '../types'
import VariableAccordionSummary from '../VariableAccordionSummary'
import css from '../PipelineVariables.module.scss'

export interface InfrastructureCardProps {
  infrastructure: PipelineInfrastructure
  originalInfrastructure: PipelineInfrastructure
  metadataMap: PipelineVariablesData['metadataMap']
  stageIdentifier: string
  onUpdateInfrastructure(data: Infrastructure): void
  onUpdateInfrastructureProvisioner(data: ExecutionElementConfig): void
  path?: string
  readonly?: boolean
  allowableTypes: MultiTypeInputType[]
}

export function InfrastructureCard(props: InfrastructureCardProps): React.ReactElement {
  const {
    infrastructure,
    originalInfrastructure,
    onUpdateInfrastructure,
    onUpdateInfrastructureProvisioner,
    stageIdentifier,
    metadataMap,
    readonly,
    path,
    allowableTypes
  } = props
  const { stepsFactory } = usePipelineContext()
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <VariablesListTable
        className={cx(css.variablePaddingL2)}
        data={infrastructure.environment}
        originalData={originalInfrastructure.environment}
        metadataMap={metadataMap}
      />
      {!isEmpty(originalInfrastructure?.environment?.tags) && (
        <VariableListTagRow
          metadataMap={metadataMap}
          name={lowerCase(getString('tagsLabel'))}
          tags={originalInfrastructure?.environment?.tags}
          fqn=""
          className={css.variablePaddingTagL3}
        />
      )}
      <StepWidget<Infrastructure>
        factory={stepsFactory}
        initialValues={originalInfrastructure.infrastructureDefinition?.spec || {}}
        type={originalInfrastructure.infrastructureDefinition?.type as StepType}
        stepViewType={StepViewType.InputVariable}
        allowableTypes={allowableTypes}
        onUpdate={onUpdateInfrastructure}
        readonly={readonly}
        customStepProps={{
          stageIdentifier,
          metadataMap,
          variablesData: infrastructure,
          path
        }}
      />
      {infrastructure.infrastructureDefinition?.provisioner &&
      originalInfrastructure.infrastructureDefinition?.provisioner ? (
        <ExecutionCardPanel
          id={`${props.path}.Provisioner`}
          title={getString('common.provisioner')}
          execution={infrastructure.infrastructureDefinition.provisioner || ({} as any)}
          originalExecution={originalInfrastructure.infrastructureDefinition.provisioner || ({} as any)}
          metadataMap={metadataMap}
          stageIdentifier={stageIdentifier}
          readonly={readonly}
          allowableTypes={allowableTypes}
          onUpdateExecution={onUpdateInfrastructureProvisioner}
          path={`${props.path}.Provisioner`}
        />
      ) : /* istanbul ignore next */ null}
    </React.Fragment>
  )
}

export function InfrastructureCardPanel(props: InfrastructureCardProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      addDomId
      id={`${props.path}`}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {getString('infrastructureText')}
          </Text>
        </VariableAccordionSummary>
      }
      panelClassName={css.panel}
      summaryClassName={css.accordianSummaryL1}
      details={<InfrastructureCard {...props} />}
      collapseProps={{
        keepChildrenMounted: true
      }}
    />
  )
}
