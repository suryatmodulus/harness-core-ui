import React from 'react'
import { Card, Text, Color, Container, Layout, SparkChart, CardBody, Icon } from '@wings-software/uicore'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { useHistory } from 'react-router-dom'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { RunPipelineModal } from '@pipeline/components/RunPipelineModal/RunPipelineModal'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { PMSPipelineSummaryResponse, useSoftDeletePipeline } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/exports'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { TagsPopover } from '@common/components'
import routes from '@common/RouteDefinitions'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { getIconsForPipeline, getStatusColor } from '../../PipelineListUtils'
import css from '../../PipelinesPage.module.scss'

interface PipelineDTO extends PMSPipelineSummaryResponse {
  status?: string
}
export interface PipelineCardProps {
  pipeline: PipelineDTO
  goToPipelineDetail: (pipelineIdentifier?: string) => void
  goToPipelineStudio: (pipelineIdentifier?: string) => void
  refetchPipeline: () => void
}

interface ContextMenuProps {
  pipeline: PMSPipelineSummaryResponse
  goToPipelineStudio: (pipelineIdentifier?: string) => void
  goToPipelineDetail: (pipelineIdentifier?: string) => void
  refetchPipeline: () => void
  projectIdentifier: string
  orgIdentifier: string
  accountIdentifier: string
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
  const { mutate: deletePipeline } = useSoftDeletePipeline({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier }
  })

  const { getString } = useStrings()
  const { openDialog: confirmDelete } = useConfirmationDialog({
    contentText: getString('pipeline-list.confirmDelete', { name: pipeline.name }),
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
          showError(err?.data?.message)
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

  return (
    <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
      <RunPipelineModal pipelineIdentifier={pipeline.identifier || /* istanbul ignore next */ ''}>
        <Menu.Item icon="play" text={getString('runPipelineText')} disabled={!canRun} />
      </RunPipelineModal>
      <Menu.Item
        icon="cog"
        text={getString('launchStudio')}
        onClick={() => {
          goToPipelineStudio(pipeline.identifier)
        }}
      />
      <Menu.Item
        icon="list-detail-view"
        text={getString('viewExecutions')}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          goToPipelineDetail(pipeline.identifier)
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
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const history = useHistory()
  const goToExecutionPipelineView = (executionId: string | undefined): void => {
    if (executionId) {
      history.push(
        routes.toExecutionPipelineView({
          orgIdentifier,
          pipelineIdentifier,
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

  return (
    <Card className={css.pipelineCard} interactive onClick={() => goToPipelineStudio(pipeline.identifier)}>
      <Container padding={{ left: 'large', bottom: 'medium' }} className={css.pipelineTitle}>
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
            />
          }
          menuPopoverProps={{
            className: Classes.DARK
          }}
          className={css.menu}
        />
      </Container>
      <Layout.Horizontal padding={{ left: 'large', bottom: 'medium', right: 'large' }}>
        <div>
          <Text
            lineClamp={2}
            font="medium"
            color={Color.BLACK}
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
        <Layout.Horizontal padding={{ left: 'large', bottom: 'medium', right: 'large' }}>
          <Text font="small" color={Color.GREY_400} lineClamp={2} tooltipProps={{ position: Position.BOTTOM }}>
            {pipeline.description}
          </Text>
        </Layout.Horizontal>
      ) : null}

      {pipeline.stageNames?.length ? (
        <Layout.Horizontal padding={{ left: 'large', bottom: 'medium', right: 'medium' }}>
          <Text font="small" color={Color.GREY_400} className={css.serviceLabel}>
            {getString('stages')}
          </Text>
          <Text color={Color.GREY_500} className={css.serviceName} lineClamp={1}>
            {pipeline.stageNames?.join(', ')}
          </Text>
        </Layout.Horizontal>
      ) : null}

      {pipeline.filters?.[module]?.serviceNames?.length ? (
        <Layout.Horizontal padding={{ left: 'large', bottom: 'medium', right: 'medium' }}>
          <Text font="small" color={Color.GREY_400} className={css.serviceLabel}>
            {getString('services')}
          </Text>
          <Text color={Color.GREY_500} className={css.serviceName} lineClamp={1}>
            {pipeline.filters?.[module]?.serviceNames.join(', ')}
          </Text>
        </Layout.Horizontal>
      ) : null}

      <Container
        padding={{ left: 'large', right: 'large', top: 'medium', bottom: 'small' }}
        border={{ top: true, color: Color.GREY_300 }}
      >
        <Layout.Horizontal spacing="xsmall">
          <String stringID="lastRunAtDate" />
          <Text
            rightIcon={pipeline.executionSummaryInfo?.lastExecutionTs ? 'full-circle' : undefined}
            rightIconProps={{ color: getStatusColor(pipeline), size: 8, padding: { left: 'medium' } }}
            color={pipeline.executionSummaryInfo?.lastExecutionId ? Color.BLUE_500 : Color.GREY_400}
            onClick={event => {
              event.stopPropagation()
              goToExecutionPipelineView(pipeline.executionSummaryInfo?.lastExecutionId)
            }}
          >
            {pipeline.executionSummaryInfo?.lastExecutionTs
              ? formatDatetoLocale(pipeline.executionSummaryInfo?.lastExecutionTs)
              : getString('lastRunExecutionNever')}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal
          flex={{ distribution: 'space-between' }}
          padding={{ top: 'large', bottom: 'small' }}
          spacing="medium"
          style={{ alignItems: 'flex-end' }}
        >
          <Layout.Horizontal>
            <div style={{ marginRight: 12 }}>
              <Text color={Color.GREY_400} className={`${deployments ? css.clickable : ''}`} font="small" lineClamp={2}>
                {getString('executionsText')}
              </Text>
              <Text color={Color.GREY_400} className={`${deployments ? css.clickable : ''}`} font="small" lineClamp={2}>
                ({getString('lastSevenDays')})
              </Text>
            </div>
            <Text
              color={deployments ? Color.BLUE_500 : Color.GREY_400}
              font="medium"
              iconProps={{ size: 18 }}
              onClick={event => {
                event.stopPropagation()
                goToPipelineDetail(pipeline.identifier)
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
                color={Color.GREEN_500}
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
      <Container padding={{ left: 'large', right: 'large', bottom: 'small' }}>
        <RunPipelineModal pipelineIdentifier={pipeline.identifier || ''}>
          <RbacButton
            data-testid="card-run-pipeline"
            intent="primary"
            minimal
            icon="run-pipeline"
            className={css.runPipelineBtn}
            text={<String stringID="runPipelineText" />}
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.PIPELINE,
                resourceIdentifier: pipeline.identifier as string
              },
              permission: PermissionIdentifier.EXECUTE_PIPELINE
            }}
          />
        </RunPipelineModal>
      </Container>
    </Card>
  )
}
