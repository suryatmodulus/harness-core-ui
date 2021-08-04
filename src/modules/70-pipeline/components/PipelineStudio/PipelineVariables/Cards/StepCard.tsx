import React from 'react'
import { NestedAccordionPanel } from '@wings-software/uicore'
import cx from 'classnames'
import type { StepElementConfig } from 'services/cd-ng'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import type { PipelineVariablesData } from '../types'
import VariableAccordionSummary from '../VariableAccordionSummary'
import css from '../PipelineVariables.module.scss'
export interface StepCardProps {
  step: StepElementConfig
  originalStep: StepElementConfig
  stageIdentifier: string
  metadataMap: PipelineVariablesData['metadataMap']
  onUpdateStep(data: StepElementConfig, path: string): void
  stepPath: string
  readonly?: boolean
}

export function StepCard(props: StepCardProps): React.ReactElement {
  const { step, originalStep, metadataMap, stageIdentifier, onUpdateStep, stepPath, readonly } = props
  const { stepsFactory } = usePipelineContext()

  return (
    <React.Fragment>
      <VariablesListTable
        className={css.variablePaddingL2}
        data={step}
        originalData={originalStep}
        metadataMap={metadataMap}
      />
      <StepWidget<StepElementConfig>
        factory={stepsFactory}
        initialValues={originalStep}
        type={originalStep.type as StepType}
        stepViewType={StepViewType.InputVariable}
        onUpdate={(data: StepElementConfig) => onUpdateStep(data, stepPath)}
        readonly={readonly}
        customStepProps={{
          stageIdentifier,
          metadataMap,
          variablesData: step
        }}
      />
    </React.Fragment>
  )
}

export function StepCardPanel(props: StepCardProps): React.ReactElement {
  return (
    <NestedAccordionPanel
      isDefaultOpen
      addDomId
      id={`Stage.${props.stageIdentifier}.Execution.Step.${props.originalStep.identifier}`}
      summary={<VariableAccordionSummary>{props.originalStep.name}</VariableAccordionSummary>}
      summaryClassName={cx(css.variableBorderBottom, css.accordianSummaryL2)}
      details={<StepCard {...props} />}
    />
  )
}

export interface StepGroupCardProps {
  steps: Array<{ step: StepElementConfig; originalStep: StepElementConfig; path: string }>
  stageIdentifier: string
  metadataMap: PipelineVariablesData['metadataMap']
  onUpdateStep(data: StepElementConfig, path: string): void
  stepGroupIdentifier: string
  stepGroupName: string
  stepGroupOriginalName: string
  readonly?: boolean
}

export function StepGroupCard(props: StepGroupCardProps): React.ReactElement {
  const { steps, metadataMap, onUpdateStep, stageIdentifier, stepGroupName, stepGroupOriginalName, readonly } = props

  return (
    <React.Fragment>
      <VariablesListTable
        data={{ name: stepGroupName }}
        originalData={{ name: stepGroupOriginalName }}
        metadataMap={metadataMap}
        className={css.variablePaddingL3}
      />
      {steps.map(row => {
        const { step, originalStep, path } = row
        return (
          <StepCardPanel
            key={path}
            step={step}
            originalStep={originalStep}
            metadataMap={metadataMap}
            stepPath={path}
            readonly={readonly}
            stageIdentifier={stageIdentifier}
            onUpdateStep={onUpdateStep}
          />
        )
      })}
    </React.Fragment>
  )
}

export function StepGroupCardPanel(props: StepGroupCardProps): React.ReactElement {
  return (
    <NestedAccordionPanel
      isDefaultOpen
      addDomId
      id={`Stage.${props.stageIdentifier}.Execution.StepGroup.${props.stepGroupIdentifier}`}
      summary={<VariableAccordionSummary>{props.stepGroupOriginalName}</VariableAccordionSummary>}
      summaryClassName={cx(css.variableBorderBottom, css.accordianSummaryL2)}
      details={<StepGroupCard {...props} />}
    />
  )
}
