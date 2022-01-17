/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Container, HarnessDocTooltip, Layout } from '@wings-software/uicore'
import { produce } from 'immer'
import { set, isEmpty } from 'lodash-es'
import { StepActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
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
  } = usePipelineContext()
  const { stage } = getStageFromPipeline(selectedStageId || '')

  const formikRef = React.useRef<StepFormikRef | null>(null)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const { submitFormsForTab } = React.useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()
  const { trackEvent } = useTelemetry()

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
                    if (stageData.stage) {
                      updateStage(stageData.stage)
                      const errors = formikRef.current?.getErrors()
                      if (isEmpty(errors)) {
                        const telemetryData = failureStrategies.map(strategy => ({
                          onError: strategy.onFailure?.errors?.join(', '),
                          action: strategy.onFailure?.action?.type
                        }))
                        telemetryData.length &&
                          trackEvent(StepActions.AddEditFailureStrategy, { data: JSON.stringify(telemetryData) })
                      }
                    }
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
