import React from 'react'
import { Card, Text, Color, Container, Layout, SparkChart, CardBody, Icon, Button } from '@wings-software/uicore'
import { Classes, Intent, Menu, Position, TextArea } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { isEmpty, pick } from 'lodash-es'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { EntityGitDetails, PMSPipelineSummaryResponse, useSoftDeletePipeline } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { TagsPopover } from '@common/components'
import routes from '@common/RouteDefinitions'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { getIconsForPipeline } from '../../PipelineListUtils'
import css from '../../PipelinesPage.module.scss'

interface PipelineDTO extends PMSPipelineSummaryResponse {
  status?: string
}
export interface PipelineCardProps {
  pipeline: PipelineDTO
  goToPipelineDetail: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineStudio: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline: () => void
}

interface DeleteConfirmDialogContentProps {
  gitDetails?: EntityGitDetails
  pipelineName?: string
  commitMsg: string
  onCommitMsgChange: (commitMsg: string) => void
}

export const DeleteConfirmDialogContent: React.FC<DeleteConfirmDialogContentProps> = ({
  gitDetails = {},
  pipelineName = '',
  commitMsg,
  onCommitMsgChange
}): JSX.Element => {
  const { getString } = useStrings()

  return (
    <div className={'pipelineDeleteDialog'}>
      <Text margin={{ bottom: 'medium' }} title={pipelineName}>{`${getString(
        'pipeline-list.confirmDelete'
      )} ${pipelineName}?`}</Text>
      {gitDetails?.objectId && (
        <>
          <Text>{getString('common.git.commitMessage')}</Text>
          <TextArea
            value={commitMsg}
            onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              onCommitMsgChange(event.target.value)
            }}
          />
        </>
      )}
    </div>
  )
}

interface ContextMenuProps {
  pipeline: PMSPipelineSummaryResponse
  goToPipelineStudio: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineDetail: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline: () => void
  projectIdentifier: string
  orgIdentifier: string
  accountIdentifier: string
  isGitSyncEnabled: boolean
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  pipeline,
  goToPipelineStudio,
  refetchPipeline,
  goToPipelineDetail,
  projectIdentifier,
  orgIdentifier,
  accountIdentifier
}): JSX.Element => {
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const [commitMsg, setCommitMsg] = React.useState<string>(
    `${getString('pipeline-list.confirmDeleteTitle')} ${pipeline.name}`
  )

  const gitParams = pipeline.gitDetails?.objectId
    ? {
        ...pick(pipeline.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
        commitMsg,
        lastObjectId: pipeline.gitDetails?.objectId
      }
    : {}

  const { mutate: deletePipeline } = useSoftDeletePipeline({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      ...gitParams
    }
  })

  const { openDialog: confirmDelete } = useConfirmationDialog({
    contentText: (
      <DeleteConfirmDialogContent
        pipelineName={pipeline?.name}
        gitDetails={pipeline.gitDetails}
        commitMsg={commitMsg}
        onCommitMsgChange={setCommitMsg}
      />
    ),
    titleText: getString('pipeline-list.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        try {
          const deleted = await deletePipeline(pipeline.identifier || /* istanbul ignore next */ '', {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */
          if (deleted.status === 'SUCCESS') {
            showSuccess(getString('pipeline-list.pipelineDeleted', { name: pipeline.name }))
          }
          refetchPipeline()
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message, undefined, 'pipeline.delete.title.error')
        }
      }
    }
  })

  const [canDelete, canRun] = usePermission(
    {
      resourceScope: {
        accountIdentifier,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipeline.identifier as string
      },
      permissions: [PermissionIdentifier.DELETE_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [orgIdentifier, projectIdentifier, accountIdentifier, pipeline.identifier]
  )

  const runPipeline = useRunPipelineModal({
    pipelineIdentifier: (pipeline.identifier || '') as string,
    repoIdentifier: pipeline?.gitDetails?.repoIdentifier,
    branch: pipeline?.gitDetails?.branch
  })

  return (
    <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
      <Menu.Item
        icon="play"
        text={getString('runPipelineText')}
        disabled={!canRun}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          runPipeline()
        }}
      />
      {/* </RunPipelineModal> */}
      <Menu.Item
        icon="cog"
        text={getString('launchStudio')}
        onClick={() => {
          goToPipelineStudio(pipeline)
        }}
      />
      <Menu.Item
        icon="list-detail-view"
        text={getString('viewExecutions')}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          goToPipelineDetail(pipeline)
        }}
      />
      <Menu.Divider />
      <Menu.Item
        icon="duplicate"
        text={getString('projectCard.clone')}
        disabled
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          return false
        }}
      />
      <Menu.Item
        icon="trash"
        text={getString('delete')}
        disabled={!canDelete}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          confirmDelete()
        }}
      />
    </Menu>
  )
}

