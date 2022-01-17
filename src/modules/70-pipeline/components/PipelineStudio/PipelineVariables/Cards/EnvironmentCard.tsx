/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import produce from 'immer'
import { Color, FontVariation, MultiTypeInputType, NestedAccordionPanel, Text } from '@wings-software/uicore'
import { get, set } from 'lodash-es'
import type { DeploymentStageConfig, StageElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { InfrastructureCardPanel } from '@pipeline/components/PipelineStudio/PipelineVariables/Cards/InfrastructureCard'
import VariableAccordionSummary from '../VariableAccordionSummary'

import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface EnvironmentCardProps {
  stage: StageElementConfig
  originalStage: StageElementConfig
  metadataMap: PipelineVariablesData['metadataMap']
  path?: string
  readonly?: boolean
  allowableTypes: MultiTypeInputType[]
}

const EnvironmentCard = (props: EnvironmentCardProps) => {
  const { stage, originalStage, metadataMap, readonly, path, allowableTypes } = props
  const { updateStage } = usePipelineContext()
  const stageSpec = stage.spec as DeploymentStageConfig
  const originalSpec = originalStage.spec as DeploymentStageConfig

  return (
    <>
      {stageSpec?.infrastructure?.environmentRef && originalSpec?.infrastructure?.environmentRef ? (
        <VariablesListTable
          data={get(stageSpec, 'infrastructure')}
          className={css.variablePaddingL0}
          originalData={get(originalSpec, 'infrastructure')}
          metadataMap={metadataMap}
        />
      ) : null}
      {stageSpec.infrastructure && originalSpec.infrastructure ? (
        <InfrastructureCardPanel
          infrastructure={stageSpec.infrastructure}
          originalInfrastructure={originalSpec.infrastructure}
          metadataMap={metadataMap}
          stageIdentifier={originalStage.identifier}
          readonly={readonly}
          allowableTypes={allowableTypes}
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
    </>
  )
}

export const EnvironmentCardPanel = (props: EnvironmentCardProps) => {
  const { getString } = useStrings()
  const { stage, originalStage } = props
  const stageSpec = stage.spec as DeploymentStageConfig
  const originalSpec = originalStage.spec as DeploymentStageConfig

  const renderEnvironmentCardPanel =
    (stageSpec?.infrastructure?.environmentRef && originalSpec?.infrastructure?.environmentRef) ||
    (stageSpec.infrastructure && originalSpec.infrastructure)

  if (!renderEnvironmentCardPanel) {
    return null
  }

  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      addDomId
      id={`${props.path}.${originalStage.identifier}.Environment`}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {getString('environment')}
          </Text>
        </VariableAccordionSummary>
      }
      panelClassName={css.panel}
      summaryClassName={css.accordianSummaryL1}
      details={<EnvironmentCard {...props} />}
      collapseProps={{
        keepChildrenMounted: true
      }}
    />
  )
}
