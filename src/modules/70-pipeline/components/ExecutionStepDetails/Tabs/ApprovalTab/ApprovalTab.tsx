import React from 'react'
import { get } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'

import type { ExecutionNode } from 'services/pipeline-ng'
import { useGetApprovalInstance, ResponseApprovalInstanceResponse } from 'services/pipeline-ng'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useGlobalEventListener, useDeepCompareEffect } from '@common/hooks'

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
  mock?: {
    data?: ResponseApprovalInstanceResponse
    loading?: boolean
  }
  getApprovalAuthorizationMock?: HarnessApprovalProps['getApprovalAuthorizationMock']
}

export function ApprovalTab(props: ApprovalTabProps): React.ReactElement | null {
  const { step, mock, getApprovalAuthorizationMock } = props
  const approvalInstanceId = get(step, 'executableResponses[0].async.callbackIds[0]') || ''
  const isWaiting = isExecutionWaiting(step.status)

  // store the data in state because the approve/reject call returns the updated state
  // hence we can save one additional call to the server
  const [approvalData, setApprovalData] = React.useState<ResponseApprovalInstanceResponse | null>(null)

  const { data, refetch, loading } = useGetApprovalInstance({
    approvalInstanceId,
    mock
  })

  useDeepCompareEffect(() => {
    setApprovalData(data)
  }, [data])

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
          updateState={setApprovalData}
          getApprovalAuthorizationMock={getApprovalAuthorizationMock}
          showSpinner={loading}
        />
      ) : null}
      {step.stepType === StepType.JiraApproval ? (
        <JiraApproval approvalData={approvalData.data as JiraApprovalProps['approvalData']} isWaiting={isWaiting} />
      ) : null}
    </div>
  )
}
