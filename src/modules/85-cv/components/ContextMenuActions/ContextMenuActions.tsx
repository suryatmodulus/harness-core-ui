import React, { useState } from 'react'
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { Color, Button, ButtonVariation } from '@wings-software/uicore'
import { useConfirmationDialog } from '@common/exports'
import { String, useStrings } from 'framework/strings'
import type { ContextMenuActionsProps } from '@cv/pages/monitored-service/CVMonitoredServiceListingPage.types'

export default function ContextMenuActions({
  onEdit,
  onDelete,
  titleText,
  contentText,
  confirmButtonText,
  deleteLabel,
  editLabel
}: ContextMenuActionsProps): JSX.Element {
  const { getString } = useStrings()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { openDialog } = useConfirmationDialog({
    titleText,
    contentText,
    confirmButtonText: confirmButtonText ?? getString('delete'),
    cancelButtonText: getString('cancel'),
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
      content={
        <Menu>
          {!!onEdit && <MenuItem icon="edit" text={editLabel ?? <String stringID="edit" />} onClick={onEdit} />}
          {!!onDelete && (
            <MenuItem
              icon="trash"
              text={deleteLabel ?? <String stringID="delete" />}
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
        icon="Options"
        color={Color.GREY_350}
        onClick={e => {
          e.stopPropagation()
          if (!!onEdit || !!onDelete) {
            setPopoverOpen(!popoverOpen)
          }
        }}
        variation={ButtonVariation.ICON}
      />
    </Popover>
  )
}
