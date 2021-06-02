import React from 'react'
import { get } from 'lodash-es'
import { Tabs } from '@blueprintjs/core'

import type { ExecutionNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import {
  isExecutionSuccess,
  isExecutionWaitingForApproval,
  isExecutionWaitingForIntervention,
  isExecutionCompletedWithBadState
} from '@pipeline/utils/statusHelpers'
import { isApprovalStep } from '@pipeline/utils/stepUtils'

import { ApprovalTab } from './Tabs/ApprovalTab/ApprovalTab'
import ExecutionStepDetailsTab from './Tabs/ExecutionStepDetailsTab/ExecutionStepDetailsTab'
import ExecutionStepInputOutputTab from './Tabs/ExecutionStepInputOutputTab/ExecutionStepInputOutputTab'
import { ManualInterventionTab } from './Tabs/ManualInterventionTab/ManualInterventionTab'
import { PipelineDetailsTab } from './Tabs/PipelineDetailsTab/PipelineDetailsTab'

import css from './ExecutionStepDetails.module.scss'

enum StepDetailTab {
  APPROVAL = 'APPROVAL',
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
  PIPELINE_DETAILS = 'PIPELINE_DETAILS'
}

export interface StepDetailTabs {
  step: ExecutionNode
}

export function StepDetailTabs(props: StepDetailTabs): React.ReactElement {
  const { step } = props
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = React.useState(StepDetailTab.STEP_DETAILS)
  const manuallySelected = React.useRef(false)
  const isWaitingOnApproval = isExecutionWaitingForApproval(step.status)
  const isApproval = isApprovalStep(step.stepType)
  const shouldShowApproval =
    isApproval &&
    (isWaitingOnApproval || isExecutionSuccess(step.status) || isExecutionCompletedWithBadState(step.status))
  const isApprovalInstanceCreated = get(step, 'executableResponses[0].async.callbackIds[0]')
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)

  React.useEffect(() => {
    if (!manuallySelected.current) {
      if (isManualInterruption) {
        setActiveTab(StepDetailTab.MANUAL_INTERVENTION)
      } else if (isApproval && shouldShowApproval) {
        setActiveTab(StepDetailTab.APPROVAL)
      } else {
        setActiveTab(StepDetailTab.STEP_DETAILS)
      }
    }
  }, [step, isManualInterruption, shouldShowApproval, isApproval])

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
      {isApproval && shouldShowApproval && isApprovalInstanceCreated ? (
        <Tabs.Tab
          id={StepDetailTab.APPROVAL}
          title={getString('approvalStage.title')}
          panel={<ApprovalTab step={step} />}
        />
      ) : (
        <Tabs.Tab
          id={StepDetailTab.STEP_DETAILS}
          title={getString('details')}
          panel={<ExecutionStepDetailsTab step={step} />}
        />
      )}
      {isApproval && shouldShowApproval ? (
        <Tabs.Tab
          id={StepDetailTab.PIPELINE_DETAILS}
          title={getString('common.pipelineDetails')}
          panel={<PipelineDetailsTab />}
        />
      ) : null}
      <Tabs.Tab
        id={StepDetailTab.INPUT}
        title={getString('common.input')}
        panel={<ExecutionStepInputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
      />
      <Tabs.Tab
        id={StepDetailTab.OUTPUT}
        title={getString('outputLabel')}
        panel={<ExecutionStepInputOutputTab baseFqn={step.baseFqn} mode="output" data={step.outcomes} />}
      />
      {isManualInterruption ? (
        <Tabs.Tab
          id={StepDetailTab.MANUAL_INTERVENTION}
          title={getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
          panel={<ManualInterventionTab step={step} />}
        />
      ) : null}
    </Tabs>
  )
}
