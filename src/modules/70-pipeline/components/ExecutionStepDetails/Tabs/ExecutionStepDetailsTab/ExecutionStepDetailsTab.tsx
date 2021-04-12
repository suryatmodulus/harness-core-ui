import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { timeToDisplayText, Text, Layout, Color } from '@wings-software/uicore'
import type { ExecutionNode } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/exports'
import routes from '@common/RouteDefinitions'
import type { ExecutionPathParams } from '@pipeline/utils/executionUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { LogsContent } from '@pipeline/components/LogsContent/LogsContent'
import { isExecutionFailed, isExecutionSkipped } from '@pipeline/utils/statusHelpers'
import { useDelegateSelectionLogsModal } from '@common/components/DelegateSelectionLogs/DelegateSelectionLogs'
import LogsContentOld from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionLogView/LogsContent'

import css from './ExecutionStepDetailsTab.module.scss'

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

  const errorMessage = step?.failureInfo?.message || step.executableResponses?.[0]?.skipTask?.message
  const isFailed = isExecutionFailed(step.status)
  const isSkipped = isExecutionSkipped(step.status)
  const { openDelegateSelectionLogsModal } = useDelegateSelectionLogsModal()

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
            <td>{step?.startTs ? new Date(step.startTs).toLocaleString() : '-'}</td>
          </tr>
          <tr>
            <th>{getString('endedAt')}</th>
            <td>{step?.endTs ? new Date(step.endTs).toLocaleString() : '-'}</td>
          </tr>
          {step?.startTs && step?.endTs ? (
            <tr>
              <th>{getString('duration')}</th>
              <td>{timeToDisplayText(step.endTs - step.startTs)}</td>
            </tr>
          ) : null}
          {step.delegateInfoList && step.delegateInfoList.length > 0 ? (
            <tr className={css.delegateRow}>
              <th>{getString('delegateLabel')}</th>
              <td>
                <Layout.Vertical spacing="xsmall">
                  {step.delegateInfoList.map((item, index) => (
                    <div key={`${item.id}-${index}`}>
                      <Text font={{ size: 'small', weight: 'semi-bold' }}>
                        <String
                          stringID="common.delegateForTask"
                          vars={{ delegate: item.name, taskName: item.taskName }}
                          useRichText
                        />
                      </Text>{' '}
                      (
                      <Text
                        font={{ size: 'small' }}
                        onClick={() =>
                          openDelegateSelectionLogsModal([
                            {
                              taskId: item.taskId as string,
                              taskName: item.taskName as string,
                              delegateName: item.name as string
                            }
                          ])
                        }
                        style={{ cursor: 'pointer' }}
                        color={Color.BLUE_500}
                      >
                        {getString('common.logs.delegateSelectionLogs')}
                      </Text>
                      )
                    </div>
                  ))}
                </Layout.Vertical>
              </td>
            </tr>
          ) : null}
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
