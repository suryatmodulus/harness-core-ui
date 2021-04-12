import React from 'react'

import type { ApprovalInstanceResponse, JiraApprovalInstanceDetails } from 'services/pipeline-ng'
import { Duration } from '@common/exports'
import { String } from 'framework/exports'

export interface JiraApprovalProps {
  approvalData: ApprovalInstanceResponse & {
    details: JiraApprovalInstanceDetails
  }
  isWaiting: boolean
}

import { JiraCriteria } from './JiraCriteria'
import css from '../ApprovalStepDetails.module.scss'

export function JiraApproval(props: JiraApprovalProps): React.ReactElement {
  const { approvalData, isWaiting } = props

  return (
    <React.Fragment>
      <div className={css.info} data-type="jira">
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
        {approvalData.details?.issue ? (
          <div className={css.jiraTicket}>
            <String stringID="execution.approvals.jiraTicket" />
            <a href={approvalData.details.issue.url} target="_blank" rel="noopener noreferrer">
              {approvalData.details.issue.key}
            </a>
          </div>
        ) : null}
      </div>
      <div className={css.jiraApproval}>
        {approvalData.details?.approvalCriteria ? (
          <JiraCriteria type="approval" criteria={approvalData.details.approvalCriteria} />
        ) : null}
        {approvalData.details?.rejectionCriteria ? (
          <JiraCriteria type="rejection" criteria={approvalData.details.rejectionCriteria} />
        ) : null}
      </div>
    </React.Fragment>
  )
}
