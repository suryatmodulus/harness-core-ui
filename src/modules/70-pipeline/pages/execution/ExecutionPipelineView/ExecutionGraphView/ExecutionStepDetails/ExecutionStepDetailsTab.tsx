import React from 'react'
import moment from 'moment'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { timeToDisplayText, Text, Layout, Color } from '@wings-software/uicore'
import type { ExecutionNode } from 'services/cd-ng'
import { String, useStrings } from 'framework/exports'
import routes from '@common/RouteDefinitions'
import type { ExecutionPathParams } from '@pipeline/utils/executionUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { LogsContent } from '@pipeline/components/LogsContent/LogsContent'
import { isExecutionFailed, isExecutionSkipped } from '@pipeline/utils/statusHelpers'
import { useDelegateSelectionLogsModal } from '@common/components/DelegateSelectionLogs/DelegateSelectionLogs'
import LogsContentOld from '../../ExecutionLogView/LogsContent'
import css from './ExecutionStepDetails.module.scss'

const DATE_FORMAT = 'MM/DD/YYYY hh:mm:ss a'

export interface ExecutionStepDetailsTabProps {
  step: ExecutionNode
}

export default function ExecutionStepDetailsTab(props: ExecutionStepDetailsTabProps): React.ReactElement {
  const { step } = props

  const { orgIdentifier, executionIdentifier, pipelineIdentifier, projectIdentifier, accountId, module } = useParams<
    PipelineType<ExecutionPathParams>
  >()

  const { getString } = useStrings()
  const history = useHistory()
  const logUrl = routes.toExecutionPipelineView({
    orgIdentifier,
    executionIdentifier,
    pipelineIdentifier,
    projectIdentifier,
    accountId,
    module
  })

  const redirectToLogView = (): void => {
    history.push(`${logUrl}?view=log`)
  }

  const errorMessage = step?.failureInfo?.errorMessage || step.executableResponses?.[0]?.skipTask?.message
  const isFailed = isExecutionFailed(step.status)
  const isSkipped = isExecutionSkipped(step.status)
  const { openDelegateSelectionLogsModal } = useDelegateSelectionLogsModal()
  const taskIds: string[] =
    step.executableResponses?.map(taskChain => taskChain?.task?.taskId || taskChain.taskChain?.taskId || '') || []

  return (
    <div className={css.detailsTab}>
      {errorMessage ? (
        <div className={cx(css.errorMsg, { [css.error]: isFailed, [css.warn]: isSkipped })}>
          <String className={css.title} stringID="errorSummaryText" tagName="div" />
          <p>{errorMessage}</p>
        </div>
      ) : null}
      <table className={css.detailsTable}>
        <tbody>
          <tr>
            <th>{getString('startedAt')}</th>
            <td>{step?.startTs ? moment(step?.startTs).format(DATE_FORMAT) : '-'}</td>
          </tr>
          <tr>
            <th>{getString('endedAt')}</th>
            <td>{step?.endTs ? moment(step?.endTs).format(DATE_FORMAT) : '-'}</td>
          </tr>
          {step?.startTs && step?.endTs && (
            <tr>
              <th>{getString('duration')}</th>
              <td>{timeToDisplayText(step.endTs - step.startTs)}</td>
            </tr>
          )}
          {step.delegateInfoList && step.delegateInfoList.length > 0 && (
            <tr className={css.delegateRow}>
              <th>{getString('delegateLabel')}</th>
              <td>
                <Layout.Vertical spacing="xsmall">
                  {step.delegateInfoList.map((item, index) => (
                    <div key={`${item.id}-${index}`}>
                      <Text>{item.name}</Text> (
                      <Text
                        onClick={() => openDelegateSelectionLogsModal(taskIds)}
                        style={{ cursor: 'pointer' }}
                        color={Color.BLUE_500}
                      >
                        {getString('delegateSelectionLogs')}
                      </Text>
                      )
                    </div>
                  ))}
                </Layout.Vertical>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {module === 'cd' ? (
        <LogsContent mode="step-details" toConsoleView={`${logUrl}?view=log`} />
      ) : (
        <LogsContentOld header={getString('execution.stepLogs')} redirectToLogView={redirectToLogView} />
      )}
    </div>
  )
}
