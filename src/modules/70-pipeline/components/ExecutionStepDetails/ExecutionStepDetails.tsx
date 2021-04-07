import React from 'react'
import { Button } from '@wings-software/uicore'
import cx from 'classnames'

import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import ExecutionLayout from '@pipeline/components/ExecutionLayout/ExecutionLayout'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'
import { isApprovalStep, isHarnessApproval } from '@pipeline/utils/stepUtils'

import { REFRESH_APPROVAL } from './Tabs/ApprovalTab/ApprovalTab'
import { StepDetailTabs } from './StepDetailTabs'
import css from './ExecutionStepDetails.module.scss'

export interface ExecutionStepDetailsProps {
  selectedStep: string
  closeDetails(): void
}

export default function ExecutionStepDetails(props: ExecutionStepDetailsProps): React.ReactElement {
  const { selectedStep, closeDetails } = props
  const { allNodeMap } = useExecutionContext()

  const step = allNodeMap?.[selectedStep] || {}
  const isApproval = isApprovalStep(step.stepType)
  const isWaiting = isExecutionWaiting(step.status)

  function handleRefresh(): void {
    if (isApproval && isWaiting) {
      window.dispatchEvent(new CustomEvent(REFRESH_APPROVAL))
    }
  }

  return (
    <div className={css.main}>
      <div className={cx(css.header, { [css.isApproval]: isApproval && isWaiting })}>
        <div className={css.title}>Step: {step.name}</div>
        {isHarnessApproval(step.stepType) && isWaiting ? (
          <Button minimal small intent="primary" onClick={handleRefresh}>
            Refresh
          </Button>
        ) : null}
        <div className={css.actions}>
          <ExecutionLayout.Toggle />
          <Button minimal icon="cross" onClick={closeDetails} />
        </div>
      </div>
      <StepDetailTabs step={step} />
    </div>
  )
}
