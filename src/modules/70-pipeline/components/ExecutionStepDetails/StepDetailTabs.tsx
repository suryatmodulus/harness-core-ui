import React from 'react'
import { Tabs } from '@blueprintjs/core'

import type { ExecutionNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/exports'
import { isExecutionWaiting, isExecutionSuccess, isExecutionFailed } from '@pipeline/utils/statusHelpers'
import { isApprovalStep } from '@pipeline/utils/stepUtils'

import { ApprovalTab } from './Tabs/ApprovalTab/ApprovalTab'
import ExecutionStepDetailsTab from './Tabs/ExecutionStepDetailsTab/ExecutionStepDetailsTab'
import ExecutionStepInputOutputTab from './Tabs/ExecutionStepInputOutputTab/ExecutionStepInputOutputTab'
import { ManualInterventionTab } from './Tabs/ManualInterventionTab/ManualInterventionTab'

import css from './ExecutionStepDetails.module.scss'

enum StepDetailTab {
  APPROVAL = 'APPROVAL',
  STEP_DETAILS = 'STEP_DETAILS',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION'
}

export interface StepDetailTabs {
  step: ExecutionNode
}

export function StepDetailTabs(props: StepDetailTabs): React.ReactElement {
  const { step } = props
  const { getString } = useStrings()
  const isApproval = isApprovalStep(step.stepType)
  const isWaiting = isExecutionWaiting(step.status)
  const shouldShowApproval = isWaiting || isExecutionSuccess(step.status) || isExecutionFailed(step.status)
  const isManaulInterruption = isWaiting && !isApproval

  return (
    <Tabs
      id="step-details"
      className={css.tabs}
      defaultSelectedTabId={isManaulInterruption ? StepDetailTab.MANUAL_INTERVENTION : undefined}
      renderActiveTabPanelOnly
    >
      {isApproval && shouldShowApproval ? (
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
      <Tabs.Tab
        id={StepDetailTab.INPUT}
        title="Input"
        panel={
          <ExecutionStepInputOutputTab baseFqn={step.baseFqn} mode="input" data={[(step as any).stepParameters]} />
        }
      />
      <Tabs.Tab
        id={StepDetailTab.OUTPUT}
        title="Output"
        panel={<ExecutionStepInputOutputTab baseFqn={step.baseFqn} mode="output" data={(step as any).outcomes || []} />}
      />
      {isManaulInterruption ? (
        <Tabs.Tab
          id={StepDetailTab.MANUAL_INTERVENTION}
          title={getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
          panel={<ManualInterventionTab step={step} />}
        />
      ) : null}
    </Tabs>
  )
}
