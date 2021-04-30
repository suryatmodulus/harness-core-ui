import React from 'react'
import { Text, Layout, Color } from '@wings-software/uicore'

import { useParams, Link } from 'react-router-dom'
import { Duration } from '@common/exports'
import { useDelegateSelectionLogsModal } from '@common/components/DelegateSelectionLogs/DelegateSelectionLogs'
import type { ExecutionNode } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'

import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { encodeURIWithReservedChars } from './utils'
import css from './StepDetails.module.scss'

export interface StepDetailsProps {
  step: ExecutionNode
}

export function StepDetails(props: StepDetailsProps): React.ReactElement {
  const { step } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  //TODO - types will modified when the backend swagger docs are updated
  const deploymentTag = step?.stepParameters?.deploymentTag as any
  const serviceIdentifier = step?.stepParameters?.serviceIdentifier as any

  const { openDelegateSelectionLogsModal } = useDelegateSelectionLogsModal()

  return (
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

        <tr>
          <th>{getString('duration')}</th>
          <td>
            <Duration className={css.timer} durationText="" startTime={step?.startTs} endTime={step?.endTs} />
          </td>
        </tr>
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
                    </Text>
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
        {/* TODO - this will be moved to step level once the support is added in pipeline factory */}
        {step.stepType === StepType.Verify &&
          deploymentTag &&
          serviceIdentifier &&
          step?.status !== ExecutionStatusEnum.Queued && (
            <tr>
              <th>{getString('pipeline.verificationResult')}</th>
              <td>
                <Link
                  to={routes.toCVDeploymentPage({
                    accountId,
                    projectIdentifier,
                    orgIdentifier,
                    deploymentTag: encodeURIWithReservedChars(deploymentTag),
                    serviceIdentifier
                  })}
                  target="_blank"
                >
                  {getString('pipeline.clickHere')}
                </Link>
              </td>
            </tr>
          )}
      </tbody>
    </table>
  )
}
