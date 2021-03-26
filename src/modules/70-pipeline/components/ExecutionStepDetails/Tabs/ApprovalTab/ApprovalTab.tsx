import React from 'react'
import { get } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'

import type { ExecutionNode } from 'services/cd-ng'
import { useGetApprovalInstance } from 'services/pipeline-ng'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useGlobalEventListener } from '@common/hooks'

import { HarnessApproval, HarnessApprovalProps } from './HarnessApproval/HarnessApproval'
import { JiraApproval, JiraApprovalProps } from './JiraApproval/JiraApproval'

import css from './ApprovalStepDetails.module.scss'

export const REFRESH_APPROVAL = 'REFRESH_APPROVAL'

// add custom event to the global scope
declare global {
  interface WindowEventMap {
    REFRESH_APPROVAL: Event
  }
}

export interface ApprovalTabProps {
  step: ExecutionNode
}

export function ApprovalTab(props: ApprovalTabProps): React.ReactElement | null {
  const { step } = props
  const approvalInstanceId = get(step, 'executableResponses[0].async.callbackIds[0]') || ''
  const isWaiting = isExecutionWaiting(step.status)

  const { data: approvalData, refetch, loading } = useGetApprovalInstance({
    approvalInstanceId
  })

  useGlobalEventListener(REFRESH_APPROVAL, () => {
    refetch()
  })

  if (loading) return <Spinner />

  if (!approvalData || !approvalData.data) return null

  return (
    <div className={css.approvalTab}>
      {step.stepType === StepType.HarnessApproval ? (
        <HarnessApproval
          approvalData={approvalData.data as HarnessApprovalProps['approvalData']}
          approvalInstanceId={approvalInstanceId}
          isWaiting={isWaiting}
        />
      ) : null}
      {step.stepType === StepType.JiraApproval ? (
        <JiraApproval approvalData={approvalData.data as JiraApprovalProps['approvalData']} isWaiting={isWaiting} />
      ) : null}
    </div>
  )
}
