import React from 'react'
import { Card, Icon } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { Popover } from '@blueprintjs/core'
import { defaultTo, get, isEmpty } from 'lodash-es'

import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { UserLabel, Duration, TimeAgoPopover } from '@common/exports'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { String } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ExecutionStatus, isExecutionIgnoreFailed, isExecutionNotStarted } from '@pipeline/utils/statusHelpers'
import executionFactory from '@pipeline/factories/ExecutionFactory'
import { hasCDStage, hasCIStage, StageType } from '@pipeline/utils/stageHelpers'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { CardVariant } from '@pipeline/utils/constants'

import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'

import MiniExecutionGraph from './MiniExecutionGraph/MiniExecutionGraph'
import css from './ExecutionCard.module.scss'

export interface ExecutionCardProps {
  pipelineExecution: PipelineExecutionSummary
  variant?: CardVariant
}

export default function ExecutionCard(props: ExecutionCardProps): React.ReactElement {
  const { pipelineExecution, variant = CardVariant.Default } = props
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<PipelineType<ProjectPathProps>>()
  const history = useHistory()

  const HAS_CD = hasCDStage(pipelineExecution)
  const HAS_CI = hasCIStage(pipelineExecution)
  const cdInfo = executionFactory.getCardInfo(StageType.DEPLOY)
  const ciInfo = executionFactory.getCardInfo(StageType.BUILD)

  const [canEdit, canExecute] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineExecution.pipelineIdentifier as string
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [orgIdentifier, projectIdentifier, accountId, pipelineExecution.pipelineIdentifier]
  )
  const disabled = isExecutionNotStarted(pipelineExecution.status)

  function handleClick(): void {
    const { pipelineIdentifier, planExecutionId } = pipelineExecution

    if (!disabled && pipelineIdentifier && planExecutionId) {
      history.push(
        routes.toExecutionPipelineView({
          orgIdentifier,
          pipelineIdentifier,
          executionIdentifier: planExecutionId,
          projectIdentifier,
          accountId,
          module
        })
      )
    }
  }

  return (
    <Card elevation={0} className={css.card} data-disabled={disabled} data-variant={variant}>
      <div className={css.cardLink} onClick={handleClick}>
        <div className={css.content}>
          <div className={css.header}>
            <div className={css.info}>
              <div className={css.nameGroup}>
                <div className={css.pipelineName}>{pipelineExecution?.name}</div>
                {variant === CardVariant.Default ? (
                  <String
                    className={css.executionId}
                    stringID={
                      module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'
                    }
                    vars={pipelineExecution}
                  />
                ) : null}
              </div>
              {!isEmpty(pipelineExecution?.tags) ? (
                <TagsPopover
                  iconProps={{ size: 14 }}
                  className={css.tags}
                  popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
                  tags={defaultTo(pipelineExecution?.tags, []).reduce((val, tag) => {
                    return Object.assign(val, { [tag.key]: tag.value })
                  }, {} as { [key: string]: string })}
                />
              ) : null}
              {pipelineExecution.gitDetails ? (
                <GitPopover
                  data={pipelineExecution.gitDetails}
                  iconProps={{ size: 14 }}
                  popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
                />
              ) : null}
            </div>
            <div className={css.actions}>
              <div className={css.statusContainer}>
                <ExecutionStatusLabel status={pipelineExecution.status as ExecutionStatus} />
                {isExecutionIgnoreFailed(pipelineExecution.status) ? (
                  <Popover
                    wrapperTagName="div"
                    targetTagName="div"
                    interactionKind="hover"
                    popoverClassName={css.ignoreFailedPopover}
                    content={
                      <String
                        tagName="div"
                        className={css.ignoreFailedTooltip}
                        stringID="pipeline.execution.ignoreFailedWarningText"
                      />
                    }
                  >
                    <Icon name="warning-sign" size={16} className={css.ignoreWarning} />
                  </Popover>
                ) : null}
              </div>
              {variant === CardVariant.Default || variant === CardVariant.MinimalWithActions ? (
                <ExecutionActions
                  executionStatus={pipelineExecution.status as ExecutionStatus}
                  params={{
                    accountId,
                    orgIdentifier,
                    pipelineIdentifier: defaultTo(pipelineExecution?.pipelineIdentifier, ''),
                    executionIdentifier: defaultTo(pipelineExecution?.planExecutionId, ''),
                    projectIdentifier,
                    module,
                    repoIdentifier: pipelineExecution?.gitDetails?.repoIdentifier,
                    branch: pipelineExecution?.gitDetails?.branch
                  }}
                  canEdit={canEdit}
                  canExecute={canExecute}
                />
              ) : null}
            </div>
          </div>
          <div className={css.main}>
            <div className={css.modulesContainer}>
              {HAS_CI && ciInfo ? (
                <div className={css.moduleData}>
                  <Icon name={ciInfo.icon} size={20} className={css.moduleIcon} />
                  {React.createElement<ExecutionCardInfoProps>(ciInfo.component, {
                    data: defaultTo(pipelineExecution?.moduleInfo?.ci, {}),
                    nodeMap: defaultTo(pipelineExecution?.layoutNodeMap, {}),
                    startingNodeId: defaultTo(pipelineExecution?.startingNodeId, ''),
                    variant
                  })}
                </div>
              ) : null}
              {HAS_CD && cdInfo ? (
                <div className={css.moduleData}>
                  <Icon name={cdInfo.icon} size={20} className={css.moduleIcon} />
                  {React.createElement<ExecutionCardInfoProps>(cdInfo.component, {
                    data: defaultTo(pipelineExecution?.moduleInfo?.cd, {}),
                    nodeMap: defaultTo(pipelineExecution?.layoutNodeMap, {}),
                    startingNodeId: defaultTo(pipelineExecution?.startingNodeId, ''),
                    variant
                  })}
                </div>
              ) : null}
            </div>
            {variant === CardVariant.Default ? (
              <MiniExecutionGraph
                pipelineExecution={pipelineExecution}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                accountId={accountId}
                module={module}
              />
            ) : null}
          </div>
        </div>
        <div className={css.footer}>
          <div className={css.triggerInfo}>
            <UserLabel
              name={
                get(pipelineExecution, 'moduleInfo.ci.ciExecutionInfoDTO.author.name') ||
                get(pipelineExecution, 'moduleInfo.ci.ciExecutionInfoDTO.author.id') ||
                get(pipelineExecution, 'executionTriggerInfo.triggeredBy.identifier') ||
                'Anonymous'
              }
            />
            <String
              className={css.triggerType}
              stringID={mapTriggerTypeToStringID(get(pipelineExecution, 'executionTriggerInfo.triggerType'))}
            />
          </div>
          <div className={css.timers}>
            <Duration
              icon="time"
              className={css.duration}
              iconProps={{ size: 14, className: css.timerIcon }}
              startTime={pipelineExecution?.startTs}
              durationText={variant === CardVariant.Default ? undefined : ' '}
              endTime={pipelineExecution?.endTs}
            />
            <TimeAgoPopover
              iconProps={{ size: 14, className: css.timerIcon }}
              icon="calendar"
              time={defaultTo(pipelineExecution?.startTs, 0)}
              inline={false}
              className={css.timeAgo}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
