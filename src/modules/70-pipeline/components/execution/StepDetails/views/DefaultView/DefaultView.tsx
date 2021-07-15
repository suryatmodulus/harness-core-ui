import React from 'react'
import { merge } from 'lodash-es'
import { Tabs } from '@blueprintjs/core'

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
    <Tabs
      id="step-details"
      className={css.tabs}
      selectedTabId={activeTab}
      onChange={newTab => {
        manuallySelected.current = true
        setActiveTab(newTab as StepDetailTab)
      }}
      renderActiveTabPanelOnly
    >
      <Tabs.Tab id={StepDetailTab.STEP_DETAILS} title={getString('details')} panel={<StepDetailsTab step={step} />} />
      {shouldShowInputOutput && (
        <Tabs.Tab
          id={StepDetailTab.INPUT}
          title={getString('common.input')}
          panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
        />
      )}
      {shouldShowInputOutput && (
        <Tabs.Tab
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
        <Tabs.Tab
          id={StepDetailTab.MANUAL_INTERVENTION}
          title={getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
          panel={<ManualInterventionTab step={step} allowedStrategies={failureStrategies} />}
        />
      ) : null}
    </Tabs>
  )
}
