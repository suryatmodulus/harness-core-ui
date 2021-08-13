import React from 'react'
import { Card, Text, Color, Container, Layout, SparkChart, CardBody, Icon, Button } from '@wings-software/uicore'
import { Classes, Intent, Menu, TextArea } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { isEmpty, pick } from 'lodash-es'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import { TimeAgoPopover, useConfirmationDialog, useToaster } from '@common/exports'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { EntityGitDetails, PMSPipelineSummaryResponse, useSoftDeletePipeline } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { TagsPopover } from '@common/components'
import routes from '@common/RouteDefinitions'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { getIconsForPipeline } from '../../PipelineListUtils'
import css from './PipelineCard.module.scss'

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

const LEFT_COLUMN_WIDTH = 80

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
  const { isGitSyncEnabled } = { isGitSyncEnabled: true }
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

  const pipelineIcons = getIconsForPipeline(pipeline)

  return (
    <Card className={css.pipelineCard} interactive onClick={() => goToPipelineStudio(pipeline)}>
      <Container padding={'xlarge'} border={{ bottom: true }} className={css.pipelineInfo}>
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
        />
        <Container>
          {!isEmpty(pipelineIcons) && (
            <Layout.Horizontal spacing={'small'} margin={{ bottom: 'small' }}>
              {pipelineIcons.map(iconObj => (
                <Icon key={iconObj.icon} name={iconObj.icon} size={14} />
              ))}
            </Layout.Horizontal>
          )}
          <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Container>
              <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.GREY_800} data-testid={pipeline.identifier}>
                {pipeline.name}
              </Text>
              <Text font="small" lineClamp={1} color={Color.GREY_600} margin={{ top: 'xsmall' }}>
                {getString('idLabel', { id: pipeline.identifier })}
              </Text>
            </Container>
            {!isEmpty(pipeline.tags) && pipeline.tags && (
              <TagsPopover
                className={css.tagsPopover}
                iconProps={{ size: 14, color: Color.GREY_600 }}
                tags={pipeline.tags}
              />
            )}
          </Layout.Horizontal>
        </Container>
      </Container>
      <Container padding={{ left: 'xlarge', right: 'xlarge' }}>
        <Container border={{ bottom: true }} padding={{ top: 'medium', bottom: 'medium' }}>
          {pipeline.stageNames?.length ? (
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
              <Text className={css.label} font="small" width={LEFT_COLUMN_WIDTH} color={Color.GREY_700}>
                {getString('stages')}
              </Text>
              <Text font="small" color={Color.BLACK} lineClamp={1}>
                {pipeline.stageNames?.join(', ')}
              </Text>
            </Layout.Horizontal>
          ) : null}
        </Container>
        <Container
          className={css.infoContainer}
          border={{ bottom: true }}
          padding={{ top: 'medium', bottom: 'medium' }}
        >
          {(module === 'ci' || !!pipeline.filters?.ci?.repoNames?.length) && (
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
              <Text font="small" width={LEFT_COLUMN_WIDTH} color={Color.GREY_700}>
                {getString('pipeline.buildRepo')}
              </Text>
              {pipeline.filters?.ci?.repoNames?.length ? (
                <Text font="small" color={Color.BLACK} lineClamp={1}>
                  {pipeline.filters?.ci?.repoNames.join(', ')}
                </Text>
              ) : (
                <Text font="small" color={Color.GREY_500}>
                  {getString('none')}
                </Text>
              )}
            </Layout.Horizontal>
          )}
          {(module === 'cd' || !!pipeline.filters?.cd?.serviceNames?.length) && (
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
              <Text font="small" width={LEFT_COLUMN_WIDTH} color={Color.GREY_700}>
                {getString('services')}
              </Text>
              {pipeline.filters?.cd?.serviceNames?.length ? (
                <Text font="small" color={Color.BLACK} lineClamp={1}>
                  {pipeline.filters?.cd?.serviceNames.join(', ')}
                </Text>
              ) : (
                <Text font="small" color={Color.GREY_500}>
                  {getString('none')}
                </Text>
              )}
            </Layout.Horizontal>
          )}
        </Container>

        {isGitSyncEnabled && !!pipeline.gitDetails?.repoIdentifier && !!pipeline.gitDetails.branch && (
          <Container
            className={css.infoContainer}
            border={{ bottom: true }}
            padding={{ top: 'medium', bottom: 'medium' }}
          >
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
              <Text className={css.label} font="small" width={LEFT_COLUMN_WIDTH} color={Color.GREY_700}>
                {getString('pipeline.gitRepos')}
              </Text>
              <Layout.Horizontal style={{ alignItems: 'center' }} spacing={'small'}>
                <Icon name="repository" size={10} color={Color.GREY_600} />
                <Text
                  font={{ size: 'small' }}
                  color={Color.BLACK}
                  title={pipeline?.gitDetails?.repoIdentifier}
                  lineClamp={1}
                >
                  {(!loadingRepos &&
                    getRepoDetailsByIndentifier(pipeline.gitDetails.repoIdentifier, gitSyncRepos)?.name) ||
                    ''}
                </Text>
              </Layout.Horizontal>
            </Layout.Horizontal>

            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
              <Text className={css.label} font="small" width={LEFT_COLUMN_WIDTH} color={Color.GREY_700}>
                {getString('pipelineSteps.deploy.inputSet.branch')}
              </Text>
              <Layout.Horizontal style={{ alignItems: 'center' }} spacing={'small'}>
                <Icon name="git-new-branch" size={10} color={Color.GREY_500} />
                <Text font={{ size: 'small' }} color={Color.BLACK} title={pipeline?.gitDetails?.branch} lineClamp={1}>
                  {pipeline.gitDetails.branch}
                </Text>
              </Layout.Horizontal>
            </Layout.Horizontal>
          </Container>
        )}

        <Container className={css.infoContainer} padding={{ top: 'medium', bottom: 'xlarge' }}>
          {pipeline.executionSummaryInfo?.lastExecutionTs && (
            <>
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                <Text className={css.label} font="small" width={LEFT_COLUMN_WIDTH} color={Color.GREY_700}>
                  {getString('lastRunAtDate')}
                </Text>
                <Layout.Horizontal flex spacing={'small'}>
                  <TimeAgoPopover
                    font="small"
                    color={Color.BLACK}
                    onClick={event => {
                      event.stopPropagation()
                      goToExecutionPipelineView(pipeline.executionSummaryInfo?.lastExecutionId)
                    }}
                    time={pipeline.executionSummaryInfo?.lastExecutionTs}
                  />
                  <Icon
                    name={
                      pipeline.executionSummaryInfo?.lastExecutionStatus === 'Success'
                        ? 'deployment-success-legacy'
                        : 'warning-sign'
                    }
                    intent={
                      pipeline.executionSummaryInfo?.lastExecutionStatus !== 'Success' ? Intent.DANGER : Intent.NONE
                    }
                    size={12}
                  />
                </Layout.Horizontal>
              </Layout.Horizontal>
              <Layout.Horizontal
                margin={{ top: deployments ? 'xsmall' : 0 }}
                flex={{ justifyContent: 'flex-start', alignItems: deployments ? 'flex-end' : 'center' }}
              >
                <Container className={css.label} width={LEFT_COLUMN_WIDTH}>
                  <Text color={Color.GREY_700} font="small">
                    {getString('executionsText')}
                  </Text>
                  <Text color={Color.GREY_500} font="xsmall">
                    {getString('pipeline.lastSevenDays')}
                  </Text>
                </Container>
                <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'flex-end' }}>
                  {deployments ? (
                    <>
                      <SparkChart
                        data={pipeline.executionSummaryInfo?.deployments || []}
                        data2={pipeline.executionSummaryInfo?.numOfErrors || []}
                        color={Color.PRIMARY_4}
                        color2={Color.RED_600}
                        className={css.sparkChart}
                      />
                      <Text
                        color={Color.PRIMARY_7}
                        font={{ size: 'medium', weight: 'semi-bold' }}
                        iconProps={{ size: 18 }}
                        className={css.deploymentsCount}
                        onClick={event => {
                          event.stopPropagation()
                          goToPipelineDetail(pipeline)
                        }}
                      >
                        {deployments}
                      </Text>
                    </>
                  ) : (
                    <Text color={Color.GREY_500} font={{ size: 'small' }}>
                      {getString('none')}
                    </Text>
                  )}
                </Layout.Horizontal>
              </Layout.Horizontal>
            </>
          )}
          <Layout.Horizontal
            margin={{ top: pipeline.executionSummaryInfo?.lastExecutionTs ? 'small' : 0 }}
            spacing={'small'}
            flex
          >
            {!pipeline.executionSummaryInfo?.lastExecutionTs && (
              <Text font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_400}>
                {getString('pipeline.neverRan')}
              </Text>
            )}
            <RbacButton
              data-testid="card-run-pipeline"
              icon="command-start"
              iconProps={{ size: 9 }}
              className={cx(css.cardBtns, css.runBtn)}
              text={getString('runPipelineText')}
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
            {pipeline.executionSummaryInfo?.lastExecutionTs && (
              <Button
                className={cx(css.cardBtns, css.viewExecutionsBtn)}
                text={getString('viewExecutions')}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  goToPipelineDetail(pipeline)
                }}
              />
            )}
          </Layout.Horizontal>
        </Container>
      </Container>
    </Card>
  )
}
