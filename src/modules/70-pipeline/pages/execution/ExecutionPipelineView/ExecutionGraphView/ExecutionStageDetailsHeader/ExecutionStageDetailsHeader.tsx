import React from 'react'
import { defaultTo, find } from 'lodash-es'

import { useParams } from 'react-router'
import { String as StrTemplate } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { StageDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import factory from '@pipeline/factories/ExecutionFactory'
import type { StageType } from '@pipeline/utils/stageHelpers'
import { Duration } from '@common/components/Duration/Duration'
import { ExecutionStatus, isExecutionFailed } from '@pipeline/utils/statusHelpers'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'

import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { usePermission } from '@rbac/hooks/usePermission'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './ExecutionStageDetailsHeader.module.scss'

export function ExecutionStageDetailsHeader(): React.ReactElement {
  const { selectedStageId, pipelineStagesMap, refetch, pipelineExecutionDetail, allNodeMap } = useExecutionContext()
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, pipelineIdentifier, module } =
    useParams<PipelineType<ExecutionPathProps>>()
  const stage = pipelineStagesMap.get(selectedStageId)
  const stageDetail = factory.getStageDetails(stage?.nodeType as StageType)
  const shouldShowError = isExecutionFailed(stage?.status)
  const errorMessage = defaultTo(stage?.failureInfo?.message, '')

  const [canEdit, canExecute] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier as string
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [orgIdentifier, projectIdentifier, accountId, pipelineIdentifier]
  )
  const stageNode = find(allNodeMap, node => node.setupId === selectedStageId)

  return (
    <div className={css.main}>
      <div className={css.stageDetails}>
        <div className={css.lhs} data-has-sibling={Boolean(stage && stageDetail?.component)}>
          <div className={css.stageTop}>
            <div className={css.stageName}>{stage?.name}</div>
            <ExecutionActions
              executionStatus={stageNode?.status as ExecutionStatus}
              refetch={refetch}
              params={{
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                accountId,
                executionIdentifier,
                module,
                repoIdentifier: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoIdentifier,
                branch: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch
              }}
              noMenu
              stageName={stageNode?.name}
              stageId={stageNode?.uuid}
              canEdit={canEdit}
              canExecute={canExecute}
            />
          </div>
          <div className={css.times}>
            {stage?.startTs ? (
              <>
                <div className={css.timeDisplay}>
                  <StrTemplate stringID="startedAt" className={css.timeLabel} />
                  <span>:&nbsp;</span>
                  <time>{stage?.startTs ? new Date(stage?.startTs).toLocaleString() : '-'}</time>
                </div>
                <Duration
                  className={css.timeDisplay}
                  durationText={<StrTemplate stringID="common.durationPrefix" className={css.timeLabel} />}
                  startTime={stage?.startTs}
                  endTime={stage?.endTs}
                />
              </>
            ) : null}
          </div>
          {/* <StrTemplate className={css.moreInfo} stringID="common.moreInfo" /> */}
        </div>
        <div>
          {stage && stageDetail?.component
            ? React.createElement<StageDetailProps>(stageDetail.component, {
                stage
              })
            : null}
        </div>
      </div>

      {shouldShowError ? (
        <div className={css.errorMsgWrapper}>
          <ExecutionStatusLabel status={stage?.status as ExecutionStatus} />
          <div className={css.errorMsg}>
            <StrTemplate className={css.errorTitle} stringID="errorSummaryText" tagName="div" />
            <p>{errorMessage}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
