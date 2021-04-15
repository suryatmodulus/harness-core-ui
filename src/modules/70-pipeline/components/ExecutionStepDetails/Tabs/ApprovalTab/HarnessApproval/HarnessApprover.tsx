import React from 'react'
import { Button, Icon } from '@wings-software/uicore'
import { Collapse, IconName } from '@blueprintjs/core'
import cx from 'classnames'

import type { HarnessApprovalActivity } from 'services/pipeline-ng'
import { String, StringKeys } from 'framework/exports'

import css from '../ApprovalStepDetails.module.scss'

const iconMap: Record<HarnessApprovalActivity['action'], IconName> = {
  APPROVE: 'tick',
  REJECT: 'cross'
}

export interface HarnessApproverProps {
  approvalActivity: HarnessApprovalActivity
}

export function HarnessApprover(props: HarnessApproverProps): React.ReactElement {
  const { approvalActivity } = props
  const [expanded, setExpanded] = React.useState(false)

  function toggle(): void {
    setExpanded(status => !status)
  }

  return (
    <div className={css.approver}>
      <div className={css.summary}>
        <div className={css.approverName}>{approvalActivity.user?.name}</div>
        <div className={css.status} data-status={approvalActivity.action}>
          <Icon name={iconMap[approvalActivity.action]} size={12} />
          <String
            stringID={
              `pipeline.approvalStep.status.${approvalActivity.action}` as StringKeys /* TODO: fix this properly */
            }
          />
        </div>
        <div>{approvalActivity.approvedAt ? new Date(approvalActivity.approvedAt).toLocaleString() : '-'}</div>
        <Button
          icon="chevron-down"
          minimal
          small
          className={cx(css.toggle, { [css.open]: expanded })}
          onClick={toggle}
        />
      </div>
      <Collapse isOpen={expanded}>
        <div className={css.details}>
          <String tagName="div" className={css.label} stringID="inputs" />
          <ul className={css.approverInputs}>
            {(approvalActivity.approverInputs || []).map((row, i) => (
              <li key={i}>
                <span>{row.name}:</span>
                <span>{row.value}</span>
              </li>
            ))}
          </ul>
          <String tagName="div" className={css.label} stringID="common.comments" />
          <div className={css.comments}>{approvalActivity.comments || '-'}</div>
        </div>
      </Collapse>
    </div>
  )
}
