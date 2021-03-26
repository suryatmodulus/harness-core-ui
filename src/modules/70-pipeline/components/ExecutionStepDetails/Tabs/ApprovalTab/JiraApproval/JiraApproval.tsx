import React from 'react'

import type { ApprovalInstanceResponse } from 'services/pipeline-ng'
import { Duration } from '@common/exports'
import { String } from 'framework/exports'

export interface JiraApprovalProps {
  approvalData: ApprovalInstanceResponse
  isWaiting: boolean
}

import css from '../ApprovalStepDetails.module.scss'

export function JiraApproval(props: JiraApprovalProps): React.ReactElement {
  const { approvalData, isWaiting } = props

  return (
    <React.Fragment>
      <div className={css.info}>
        {isWaiting ? (
          <div className={css.timer}>
            <Duration
              className={css.duration}
              durationText=""
              icon="hourglass"
              startTime={approvalData.deadline}
              iconProps={{ size: 8 }}
            />
            <String stringID="execution.approvals.timeRemainingSuffix" />
          </div>
        ) : null}
        <div className={css.reviewMsg}>{approvalData.approvalMessage}</div>
      </div>
    </React.Fragment>
  )
}
