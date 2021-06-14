import React from 'react'
import { Button, FormInput, Layout, TextInput, Text, Color } from '@wings-software/uicore'
import { Formik } from 'formik'
import cx from 'classnames'

import {
  useAddHarnessApprovalActivity,
  ApprovalInstanceResponse,
  HarnessApprovalActivityRequest,
  HarnessApprovalInstanceDetails,
  ResponseHarnessApprovalInstanceAuthorization,
  ResponseApprovalInstanceResponse
} from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'
import { StepDetails } from '../../Common/StepDetails/StepDetails'
import { HarnessApprover } from './HarnessApprover'
import css from '../ApprovalStepDetails.module.scss'

export interface HarnessApprovalProps {
  approvalInstanceId: string
  approvalData: ApprovalInstanceResponse & {
    details: HarnessApprovalInstanceDetails
  }
  isWaiting: boolean
  updateState(data: ResponseApprovalInstanceResponse): void
  authData: ResponseHarnessApprovalInstanceAuthorization | null
  stepParameters?: { [key: string]: { [key: string]: any } }
}

export function HarnessApproval(props: HarnessApprovalProps): React.ReactElement {
  const { approvalData, approvalInstanceId, isWaiting, updateState, authData } = props

  const { mutate: submitApproval, loading: submitting } = useAddHarnessApprovalActivity({ approvalInstanceId })
  const action = React.useRef<HarnessApprovalActivityRequest['action']>('APPROVE')
  const isCurrentUserAuthorized = !!authData?.data?.authorized
  const currentUserUnAuthorizedReason = authData?.data?.reason
  const isWaitingAll = isWaiting && isExecutionWaiting(approvalData.status)

  async function handleSubmit(data: HarnessApprovalActivityRequest): Promise<void> {
    const newState = await submitApproval({ ...data, action: action.current })
    updateState(newState)
  }

  const { getString } = useStrings()

  return (
    <React.Fragment>
      {isWaitingAll ? (
        <React.Fragment>
          <div className={css.info} data-type="harness">
            <div className={css.infoHeader}>
              <String
                tagName="div"
                className={css.statusMsg}
                stringID="execution.approvals.statusMsg"
                vars={{
                  count: approvalData.details.approvalActivities?.length || 0,
                  total: approvalData.details.approvers?.minimumCount || 1
                }}
              />
              {isWaiting ? (
                <div className={css.timer}>
                  <Duration
                    className={css.duration}
                    durationText=""
                    icon="hourglass"
                    startTime={approvalData.deadline}
                    iconProps={{ size: 12 }}
                  />
                  <String stringID="execution.approvals.timeRemainingSuffix" />
                </div>
              ) : null}
            </div>
            <div className={css.reviewMsg}>{approvalData.details.approvalMessage}</div>
          </div>
        </React.Fragment>
      ) : (
        <StepDetails
          step={{
            startTs: approvalData.createdAt,
            endTs: approvalData.lastModifiedAt,
            stepParameters: props.stepParameters
          }}
        />
      )}
      <div className={cx(css.harnessApproval, { [css.completed]: !isWaitingAll })}>
        {Array.isArray(approvalData.details.approvalActivities) &&
        approvalData.details.approvalActivities.length > 0 ? (
          <React.Fragment>
            <String
              className={css.approversHeading}
              tagName="div"
              stringID="pipeline.approvalStep.approversWithColon"
            />
            {approvalData.details.approvalActivities.map((row, i) => (
              <HarnessApprover key={i} approvalActivity={row} />
            ))}
          </React.Fragment>
        ) : null}
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

                  {Array.isArray(values.approverInputs) && values.approverInputs.length > 0 ? (
                    <React.Fragment>
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
                    </React.Fragment>
                  ) : null}
                  <FormInput.TextArea label="Comments" name="comments" disabled={submitting} className={css.heading} />
                  <div className={css.actions}>
                    <Button icon="tick" intent="primary" onClick={handleApproveClick} disabled={submitting}>
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
        {isWaiting && isExecutionWaiting(approvalData.status) && !isCurrentUserAuthorized ? (
          <Layout.Vertical padding={{ top: 'medium', bottom: 'medium', left: 'large', right: 'large' }}>
            <Text color={Color.ORANGE_700} font={{ align: 'center' }}>
              {currentUserUnAuthorizedReason
                ? currentUserUnAuthorizedReason
                : approvalData.details.approvers.disallowPipelineExecutor
                ? getString('pipeline.approvalStep.disallowedApproverExecution')
                : getString('pipeline.approvalStep.notAuthorizedExecution')}
            </Text>
          </Layout.Vertical>
        ) : null}
      </div>
    </React.Fragment>
  )
}
