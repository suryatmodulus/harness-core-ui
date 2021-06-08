import { Button, Color, Icon, IconName, Layout, Popover, Text } from '@wings-software/uicore'
import React from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { useParams } from 'react-router-dom'
import { Classes, Menu, Position } from '@blueprintjs/core'
import Table from '@common/components/Table/Table'
import {
  PageInputSetSummaryResponse,
  useDeleteInputSetForPipeline,
  InputSetSummaryResponse
} from 'services/pipeline-ng'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { TagsPopover } from '@common/components'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './InputSetList.module.scss'

interface InputSetListViewProps {
  data?: PageInputSetSummaryResponse
  goToInputSetDetail?: (inputSet?: InputSetSummaryResponse) => void
  cloneInputSet?: (identifier?: string) => void
  refetchInputSet?: () => void
  gotoPage: (pageNumber: number) => void
  canUpdate?: boolean
  pipelineHasRuntimeInputs?: boolean
}

interface InputSetLocal extends InputSetSummaryResponse {
  action?: string
  lastUpdatedBy?: string
  createdBy?: string
  inputFieldSummary?: string
}

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  goToInputSetDetail?: (inputSet?: InputSetSummaryResponse) => void
  cloneInputSet?: (identifier?: string) => void
  refetchInputSet?: () => void
}

const getIconByType = (type: InputSetSummaryResponse['inputSetType']): IconName => {
  return type === 'OVERLAY_INPUT_SET' ? 'step-group' : 'yaml-builder-input-sets'
}

const RenderColumnInputSet: Renderer<CellProps<InputSetLocal>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <Icon
        name={getIconByType(data.inputSetType)}
        color={data.inputSetType === 'INPUT_SET' ? Color.BLACK : Color.BLUE_500}
        size={30}
      />
      <div>
        <Layout.Horizontal spacing="small" data-testid={data.identifier}>
          <Text color={Color.BLACK}>{data.name}</Text>
          {data.tags && Object.keys(data.tags || {}).length ? <TagsPopover tags={data.tags} /> : null}
        </Layout.Horizontal>
        <Text color={Color.GREY_400}>{data.identifier}</Text>
      </div>
    </Layout.Horizontal>
  )
}

const RenderColumnDescription: Renderer<CellProps<InputSetLocal>> = ({ row }) => {
  const data = row.original
  return (
    <Text lineClamp={2} color={Color.GREY_400}>
      {data.description}
    </Text>
  )
}

export const RenderGitDetails: Renderer<CellProps<InputSetLocal>> = ({ row }) => {
  const { gitDetails } = row.original

  return !!gitDetails?.repoIdentifier && !!gitDetails.branch ? (
    <Layout.Horizontal style={{ alignItems: 'center' }} padding={{ right: 'medium' }} className={css.gitDetails}>
      <Text
        style={{ fontSize: '13px', wordWrap: 'break-word', maxWidth: '100px' }}
        color={Color.GREY_800}
        margin={{ right: 'small' }}
        lineClamp={1}
        title={gitDetails.repoIdentifier}
      >
        {gitDetails.repoIdentifier}
      </Text>
      <Layout.Horizontal
        border={{ color: Color.GREY_200 }}
        spacing="xsmall"
        style={{ borderRadius: '5px', alignItems: 'center' }}
        padding={{ left: 'small', right: 'small', top: 'xsmall', bottom: 'xsmall' }}
        background={Color.GREY_100}
      >
        <Icon name="git-new-branch" size={11} color={Color.GREY_600} />
        <Text
          style={{ wordWrap: 'break-word', maxWidth: '100px' }}
          font={{ size: 'small' }}
          color={Color.GREY_800}
          title={gitDetails.branch}
          lineClamp={1}
        >
          {gitDetails.branch}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  ) : (
    <></>
  )
}

