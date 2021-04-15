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
import { RunPipelineModal } from '@pipeline/components/RunPipelineModal/RunPipelineModal'
import { TagsPopover } from '@common/components'
import { useStrings } from 'framework/exports'
import css from './InputSetList.module.scss'

interface InputSetListViewProps {
  data?: PageInputSetSummaryResponse
  goToInputSetDetail?: (identifier?: string, type?: InputSetSummaryResponse['inputSetType']) => void
  cloneInputSet?: (identifier?: string) => void
  refetchInputSet?: () => void
  gotoPage: (pageNumber: number) => void
  canUpdate?: boolean
}

interface InputSetLocal extends InputSetSummaryResponse {
  action?: string
  lastUpdatedBy?: string
  createdBy?: string
  inputFieldSummary?: string
}

type CustomColumn<T extends object> = Column<T> & {
  goToInputSetDetail?: (identifier?: string) => void
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
      ></Icon>
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
const RenderColumnActions: Renderer<CellProps<InputSetLocal>> = ({ row, column }) => {
  const data = row.original
  const { getString } = useStrings()
  return (
    <RunPipelineModal
      pipelineIdentifier={data.pipelineIdentifier || /* istanbul ignore next */ ''}
      inputSetSelected={[
        {
          type: data.inputSetType || /* istanbul ignore next */ 'INPUT_SET',
          value: data.identifier || /* istanbul ignore next */ '',
          label: data.name || /* istanbul ignore next */ ''
        }
      ]}
    >
      <Button
        icon="run-pipeline"
        className={css.runPipelineBtn}
        intent="primary"
        text={getString('runPipeline')}
        disabled={!(column as any).canUpdate}
      />
    </RunPipelineModal>
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
        data.inputSetType === 'OVERLAY_INPUT_SET' ? getString('inputSets.overlayInputSet') : getString('inputSetsText')
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
              ;(column as any).goToInputSetDetail?.(data.identifier, data.inputSetType)
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
  canUpdate = true
}): JSX.Element => {
  const { getString } = useStrings()
  const columns: CustomColumn<InputSetLocal>[] = React.useMemo(
    () => [
      {
        Header: getString('inputSets.inputSetLabel').toUpperCase(),
        accessor: 'name',
        width: '25%',
        Cell: RenderColumnInputSet
      },
      {
        Header: getString('description').toUpperCase(),
        accessor: 'description',
        width: '20%',
        Cell: RenderColumnDescription,
        disableSortBy: true
      },
      {
        Header: getString('inputSets.inputFieldSummary').toUpperCase(),
        accessor: 'inputFieldSummary',
        width: '10%',
        disableSortBy: true
      },
      {
        Header: getString('lastUpdatedBy').toUpperCase(),
        accessor: 'lastUpdatedBy',
        width: '10%',
        disableSortBy: true
      },
      {
        Header: getString('cf.environments.createdBy').toUpperCase(),
        accessor: 'createdBy',
        width: '10%',
        disableSortBy: true
      },
      {
        Header: getString('action').toUpperCase(),
        accessor: 'identifier',
        width: '15%',
        Cell: RenderColumnActions,
        disableSortBy: true,
        goToInputSetDetail,
        canUpdate
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
    [goToInputSetDetail, refetchInputSet, cloneInputSet]
  )
  return (
    <Table<InputSetLocal>
      className={css.table}
      columns={columns}
      data={data?.content || /* istanbul ignore next */ []}
      onRowClick={item => goToInputSetDetail?.(item.identifier, item.inputSetType)}
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
