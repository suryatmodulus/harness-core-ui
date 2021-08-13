import React from 'react'
import { Card, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { produce } from 'immer'
import { set } from 'lodash-es'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { FailureStrategyWithRef } from '@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy'
import type { StepFormikRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import ConditionalExecution from '@pipeline/components/PipelineStudio/ConditionalExecution/ConditionalExecution'
import { useStrings } from 'framework/strings'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import css from './DeployAdvancedSpecifications.module.scss'

export interface AdvancedSpecifications {
  context?: string
}
const DeployAdvancedSpecifications: React.FC<AdvancedSpecifications> = ({ children }): JSX.Element => {
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
  const { submitFormsForTab } = React.useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()

  React.useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.ADVANCED)
    }
  }, [errorMap])

  return (
    <>
      <DeployServiceErrors />
      <div className={cx(css.stageSection, css.editStageGrid)}>
        <div className={css.contentSection} ref={scrollRef}>
          <div className={css.tabHeading}>{getString('pipeline.conditionalExecution.title')}</div>
          {!!stage && (
            <Card className={cx(css.sectionCard, css.shadow)} id="conditionalExecution">
              <Layout.Horizontal>
                <div className={css.stageSection}>
                  <div className={cx(css.stageCreate, css.stageDetails)}>
                    <ConditionalExecution
                      isReadonly={isReadonly}
                      selectedStage={stage}
                      onUpdate={when => {
                        const { stage: pipelineStage } = getStageFromPipeline(selectedStageId || '')
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
          <div className={css.tabHeading}>Failure Strategy</div>
          <Card className={cx(css.sectionCard, css.shadow)} id="failureStrategy">
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
                    tabName={DeployTabs.ADVANCED}
                  />
                </div>
              </div>
            </Layout.Horizontal>
          </Card>
          <div className={cx(css.navigationButtons)}>{children}</div>
        </div>
      </div>
    </>
  )
}

export default DeployAdvancedSpecifications
