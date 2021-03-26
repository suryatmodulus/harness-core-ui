import React from 'react'
import { Button, FormInput } from '@wings-software/uicore'
import { Formik } from 'formik'

import {
  useGetHarnessApprovalInstanceAuthorization,
  useAddHarnessApprovalActivity,
  ApprovalInstanceResponse,
  HarnessApprovalActivityRequest,
  HarnessApprovalInstanceDetails
} from 'services/pipeline-ng'
import { String } from 'framework/exports'
import { Duration } from '@common/exports'

import { HarnessApprover } from './HarnessApprover'
import css from '../ApprovalStepDetails.module.scss'

export interface HarnessApprovalProps {
  approvalInstanceId: string
  approvalData: ApprovalInstanceResponse & {
    details: HarnessApprovalInstanceDetails
  }
  isWaiting: boolean
}

export function HarnessApproval(props: HarnessApprovalProps): React.ReactElement {
  const { approvalData, approvalInstanceId, isWaiting } = props

  const { data: authData } = useGetHarnessApprovalInstanceAuthorization({ approvalInstanceId, lazy: !isWaiting })
  const { mutate: submitApproval } = useAddHarnessApprovalActivity({ approvalInstanceId })
  const action = React.useRef<HarnessApprovalActivityRequest['action']>('APPROVE')
  const isCurrentUserAuthorized = !!authData?.data?.authorized

  async function handleSubmit(data: HarnessApprovalActivityRequest): Promise<void> {
    await submitApproval({ ...data, action: action.current })
  }

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
        <String
          tagName="div"
          stringID="execution.approvals.statusMsg"
          vars={{
            count: approvalData.details.approvalActivities?.length || 0,
            total: approvalData.details.approvers?.minimumCount || 1
          }}
        />
      </div>
      <div className={css.harnessApproval}>
        {(approvalData.details.approvalActivities || []).map((row, i) => (
          <HarnessApprover key={i} approvalActivity={row} />
        ))}
        {isWaiting && isCurrentUserAuthorized ? (
          <Formik<HarnessApprovalActivityRequest>
            initialValues={{
              approverInputs: (approvalData.details.approverInputs || []).map(({ name, defaultValue }) => ({
                name,
                value: defaultValue || ''
              })),
              comments: '',
              action: 'APPROVE'
            }}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({ values, submitForm }) => {
              function handleApproveClick(): void {
                action.current = 'APPROVE'
                submitForm()
              }

              function handleRejectClick(): void {
                action.current = 'REJECT'
                submitForm()
              }

              return (
                <div className={css.inputs}>
                  <String tagName="div" className={css.heading} stringID="execution.approvals.inputsTitle" />
                  {values.approverInputs?.map((row, i) => (
                    <FormInput.Text key={i} label={row.name} name={`approverInputs[${i}].value`} />
                  ))}
                  <FormInput.TextArea label="comments" name="comments" />
                  <div className={css.actions}>
                    <Button intent="primary" onClick={handleApproveClick}>
                      <String stringID="common.approve" />
                    </Button>
                    <Button icon="cross" onClick={handleRejectClick}>
                      <String stringID="common.reject" />
                    </Button>
                  </div>
                </div>
              )
            }}
          </Formik>
        ) : null}
      </div>
    </React.Fragment>
  )
}
