import React, { useState } from 'react'
import { Classes, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { Color, Button } from '@wings-software/uicore'
import { useConfirmationDialog } from '@common/exports'
import { useStrings, String } from 'framework/exports'

export interface ContextMenuActionsProps {
  onEdit?(): void
  onDelete?(): void
  titleText: string
  contentText: string
}

export default function ContextMenuActions({ onEdit, onDelete, titleText, contentText }: ContextMenuActionsProps) {
  const { getString } = useStrings()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { openDialog } = useConfirmationDialog({
    titleText,
    contentText,
    confirmButtonText: getString('common.delete'),
    cancelButtonText: getString('common.cancel'),
    onCloseDialog: function (shouldDelete: boolean) {
      if (shouldDelete) {
        onDelete?.()
      }
    }
  })

  return (
    <Popover
      isOpen={popoverOpen}
      onInteraction={next => {
        setPopoverOpen(next)
      }}
      position={Position.BOTTOM}
      className={Classes.DARK}
      content={
        <Menu>
          {!!onEdit && <MenuItem icon="edit" text={<String stringID="edit" />} onClick={onEdit} />}
          {!!onDelete && (
            <MenuItem
              icon="trash"
              text={<String stringID="common.delete" />}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                openDialog()
              }}
            />
          )}
        </Menu>
      }
    >
      <Button
        minimal
        icon="main-more"
        color={Color.GREY_350}
        onClick={e => {
          e.stopPropagation()
          if (!!onEdit || !!onDelete) {
            setPopoverOpen(!popoverOpen)
          }
        }}
      />
    </Popover>
  )
}
