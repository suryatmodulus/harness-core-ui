import React from 'react'
import { merge } from 'lodash-es'
import { Tabs, Tab } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { StepDetailsTab } from '@pipeline/components/execution/StepDetails/tabs/StepDetailsTab/StepDetailsTab'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'
import { ManualInterventionTab } from '@pipeline/components/execution/StepDetails/tabs/ManualInterventionTab/ManualInterventionTab'
import { Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { allowedStrategiesAsPerStep } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StepMode } from '@pipeline/utils/stepUtils'

import css from './DefaultView.module.scss'

enum StepDetailTab {
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION'
}

export function DefaultView(props: StepDetailProps): React.ReactElement {
  const { step, stageType = StageType.DEPLOY } = props
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = React.useState(StepDetailTab.STEP_DETAILS)
  const manuallySelected = React.useRef(false)
  const shouldShowInputOutput = ((step?.stepType ?? '') as string) !== 'liteEngineTask'
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const failureStrategies = allowedStrategiesAsPerStep(stageType)[StepMode.STEP].filter(
    st => st !== Strategy.ManualIntervention
  )

  React.useEffect(() => {
    if (!manuallySelected.current) {
      setActiveTab(isManualInterruption ? StepDetailTab.MANUAL_INTERVENTION : StepDetailTab.STEP_DETAILS)
    }
  }, [step.identifier, isManualInterruption])

  return (
    <div className={css.tabs}>
      <Tabs
        id="step-details"
        selectedTabId={activeTab}
        onChange={newTab => {
          manuallySelected.current = true
          setActiveTab(newTab as StepDetailTab)
        }}
        renderAllTabPanels={false}
      >
        <Tab id={StepDetailTab.STEP_DETAILS} title={getString('details')} panel={<StepDetailsTab step={step} />} />
        {shouldShowInputOutput && (
          <Tab
            id={StepDetailTab.INPUT}
            title={getString('common.input')}
            panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
          />
        )}
        {shouldShowInputOutput && (
          <Tab
            id={StepDetailTab.OUTPUT}
            title={getString('outputLabel')}
            panel={
              <InputOutputTab
                baseFqn={step.baseFqn}
                mode="output"
                data={Array.isArray(step.outcomes) ? { output: merge({}, ...step.outcomes) } : step.outcomes}
              />
            }
          />
        )}
        {isManualInterruption ? (
          <Tab
            id={StepDetailTab.MANUAL_INTERVENTION}
            title={getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
            panel={<ManualInterventionTab step={step} allowedStrategies={failureStrategies} />}
          />
        ) : null}
      </Tabs>
    </div>
  )
}
