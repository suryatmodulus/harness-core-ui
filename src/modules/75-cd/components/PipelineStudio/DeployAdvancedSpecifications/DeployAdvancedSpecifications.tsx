import React from 'react'
import { Card, Container, HarnessDocTooltip, Layout } from '@wings-software/uicore'
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
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

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
    <div className={stageCss.serviceOverrides}>
      <DeployServiceErrors />
      <div className={stageCss.contentSection} ref={scrollRef}>
        <div className={stageCss.tabHeading}>
          <span data-tooltip-id="conditionalExecutionDeployStage">
            {getString('pipeline.conditionalExecution.title')}
            <HarnessDocTooltip tooltipId="conditionalExecutionDeployStage" useStandAlone={true} />
          </span>
        </div>

        {!!stage && (
          <Card className={stageCss.sectionCard} id="conditionalExecution">
            <Layout.Horizontal>
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
            </Layout.Horizontal>
          </Card>
        )}
        <div className={stageCss.tabHeading}>
          <span data-tooltip-id="failureStrategyDeployStage">
            {getString('pipeline.failureStrategies.title')}
            <HarnessDocTooltip tooltipId="failureStrategyDeployStage" useStandAlone={true} />
          </span>
        </div>
        <Card className={stageCss.sectionCard} id="failureStrategy">
          <Layout.Horizontal>
            <div>
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
          </Layout.Horizontal>
        </Card>
        <Container margin={{ top: 'xxlarge' }}>{children}</Container>
      </div>
    </div>
  )
}

export default DeployAdvancedSpecifications
