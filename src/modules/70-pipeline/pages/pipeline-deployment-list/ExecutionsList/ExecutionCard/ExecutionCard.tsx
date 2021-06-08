import React, { useState } from 'react'
import { Card, Icon, Layout } from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'

import { isEmpty } from 'lodash-es'
import type { PipelineExecutionSummary, ExecutionTriggerInfo } from 'services/pipeline-ng'
import { UserLabel, Duration, TimeAgo } from '@common/exports'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { String } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { TagsPopover } from '@common/components'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ExecutionStatus, isExecutionNotStarted } from '@pipeline/utils/statusHelpers'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import MiniExecutionGraph from './MiniExecutionGraph/MiniExecutionGraph'
import ServicesDeployed from './ExecutionDetails/ServicesDeployed'
import BuildInfo from './ExecutionDetails/BuildInfo/BuildInfo'
import { CommitsList } from './CommitsList/CommitsList'
// TODO: remove hardcoded types
import type { CIBuildCommit, CIBuildResponseDTO } from './ExecutionDetails/Types/types'
import css from './ExecutionCard.module.scss'

export interface ExecutionCardProps {
  pipelineExecution: PipelineExecutionSummary
}

export default function ExecutionCard(props: ExecutionCardProps): React.ReactElement {
  const { pipelineExecution } = props
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<PipelineType<ProjectPathProps>>()

  const [showCommits, setShowCommits] = useState(false)

  const HAS_CD = pipelineExecution?.modules?.includes('cd') || !isEmpty(pipelineExecution?.moduleInfo?.cd)
  const HAS_CI = pipelineExecution?.modules?.includes('ci') || !isEmpty(pipelineExecution?.moduleInfo?.ci)

  // TODO: remove type cast
  const ciBuildData = (pipelineExecution?.moduleInfo?.ci?.ciExecutionInfoDTO as unknown) as CIBuildResponseDTO
  const ciBranchName = (pipelineExecution?.moduleInfo?.ci?.branch as unknown) as string

  const getCommits = (build: CIBuildResponseDTO): CIBuildCommit[] => {
    switch (build.event) {
      case 'branch':
        return build?.branch?.commits || []
      case 'pullRequest':
        return build?.pullRequest?.commits || []
      default:
        return []
    }
  }

  const mapTriggerTypeToStringID = (triggerType: ExecutionTriggerInfo['triggerType']) => {
    switch (triggerType) {
      case 'WEBHOOK':
      case 'WEBHOOK_CUSTOM':
        return 'execution.triggerType.WEBHOOK'
      case 'SCHEDULER_CRON':
        return 'pipeline.triggers.scheduledLabel'
      default:
        return 'execution.triggerType.MANUAL'
    }
  }

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

  function handleClick(e: React.SyntheticEvent): void {
    if (disabled) {
      e.preventDefault()
    }
  }

  return (
    <Card elevation={0} className={css.card} interactive={!disabled}>
      <Link
        className={css.cardLink}
        onClick={handleClick}
        to={routes.toExecutionPipelineView({
          orgIdentifier,
          pipelineIdentifier: pipelineExecution?.pipelineIdentifier || '',
          executionIdentifier: pipelineExecution?.planExecutionId || '',
          projectIdentifier,
          accountId,
          module
        })}
      >
        <div className={css.icons} data-ci={HAS_CI} data-cd={HAS_CD}>
          {HAS_CI ? <Icon name="ci-main" /> : null}
          {HAS_CD ? <Icon name="cd-main" size={20} /> : null}
        </div>
        <div>
          <div className={css.content}>
            <div>
              <span className={css.pipelineName}>{pipelineExecution?.name}</span>
              <String
                className={css.executionId}
                stringID={module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'}
                vars={pipelineExecution}
              />
              {pipelineExecution.gitDetails && (
                <Layout.Horizontal spacing={'small'} inline={true} margin={{ right: 'small' }}>
                  <GitPopover iconSize={14} data={pipelineExecution.gitDetails} />
                </Layout.Horizontal>
              )}
              {!isEmpty(pipelineExecution?.tags) ? (
                <TagsPopover
                  tags={(pipelineExecution?.tags || []).reduce((val, tag) => {
                    return Object.assign(val, { [tag.key]: tag.value })
                  }, {} as { [key: string]: string })}
                />
              ) : null}
              {HAS_CI ? (
                <>
                  <div className={css.ciData}>
                    <String className={css.sectionTitle} stringID="buildText" />
                    <BuildInfo
                      toggleCommits={() => {
                        setShowCommits(!showCommits)
                      }}
                      showCommits={showCommits}
                      buildData={ciBuildData}
                      branchName={ciBranchName}
                      className={css.buildInfo}
                    />
                  </div>
                  {showCommits ? <CommitsList author={ciBuildData.author} commits={getCommits(ciBuildData)} /> : null}
                </>
              ) : null}
              {HAS_CD ? (
                <div className={css.cdData}>
                  <String className={css.sectionTitle} stringID="deploymentText" />
                  <ServicesDeployed pipelineExecution={pipelineExecution} />
                </div>
              ) : null}
            </div>
            <MiniExecutionGraph
              pipelineExecution={pipelineExecution}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              accountId={accountId}
              module={module}
            />
            <div className={css.actions}>
              <ExecutionStatusLabel status={pipelineExecution.status as ExecutionStatus} />
              <ExecutionActions
                executionStatus={pipelineExecution.status as ExecutionStatus}
                params={{
                  accountId,
                  orgIdentifier,
                  pipelineIdentifier: pipelineExecution?.pipelineIdentifier || '',
                  executionIdentifier: pipelineExecution?.planExecutionId || '',
                  projectIdentifier,
                  module,
                  repoIdentifier: pipelineExecution?.gitDetails?.repoIdentifier,
                  branch: pipelineExecution?.gitDetails?.branch
                }}
                canEdit={canEdit}
                canExecute={canExecute}
              />
            </div>
          </div>
          <div className={css.footer}>
            <div className={css.triggerInfo}>
              <UserLabel
                name={
                  pipelineExecution.moduleInfo?.ci?.ciExecutionInfoDTO?.author?.name ||
                  pipelineExecution.moduleInfo?.ci?.ciExecutionInfoDTO?.author?.id ||
                  pipelineExecution.executionTriggerInfo?.triggeredBy?.identifier ||
                  'Anonymous'
                }
              />
              <String
                className={css.triggerType}
                stringID={mapTriggerTypeToStringID(pipelineExecution.executionTriggerInfo?.triggerType)}
              />
            </div>
            <div className={css.timers}>
              <Duration
                icon="time"
                iconProps={{ size: 12 }}
                startTime={pipelineExecution?.startTs}
                endTime={pipelineExecution?.endTs}
              />
              <TimeAgo iconProps={{ size: 12 }} icon="calendar" time={pipelineExecution?.startTs || 0} />
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}
