import { Classes, Menu, Position } from '@blueprintjs/core'
import { Button, Popover } from '@wings-software/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import { useStrings } from 'framework/strings'
import { ResourceGroupDTO, ResourceGroupResponse, useDeleteResourceGroup } from 'services/platform'
import { useConfirmationDialog, useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import css from './ResourceGroupList.module.scss'
export type CellPropsResourceGroupColumn<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & {
    reload?: () => Promise<void>
    openResourceGroupModal?: (resourceGroup: ResourceGroupDTO) => void
  }
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}
const ResourceGroupColumnMenu: Renderer<CellPropsResourceGroupColumn<ResourceGroupResponse>> = ({ row, column }) => {
  const data = row.original
  const isHarnessManaged = data.harnessManaged
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { mutate: deleteResourceGroup } = useDeleteResourceGroup({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const { openDialog } = useConfirmationDialog({
    contentText: `${getString('resourceGroup.confirmDelete', { name: data.resourceGroup?.name })}`,
    titleText: getString('resourceGroup.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteResourceGroup(data.resourceGroup?.identifier || '', {
            headers: { 'content-type': 'application/json' }
          })
          if (deleted) showSuccess(getString('resourceGroup.deletedMessage', { name: data.resourceGroup?.name }))
          column.reload?.()
        } catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!data?.resourceGroup?.identifier) return
    openDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!row.original?.resourceGroup?.identifier) {
      return
    }
    column.openResourceGroupModal?.(row.original.resourceGroup)
  }
  return !isHarnessManaged ? (
    <Popover
      isOpen={menuOpen}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
    >
      <Button
        data-testid={`resourceGroupDetailsEditMenu${data.resourceGroup?.identifier}`}
        minimal
        icon="Options"
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(true)
        }}
      />
      <Menu style={{ minWidth: 'unset' }}>
        <Menu.Item icon="edit" text={getString('edit')} onClick={handleEdit} />
        <Menu.Item icon="trash" text={getString('delete')} onClick={handleDelete} />
      </Menu>
    </Popover>
  ) : (
    <div className={css.placeHolderDiv}></div>
  )
}
export default ResourceGroupColumnMenu
