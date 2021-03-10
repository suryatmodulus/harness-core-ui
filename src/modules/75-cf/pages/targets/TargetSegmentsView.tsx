import React, { useMemo } from 'react'
import { Menu } from '@blueprintjs/core'
import { Container, Button, Layout, Text } from '@wings-software/uicore'
import type { Column } from 'react-table'
import { useHistory } from 'react-router-dom'
import { get } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import Table from '@common/components/Table/Table'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { useStrings } from 'framework/exports'
import { withTableData } from '@cf/utils/table-utils'
import { Feature, Segment, useDeleteSegment } from 'services/cf'
import CreateTargetSegmentModal from './CreateTargetSegmentModal'
import css from './CFTargetsPage.module.scss'

type TableData = {
  segment: Segment
  actions: {
    onDelete: (identifier: string) => void
    onEdit: (identifier: string) => void
    getFlags: (identifier: string) => Feature[]
  }
}
const withSegment = withTableData<Segment, TableData>(({ row, column }) => ({
  segment: row.original,
  actions: (column as any).actions
}))

const UsedByCell: React.FC<any> = withSegment(({ segment, actions }: TableData) => {
  const { getString } = useStrings()
  const { getFlags, onDelete, onEdit } = actions

  const { openDialog } = useConfirmationDialog({
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    contentText: getString('cf.segments.delete.message', { segmentName: segment.identifier }),
    titleText: getString('cf.segments.delete.title'),
    onCloseDialog: (isConfirmed: boolean) => isConfirmed && onDelete(segment.identifier)
  })

  return (
    <Layout.Horizontal flex={{ distribution: 'space-between', align: 'center-center' }}>
      <Text>{getFlags(segment.identifier).length} flags</Text>
      <Container
        style={{ textAlign: 'right' }}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      >
        <Button
          minimal
          icon="Options"
          iconProps={{ size: 24 }}
          tooltip={
            <Menu style={{ minWidth: 'unset' }}>
              <Menu.Item icon="edit" text={getString('edit')} onClick={() => onEdit(segment.identifier)} />
              <Menu.Item icon="cross" text={getString('delete')} onClick={openDialog} />
            </Menu>
          }
          tooltipProps={{ isDark: true, interactionKind: 'click' }}
        />
      </Container>
    </Layout.Horizontal>
  )
})

interface TargetSegmentsProps {
  segments: Segment[]
  flags: Feature[]
  pagination?: {
    itemCount: number
    pageCount: number
    pageIndex: number
    pageSize: number
    gotoPage: (pageNumber: number) => void
  }
  project: string
  environment: string
  accountId: string
  orgIdentifier: string
  onCreateSegment: () => void
  onDeleteSegment: () => void
}

const TargetSegmentsView: React.FC<TargetSegmentsProps> = ({
  segments,
  flags,
  pagination,
  project,
  environment,
  orgIdentifier,
  accountId,
  onCreateSegment,
  onDeleteSegment
}) => {
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()
  const getPageString = (key: string) => getString(`cf.targets.${key}`)
  const { mutate: deleteSegment } = useDeleteSegment({
    queryParams: {
      account: accountId,
      org: orgIdentifier,
      environment: environment,
      project
    }
  })
  const history = useHistory()

  const handleRowClick = ({ identifier }: { identifier: string }) => {
    history.push(
      routes.toCFSegmentDetails({
        segmentIdentifier: identifier,
        projectIdentifier: project,
        environmentIdentifier: environment,
        orgIdentifier,
        accountId
      })
    )
  }

  const handleEdit = (identifier: string) => handleRowClick({ identifier })

  const handleDelete = (id: string) => {
    deleteSegment(id)
      .then(() => {
        showSuccess(`Successfuly deleted segment with id ${id}`)
        onDeleteSegment()
      })
      .catch(err => {
        showError(get(err, 'data.message', err?.message))
      })
  }

  type CustomColumn<T extends Record<string, any>> = Column<T>
  const columnDefs: CustomColumn<Segment>[] = useMemo(
    () => [
      {
        Header: getString('cf.segments.create').toLocaleUpperCase(),
        accessor: 'name',
        width: '30%'
      },
      {
        Header: getString('cf.segments.targetDefinition').toLocaleUpperCase(),
        accessor: () => '',
        width: '30%'
      },
      {
        Header: getString('cf.segments.usingSegment').toLocaleUpperCase(),
        id: 'usedBy',
        Cell: UsedByCell,
        width: '40%',
        actions: {
          onEdit: handleEdit,
          onDelete: handleDelete,
          getFlags: (id: string) =>
            flags?.filter(f => f.envProperties?.variationMap?.find(vm => vm.targetSegments?.find(ts => ts === id))) ||
            []
        }
      }
    ],
    [flags, handleEdit, handleDelete]
  )

  return (
    <>
      <Container className={css.header}>
        <CreateTargetSegmentModal project={project} environment={environment} onCreate={onCreateSegment} />
      </Container>
      <Container flex className={css.content}>
        {!!segments?.length && (
          <Table<Segment>
            className={css.table}
            columns={columnDefs}
            data={segments}
            pagination={pagination}
            onRowClick={handleRowClick}
          />
        )}
        {(segments?.length === 0 && (
          <Text style={{ margin: '0 auto' }} padding="huge">
            {getPageString('noSegmentFound')}
          </Text>
        )) ||
          null}
      </Container>
    </>
  )
}

export default TargetSegmentsView
