import { Card, HarnessDocTooltip, Layout } from '@wings-software/uicore'
import React from 'react'
import cx from 'classnames'
import { produce } from 'immer'
import { set } from 'lodash-es'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { FailureStrategyWithRef } from '@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy'
import type { StepFormikRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import ConditionalExecution from '@pipeline/components/PipelineStudio/ConditionalExecution/ConditionalExecution'
import { useStrings } from 'framework/strings'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import css from './BuildAdvancedSpecifications.module.scss'

export interface AdvancedSpecifications {
  context?: string
}
const BuildAdvancedSpecifications: React.FC<AdvancedSpecifications> = ({ children }): JSX.Element => {
  const { getString } = useStrings()

  const {
    state: {
      selectionState: { selectedStageId }
    },
    isReadonly,
    getStageFromPipeline,
    updateStage
  } = React.useContext(PipelineContext)
  const { stage } = getStageFromPipeline(selectedStageId || '')

  const formikRef = React.useRef<StepFormikRef | null>(null)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <div className={cx(css.stageSection, css.editStageGrid)}>
      <div className={css.contentSection} ref={scrollRef}>
        <div className={css.tabHeading}>
          <span data-tooltip-id="conditionalExecutionBuildStage">
            {getString('pipeline.conditionalExecution.title')}
            <HarnessDocTooltip tooltipId="conditionalExecutionBuildStage" useStandAlone={true} />
          </span>
        </div>
        {!!stage && (
          <Card className={css.sectionCard} id="conditionalExecution">
            <Layout.Horizontal>
              <div className={css.stageSection}>
                <div className={cx(css.stageCreate, css.stageDetails)}>
                  <ConditionalExecution
                    isReadonly={isReadonly}
                    selectedStage={stage}
                    onUpdate={when => {
                      const { stage: pipelineStage } = getStageFromPipeline<BuildStageElementConfig>(
                        selectedStageId || ''
                      )
                      if (pipelineStage && pipelineStage.stage) {
                        const stageData = produce(pipelineStage, draft => {
                          set(draft, 'stage.when', when)
                        })

                        if (stageData.stage) updateStage(stageData.stage)
                      }
                    }}
                  />
                </div>
              </div>
            </Layout.Horizontal>
          </Card>
        )}
        <div className={css.tabHeading}>
          <span data-tooltip-id="failureStrategyBuildStage">
            {getString('pipeline.failureStrategies.title')}
            <HarnessDocTooltip tooltipId="failureStrategyBuildStage" useStandAlone={true} />
          </span>
        </div>
        <Card className={css.sectionCard} id="failureStrategy">
          <Layout.Horizontal>
            <div className={css.stageSection}>
              <div className={cx(css.stageCreate, css.stageDetails)}>
                <FailureStrategyWithRef
                  selectedStage={stage}
                  isReadonly={isReadonly}
                  ref={formikRef}
                  onUpdate={({ failureStrategies }) => {
                    const { stage: pipelineStage } = getStageFromPipeline(selectedStageId || '')
                    if (pipelineStage && pipelineStage.stage) {
                      const stageData = produce(pipelineStage, draft => {
                        set(draft, 'stage.failureStrategies', failureStrategies)
                      })

                      if (stageData.stage) updateStage(stageData.stage)
                    }
                  }}
                />
              </div>
            </div>
          </Layout.Horizontal>
        </Card>
        <div className={cx(css.navigationButtons)}>{children}</div>
      </div>
    </div>
  )
}

export default BuildAdvancedSpecifications