export const PipelineCard: React.FC<PipelineCardProps> = ({
  pipeline,
  goToPipelineDetail,
  goToPipelineStudio,
  refetchPipeline
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const { isGitSyncEnabled } = useAppStore()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const history = useHistory()
  const goToExecutionPipelineView = (executionId: string | undefined): void => {
    if (executionId && pipeline.identifier) {
      history.push(
        routes.toExecutionPipelineView({
          orgIdentifier,
          pipelineIdentifier: pipeline.identifier,
          projectIdentifier,
          executionIdentifier: executionId,
          accountId,
          module
        })
      )
    }
  }

  const { getString } = useStrings()
  const deployments = pipeline.executionSummaryInfo?.deployments?.reduce((acc, val) => acc + val, 0) || 0

  const runPipeline = useRunPipelineModal({
    pipelineIdentifier: (pipeline.identifier || '') as string,
    repoIdentifier: pipeline?.gitDetails?.repoIdentifier,
    branch: pipeline?.gitDetails?.branch
  })

  return (
    <Card className={css.pipelineCard} interactive onClick={() => goToPipelineStudio(pipeline)}>
      <div className={cx(css.sectionMargin, css.sectionBorder)}>
        <Container padding={{ bottom: 'medium' }} className={css.pipelineTitle}>
          <span>
            {getIconsForPipeline(pipeline).map(iconObj => (
              <Icon key={iconObj.icon} name={iconObj.icon} size={iconObj.size} />
            ))}
          </span>

          <CardBody.Menu
            menuContent={
              <ContextMenu
                pipeline={pipeline}
                goToPipelineStudio={goToPipelineStudio}
                goToPipelineDetail={goToPipelineDetail}
                refetchPipeline={refetchPipeline}
                projectIdentifier={projectIdentifier}
                accountIdentifier={accountId}
                orgIdentifier={orgIdentifier}
                isGitSyncEnabled
              />
            }
            menuPopoverProps={{
              className: Classes.DARK
            }}
            className={css.menu}
          />
        </Container>
        <Layout.Horizontal padding={{ bottom: 'medium' }}>
          <div className={css.pipelineNameSections}>
            <Text
              lineClamp={2}
              font="medium"
              color={Color.GREY_800}
              data-testid={pipeline.identifier}
              className={css.pipelineName}
            >
              {pipeline.name}
            </Text>
            <Text font="small" color={Color.GREY_500}>
              {getString('idLabel')}
              {pipeline.identifier}
            </Text>
          </div>
          {!isEmpty(pipeline.tags) && pipeline.tags && <TagsPopover tags={pipeline.tags} />}
        </Layout.Horizontal>

        {!isEmpty(pipeline.description) ? (
          <Layout.Horizontal padding={{ bottom: 'medium', right: 'large' }}>
            <Text font="small" color={Color.GREY_700} lineClamp={2} tooltipProps={{ position: Position.BOTTOM }}>
              {pipeline.description}
            </Text>
          </Layout.Horizontal>
        ) : null}

        {pipeline.stageNames?.length ? (
          <Layout.Horizontal padding={{ bottom: 'medium', right: 'medium' }}>
            <Text font="small" color={Color.GREY_500} className={css.serviceLabel}>
              {getString('stages')}
            </Text>
            <Text color={Color.GREY_900} className={css.serviceName} width={100} lineClamp={1}>
              {pipeline.stageNames?.join(', ')}
            </Text>
          </Layout.Horizontal>
        ) : null}

        {pipeline.filters?.[module]?.serviceNames?.length ? (
          <Layout.Horizontal padding={{ bottom: 'medium', right: 'medium' }}>
            <Text font="small" color={Color.GREY_500} className={css.serviceLabel}>
              {getString('services')}
            </Text>
            <Text color={Color.GREY_900} className={css.serviceName} lineClamp={1}>
              {pipeline.filters?.[module]?.serviceNames.join(', ')}
            </Text>
          </Layout.Horizontal>
        ) : null}
      </div>

      {isGitSyncEnabled && !!pipeline.gitDetails?.repoIdentifier && !!pipeline.gitDetails.branch && (
        <div className={cx(css.sectionMargin, css.sectionBorder)}>
          <Layout.Horizontal
            className={css.pipelineGitDetails}
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
            padding={{ top: 'medium', bottom: 'medium' }}
          >
            <Layout.Horizontal style={{ alignItems: 'center' }} spacing={'small'}>
              <Icon name="repository" size={16} color={Color.GREY_800} />
              <Text
                style={{ maxWidth: 70 }}
                font={{ size: 'small' }}
                color={Color.GREY_900}
                title={pipeline.gitDetails.repoIdentifier}
                lineClamp={1}
              >
                {(!loadingRepos &&
                  getRepoDetailsByIndentifier(pipeline.gitDetails.repoIdentifier, gitSyncRepos)?.name) ||
                  ''}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal style={{ alignItems: 'center' }} spacing={'small'}>
              <Icon name="git-new-branch" size={14} color={Color.GREY_800} />
              <Text
                style={{ wordWrap: 'break-word', maxWidth: '70px' }}
                font={{ size: 'small' }}
                color={Color.GREY_900}
                title={pipeline.gitDetails.branch}
                lineClamp={1}
              >
                {pipeline.gitDetails.branch}
              </Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </div>
      )}

      <div className={cx(css.sectionMargin, css.sectionBorder)}>
        <Container padding={{ right: 'small', top: 'medium', bottom: 'small' }}>
          <Layout.Horizontal spacing="xsmall">
            <String
              stringID="lastRunAtDate"
              color={Color.GREY_500}
              style={{ width: pipeline.executionSummaryInfo?.lastExecutionId ? 160 : 100 }}
            />
            <Text
              color={pipeline.executionSummaryInfo?.lastExecutionId ? Color.PRIMARY_7 : Color.GREY_900}
              onClick={event => {
                event.stopPropagation()
                goToExecutionPipelineView(pipeline.executionSummaryInfo?.lastExecutionId)
              }}
            >
              {pipeline.executionSummaryInfo?.lastExecutionTs
                ? formatDatetoLocale(pipeline.executionSummaryInfo?.lastExecutionTs)
                : getString('pipelineSteps.pullNeverLabel')}
            </Text>

            {!!pipeline.executionSummaryInfo?.lastExecutionTs && (
              <Icon
                name={
                  pipeline.executionSummaryInfo?.lastExecutionStatus === 'Success'
                    ? 'deployment-success-legacy'
                    : 'warning-sign'
                }
                intent={pipeline.executionSummaryInfo?.lastExecutionStatus !== 'Success' ? Intent.DANGER : Intent.NONE}
                size={20}
              />
            )}
          </Layout.Horizontal>
          <Layout.Horizontal
            flex={{ distribution: 'space-between' }}
            padding={{ top: 'medium', bottom: 'small' }}
            spacing="medium"
            style={{ alignItems: 'flex-end' }}
          >
            <Layout.Horizontal>
              <div style={{ marginRight: 12, width: 90 }}>
                <Text color={Color.GREY_500} font="small" lineClamp={2}>
                  {getString('executionsText')}
                </Text>
                <Text color={Color.GREY_500} font="small" lineClamp={2}>
                  ({getString('pipeline.lastSevenDays')})
                </Text>
              </div>
              <Text
                color={deployments ? Color.PRIMARY_7 : Color.GREY_500}
                className={`${deployments ? css.clickable : ''}`}
                font="medium"
                iconProps={{ size: 18 }}
                onClick={event => {
                  event.stopPropagation()
                  goToPipelineDetail(pipeline)
                }}
              >
                {deployments}
              </Text>
            </Layout.Horizontal>

            {deployments ? (
              <span className={css.activityChart}>
                <SparkChart
                  data={pipeline.executionSummaryInfo?.deployments || []}
                  data2={pipeline.executionSummaryInfo?.numOfErrors || []}
                  color={Color.PRIMARY_4}
                  color2={Color.RED_600}
                />
              </span>
            ) : (
              <Text color={Color.GREY_400} font={{ size: 'xsmall' }}>
                {getString('emptyDeployments')}
              </Text>
            )}
          </Layout.Horizontal>
        </Container>
      </div>

      <div className={css.sectionMargin}>
        <Container flex={{ align: 'center-center', justifyContent: 'space-between' }} padding={{ top: 'large' }}>
          <RbacButton
            data-testid="card-run-pipeline"
            icon="run-pipeline"
            round
            className={css.runPipelineBtn}
            text={<String stringID="runPipelineText" />}
            font={{ size: 'normal' }}
            permission={{
              resource: {
                resourceType: ResourceType.PIPELINE,
                resourceIdentifier: pipeline.identifier as string
              },
              permission: PermissionIdentifier.EXECUTE_PIPELINE
            }}
            onClick={e => {
              e.stopPropagation()
              runPipeline()
            }}
          />
          <Button
            round
            color={Color.PRIMARY_7}
            font={{ size: 'normal' }}
            className={css.viewExecutionBtn}
            text={getString('viewExecutions')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              goToPipelineDetail(pipeline)
            }}
          />
        </Container>
      </div>
    </Card>
  )
}
