import React from 'react'
import moment from 'moment'
import { Button, Color, FormInput, Layout, Text, TextInput } from '@wings-software/uicore'
import { Formik } from 'formik'
import cx from 'classnames'
import { Spinner } from '@blueprintjs/core'

import {
  useGetHarnessApprovalInstanceAuthorization,
  useAddHarnessApprovalActivity,
  ApprovalInstanceResponse,
  HarnessApprovalActivityRequest,
  HarnessApprovalInstanceDetails,
  ResponseHarnessApprovalInstanceAuthorization,
  ResponseApprovalInstanceResponse
} from 'services/pipeline-ng'
import { String } from 'framework/exports'
import { Duration } from '@common/exports'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'
import { DEFAULT_DATE_FORMAT } from '@common/utils/StringUtils'
import { HarnessApprover } from './HarnessApprover'
import css from '../ApprovalStepDetails.module.scss'

export interface HarnessApprovalProps {
  approvalInstanceId: string
  approvalData: ApprovalInstanceResponse & {
    details: HarnessApprovalInstanceDetails
  }
  isWaiting: boolean
  updateState(data: ResponseApprovalInstanceResponse): void
  getApprovalAuthorizationMock?: {
    loading: boolean
    data: ResponseHarnessApprovalInstanceAuthorization
  }
  showSpinner?: boolean
}

export function HarnessApproval(props: HarnessApprovalProps): React.ReactElement {
  const { approvalData, approvalInstanceId, isWaiting, updateState, getApprovalAuthorizationMock, showSpinner } = props

  const { data: authData, loading } = useGetHarnessApprovalInstanceAuthorization({
    approvalInstanceId,
    lazy: !isWaiting,
    mock: getApprovalAuthorizationMock
  })
  const { mutate: submitApproval, loading: submitting } = useAddHarnessApprovalActivity({ approvalInstanceId })
  const action = React.useRef<HarnessApprovalActivityRequest['action']>('APPROVE')
  const isCurrentUserAuthorized = !!authData?.data?.authorized

  async function handleSubmit(data: HarnessApprovalActivityRequest): Promise<void> {
    const newState = await submitApproval({ ...data, action: action.current })
    updateState(newState)
  }

  if (loading || showSpinner) return <Spinner />

  return (
    <React.Fragment>
      {isWaiting && isExecutionWaiting(approvalData.status) ? (
        <div className={css.info} data-type="harness">
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
          <div className={css.reviewMsg}>{approvalData.details.approvalMessage}</div>
          <String
            tagName="div"
            stringID="execution.approvals.statusMsg"
            vars={{
              count: approvalData.details.approvalActivities?.length || 0,
              total: approvalData.details.approvers?.minimumCount || 1
            }}
          />
        </div>
      ) : (
        <Layout.Vertical className={css.harnessApproval} spacing="large" padding="large">
          <Layout.Horizontal spacing="large">
            <Text>
              <String stringID="startedAt" />
            </Text>
            <Text color={Color.BLACK_100}>{moment(approvalData.createdAt).format(DEFAULT_DATE_FORMAT)}</Text>
          </Layout.Horizontal>

          {approvalData.status === 'APPROVED' || approvalData.status === 'REJECTED' ? (
            <Layout.Horizontal spacing="large">
              <Text>
                <String stringID="endedAt" />
              </Text>
              <Text color={Color.BLACK_100}>{moment(approvalData.lastModifiedAt).format(DEFAULT_DATE_FORMAT)}</Text>
            </Layout.Horizontal>
          ) : null}
        </Layout.Vertical>
      )}
      <div className={css.harnessApproval}>
        <Text>
          <String stringID="pipeline.approvalStep.approvers" />:
        </Text>
        {(approvalData.details.approvalActivities || []).map((row, i) => (
          <HarnessApprover key={i} approvalActivity={row} />
        ))}
        {isWaiting && isExecutionWaiting(approvalData.status) && isCurrentUserAuthorized ? (
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
                  <div className={cx(css.formRow, css.labels)}>
                    <String stringID="variableNameLabel" />
                    <String stringID="configureOptions.defaultValue" />
                  </div>
                  {values.approverInputs?.map((row, i) => (
                    <div className={css.formRow} key={i}>
                      <TextInput name={`approverInputs[${i}].name`} value={row.name} disabled />
                      <FormInput.Text name={`approverInputs[${i}].value`} disabled={submitting} />
                    </div>
                  ))}
                  <FormInput.TextArea label="comments" name="comments" disabled={submitting} />
                  <div className={css.actions}>
                    <Button intent="primary" onClick={handleApproveClick} disabled={submitting}>
                      <String stringID="common.approve" />
                    </Button>
                    <Button icon="cross" onClick={handleRejectClick} disabled={submitting}>
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