const RenderColumnActions: Renderer<CellProps<InputSetLocal>> = ({ row, column }) => {
  const data = row.original
  const { getString } = useStrings()

  const { pipelineIdentifier } = useParams<{
    pipelineIdentifier: string
  }>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runPipeline = useRunPipelineModal({
    inputSetSelected: [
      {
        type: data.inputSetType || /* istanbul ignore next */ 'INPUT_SET',
        value: data.identifier || /* istanbul ignore next */ '',
        label: data.name || /* istanbul ignore next */ '',
        gitDetails: data.gitDetails
      }
    ],
    pipelineIdentifier: (data.pipelineIdentifier || '') as string,
    repoIdentifier,
    branch
  })

  return (
    <RbacButton
      disabled={!(column as any)?.pipelineHasRuntimeInputs}
      icon="run-pipeline"
      className={css.runPipelineBtn}
      intent="primary"
      text={getString('runPipeline')}
      onClick={e => {
        e.stopPropagation()
        runPipeline()
      }}
      permission={{
        resource: {
          resourceType: ResourceType.PIPELINE,
          resourceIdentifier: pipelineIdentifier
        },
        permission: PermissionIdentifier.EXECUTE_PIPELINE
      }}
    />
  )
}
const RenderColumnMenu: Renderer<CellProps<InputSetLocal>> = ({ row, column }) => {
  const data = row.original
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
  }>()
  const { mutate: deleteInputSet } = useDeleteInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, pipelineIdentifier }
  })

  const { openDialog: confirmDelete } = useConfirmationDialog({
    contentText: getString('inputSets.confirmDeleteText', {
      name: data.name,
      type:
        data.inputSetType === 'OVERLAY_INPUT_SET'
          ? getString('inputSets.overlayInputSet')
          : getString('inputSets.inputSetLabel')
    }),

    titleText: getString('inputSets.confirmDeleteTitle', {
      type:
        data.inputSetType === 'OVERLAY_INPUT_SET'
          ? getString('inputSets.overlayInputSet')
          : getString('inputSets.inputSetLabel')
    }),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        try {
          const deleted = await deleteInputSet(data.identifier || /* istanbul ignore next */ '', {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */
          if (deleted.status === 'SUCCESS') {
            showSuccess(getString('inputSets.inputSetDeleted', { name: data.name }))
          }
          ;(column as any).refetchInputSet?.()
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message)
        }
      }
    }
  })
  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          className={css.actionButton}
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item
            icon="edit"
            text={getString('edit')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).goToInputSetDetail?.(data)
              setMenuOpen(false)
            }}
            disabled={!(column as any).canUpdate}
          />
          <Menu.Item
            icon="duplicate"
            disabled
            text={getString('projectCard.clone')}
            onClick={
              /* istanbul ignore next */
              (e: React.MouseEvent) => {
                e.stopPropagation()
                ;(column as any).cloneInputSet?.(data.identifier)
                setMenuOpen(false)
              }
            }
          />
          <Menu.Divider />
          <Menu.Item
            icon="trash"
            text={getString('delete')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              confirmDelete()
              setMenuOpen(false)
            }}
            disabled={!(column as any).canUpdate}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

export const InputSetListView: React.FC<InputSetListViewProps> = ({
  data,
  gotoPage,
  goToInputSetDetail,
  refetchInputSet,
  cloneInputSet,
  canUpdate = true,
  pipelineHasRuntimeInputs
}): JSX.Element => {
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const columns: CustomColumn<InputSetLocal>[] = React.useMemo(
    () => [
      {
        Header: getString('inputSets.inputSetLabel').toUpperCase(),
        accessor: 'name',
        width: isGitSyncEnabled ? '25%' : '30%',
        Cell: RenderColumnInputSet
      },
      {
        Header: getString('description').toUpperCase(),
        accessor: 'description',
        width: isGitSyncEnabled ? '30%' : '35%',
        Cell: RenderColumnDescription,
        disableSortBy: true
      },
      {
        Header: getString('common.gitSync.repoDetails').toUpperCase(),
        accessor: 'gitDetails',
        width: '25%',
        Cell: RenderGitDetails,
        disableSortBy: true
      },
      {
        Header: getString('action').toUpperCase(),
        accessor: 'identifier',
        width: isGitSyncEnabled ? '15%' : '30%',
        Cell: RenderColumnActions,
        disableSortBy: true,
        goToInputSetDetail,
        pipelineHasRuntimeInputs
      },
      {
        Header: '',
        accessor: 'action',
        width: '5%',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        goToInputSetDetail,
        refetchInputSet,
        cloneInputSet,
        canUpdate
      }
    ],
    [goToInputSetDetail, refetchInputSet, cloneInputSet, pipelineHasRuntimeInputs]
  )

  if (!isGitSyncEnabled) {
    columns.splice(2, 1)
  }

  return (
    <Table<InputSetLocal>
      className={css.table}
      columns={columns}
      data={data?.content || /* istanbul ignore next */ []}
      onRowClick={item => pipelineHasRuntimeInputs && goToInputSetDetail?.(item)}
      pagination={{
        itemCount: data?.totalItems || /* istanbul ignore next */ 0,
        pageSize: data?.pageSize || /* istanbul ignore next */ 10,
        pageCount: data?.totalPages || /* istanbul ignore next */ -1,
        pageIndex: data?.pageIndex || /* istanbul ignore next */ 0,
        gotoPage
      }}
    />
  )
}
