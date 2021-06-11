import React from 'react'
import { get } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import cx from 'classnames'
import { Layout } from '@wings-software/uicore'

import type { ExecutionNode, ResponseHarnessApprovalInstanceAuthorization } from 'services/pipeline-ng'
import {
  useGetApprovalInstance,
  useGetHarnessApprovalInstanceAuthorization,
  ResponseApprovalInstanceResponse
} from 'services/pipeline-ng'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useGlobalEventListener, useDeepCompareEffect } from '@common/hooks'
import { PageError } from '@common/components/Page/PageError'
import { isHarnessApproval } from '@pipeline/utils/stepUtils'

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
  getApprovalAuthorizationMock?: {
    loading: boolean
    data: ResponseHarnessApprovalInstanceAuthorization
  }
}

export function ApprovalTab(props: ApprovalTabProps): React.ReactElement | null {
  const { step, mock, getApprovalAuthorizationMock } = props
  const approvalInstanceId = get(step, 'executableResponses[0].async.callbackIds[0]') || ''
  const isWaiting = isExecutionWaiting(step.status)

  // store the data in state because the approve/reject call returns the updated state
  // hence we can save one additional call to the server
  const [approvalData, setApprovalData] = React.useState<ResponseApprovalInstanceResponse | null>(null)

  const { data, refetch, loading: loadingApprovalData, error } = useGetApprovalInstance({
    approvalInstanceId,
    mock
  })

  const {
    data: authData,
    loading: loadingAuthData,
    refetch: refetchAuthData
  } = useGetHarnessApprovalInstanceAuthorization({
    approvalInstanceId,
    lazy: !(isHarnessApproval(step.stepType) && isWaiting),
    mock: getApprovalAuthorizationMock
  })

  useDeepCompareEffect(() => {
    setApprovalData(data)
  }, [data])

  useGlobalEventListener(REFRESH_APPROVAL, () => {
    refetch()
  })

  if (loadingApprovalData || loadingAuthData)
    return (
      <Layout.Vertical height="100%" flex={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </Layout.Vertical>
    )

  return (
    <div className={cx(css.approvalTab, { [css.error]: error })}>
      {error ? (
        <PageError message={(error.data as Error)?.message || error.message} />
      ) : (
        <React.Fragment>
          {approvalData?.data && step.stepType === StepType.HarnessApproval ? (
            <HarnessApproval
              approvalData={approvalData.data as HarnessApprovalProps['approvalData']}
              approvalInstanceId={approvalInstanceId}
              isWaiting={isWaiting}
              updateState={updatedData => {
                setApprovalData(updatedData)
                refetchAuthData()
              }}
              authData={authData}
              stepParameters={step.stepParameters}
            />
          ) : null}
          {approvalData?.data && step.stepType === StepType.JiraApproval ? (
            <JiraApproval approvalData={approvalData.data as JiraApprovalProps['approvalData']} isWaiting={isWaiting} />
          ) : null}
        </React.Fragment>
      )}
    </div>
  )
}
