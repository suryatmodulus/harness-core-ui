import React from 'react'
import produce from 'immer'
import { set } from 'lodash-es'
import { NestedAccordionPanel } from '@wings-software/uicore'
import cx from 'classnames'
import type { ExecutionElementConfig, ExecutionWrapperConfig, StepElementConfig } from 'services/cd-ng'

import type { PipelineVariablesData } from '../types'
import { StepCardPanel, StepGroupCardPanel } from './StepCard'
import VariableAccordionSummary from '../VariableAccordionSummary'
import css from '../PipelineVariables.module.scss'

export interface AddStepsParams {
  steps?: ExecutionWrapperConfig[]
  originalSteps?: ExecutionWrapperConfig[]
  parentPath?: string
}

export interface StepRenderData {
  step: StepElementConfig
  originalStep: StepElementConfig
  path: string
  type: 'StepRenderData'
}

export interface StepGroupRenderData {
  steps: Array<StepRenderData>
  name: string
  originalName: string
  identifier: string
  path: string
  type: 'StepGroupRenderData'
}

export interface ExecutionCardProps {
  id: string
  title: string
  execution: ExecutionElementConfig
  originalExecution: ExecutionElementConfig
  metadataMap: PipelineVariablesData['metadataMap']
  stageIdentifier: string
  onUpdateExecution(data: ExecutionElementConfig): void
  readonly?: boolean
  path?: string
}

export function ExecutionCard(props: ExecutionCardProps): React.ReactElement {
  const { execution, originalExecution, metadataMap, stageIdentifier, onUpdateExecution, readonly, path } = props

  const allSteps = React.useMemo(() => {
    function addToCards({
      steps,
      originalSteps,
      parentPath = /* istanbul ignore next */ ''
    }: AddStepsParams): Array<StepRenderData | StepGroupRenderData> {
      if (!steps || !Array.isArray(steps)) return []

      return steps.reduce<Array<StepRenderData | StepGroupRenderData>>((cards, { step, stepGroup, parallel }, i) => {
        if (step) {
          cards.push({
            type: 'StepRenderData',
            step,
            originalStep: originalSteps?.[i]?.step || /* istanbul ignore next */ {
              timeout: '10m',
              name: '',
              type: '',
              identifier: ''
            },
            path: parentPath
          })
        } else if (stepGroup) {
          cards.push({
            type: 'StepGroupRenderData',
            steps: [
              ...(addToCards({
                steps: stepGroup.steps,
                originalSteps: originalSteps?.[i]?.stepGroup?.steps,
                parentPath: `${parentPath}.steps`
              }) as StepRenderData[]),
              ...(addToCards({
                steps: stepGroup.rollbackSteps,
                originalSteps: originalSteps?.[i]?.stepGroup?.rollbackSteps,
                parentPath: `${parentPath}.rollbackSteps`
              }) as StepRenderData[])
            ],
            name: stepGroup.name || '',
            originalName: originalSteps?.[i]?.stepGroup?.name || /* istanbul ignore next */ '',
            identifier: originalSteps?.[i]?.stepGroup?.identifier || /* istanbul ignore next */ '',
            path: `${parentPath}.stepGroup`
          })
        } /* istanbul ignore else */ else if (parallel) {
          cards.push(
            ...addToCards({
              steps: parallel,
              originalSteps: originalSteps?.[i]?.parallel,
              parentPath: `${parentPath}.parallel`
            })
          )
        }

        return cards
      }, [])
    }

    return [
      ...addToCards({ steps: execution.steps, originalSteps: originalExecution.steps, parentPath: path }),
      ...addToCards({
        steps: execution.rollbackSteps,
        originalSteps: originalExecution.rollbackSteps,
        parentPath: `${path}.rollbackSteps`
      })
    ]
  }, [execution, originalExecution])

  return (
    <React.Fragment>
      {allSteps.map((row, index) => {
        if (row.type === 'StepRenderData' && row.step && row.originalStep) {
          const { step, originalStep, path: pathStep } = row
          return (
            <StepCardPanel
              key={index}
              step={step}
              originalStep={originalStep}
              metadataMap={metadataMap}
              stageIdentifier={stageIdentifier}
              stepPath={pathStep}
              readonly={readonly}
              onUpdateStep={(data: StepElementConfig, stepPath: string) => {
                onUpdateExecution(
                  produce(originalExecution, draft => {
                    set(draft, stepPath, data)
                  })
                )
              }}
            />
          )
        }

        /* istanbul ignore else */
        if (row.type === 'StepGroupRenderData') {
          return (
            <StepGroupCardPanel
              key={row.path}
              steps={row.steps}
              stepGroupIdentifier={row.identifier}
              stepGroupName={row.name}
              stepGroupOriginalName={row.originalName}
              metadataMap={metadataMap}
              readonly={readonly}
              stageIdentifier={stageIdentifier}
              onUpdateStep={(data: StepElementConfig, stepPath: string) => {
                onUpdateExecution(
                  produce(originalExecution, draft => {
                    set(draft, stepPath, data)
                  })
                )
              }}
            />
          )
        }

        return null
      })}
    </React.Fragment>
  )
}

export function ExecutionCardPanel(props: ExecutionCardProps): React.ReactElement {
  return (
    <NestedAccordionPanel
      isDefaultOpen
      addDomId
      id={props.id}
      collapseProps={{
        keepChildrenMounted: true
      }}
      summary={<VariableAccordionSummary> {props.title}</VariableAccordionSummary>}
      panelClassName={css.panel}
      summaryClassName={cx(css.variableBorderBottom, css.accordianSummaryL1)}
      details={<ExecutionCard {...props} />}
    />
  )
}
