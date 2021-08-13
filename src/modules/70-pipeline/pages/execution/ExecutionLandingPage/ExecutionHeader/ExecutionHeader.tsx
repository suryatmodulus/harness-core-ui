import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'

import routes from '@common/RouteDefinitions'
import { Duration } from '@common/components/Duration/Duration'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { String, useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { TagsPopover } from '@common/components'

import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import css from './ExecutionHeader.module.scss'

export function ExecutionHeader(): React.ReactElement {
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, pipelineIdentifier, module } =
    useParams<PipelineType<ExecutionPathProps>>()
  const { refetch, pipelineExecutionDetail } = useExecutionContext()
  const { getString } = useStrings()
  const { pipelineExecutionSummary = {} } = pipelineExecutionDetail || {}

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

  return (
    <header className={css.header}>
      <div className={css.headerTopRow}>
        <NGBreadcrumbs
          links={[
            {
              url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
              label: getString('pipelines')
            },
            {
              url: routes.toPipelineDeploymentList({
                orgIdentifier,
                projectIdentifier,
                pipelineIdentifier,
                accountId,
                module,
                branch: pipelineExecutionSummary?.gitDetails?.branch,
                repoIdentifier: pipelineExecutionSummary?.gitDetails?.repoIdentifier
              }),
              label: pipelineExecutionSummary.name || getString('common.pipeline')
            }
          ]}
        />
        <div className={css.actionsBar}>
          {pipelineExecutionSummary.startTs && (
            <div className={css.startTime}>
              <String tagName="div" className={css.startTimeText} stringID="pipeline.startTime" />
              <span>{formatDatetoLocale(pipelineExecutionSummary.startTs)}</span>
            </div>
          )}
          <Duration
            className={css.duration}
            startTime={pipelineExecutionSummary.startTs}
            endTime={pipelineExecutionSummary.endTs}
            icon="time"
            iconProps={{ size: 12 }}
            durationText={' '}
          />
          <ExecutionActions
            executionStatus={pipelineExecutionSummary.status as ExecutionStatus}
            refetch={refetch}
            params={{
              orgIdentifier,
              pipelineIdentifier,
              projectIdentifier,
              accountId,
              executionIdentifier,
              module,
              repoIdentifier: pipelineExecutionSummary?.gitDetails?.repoIdentifier,
              branch: pipelineExecutionSummary?.gitDetails?.branch
            }}
            canEdit={canEdit}
            canExecute={canExecute}
          />
        </div>
      </div>
      <div className={css.titleContainer}>
        <div className={css.title}>{pipelineExecutionSummary.name}</div>
        <String
          tagName="div"
          className={css.pipelineId}
          stringID={module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'}
          vars={pipelineExecutionSummary}
        />
        {!isEmpty(pipelineExecutionSummary?.tags) ? (
          <TagsPopover
            iconProps={{ size: 14 }}
            className={css.tags}
            popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
            tags={(pipelineExecutionSummary?.tags || []).reduce((val, tag) => {
              return Object.assign(val, { [tag.key]: tag.value })
            }, {} as { [key: string]: string })}
          />
        ) : null}
        {pipelineExecutionSummary.gitDetails?.objectId ? (
          <GitSyncStoreProvider>
            <GitPopover
              data={pipelineExecutionSummary.gitDetails}
              popoverProps={{ targetTagName: 'div', wrapperTagName: 'div', className: css.git }}
            />
          </GitSyncStoreProvider>
        ) : null}
        {pipelineExecutionSummary.status ? (
          <ExecutionStatusLabel
            className={css.statusLabel}
            status={pipelineExecutionSummary.status as ExecutionStatus}
          />
        ) : null}
      </div>
    </header>
  )
}
