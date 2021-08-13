import React, { useState } from 'react'
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { Color, Button } from '@wings-software/uicore'
import { useConfirmationDialog } from '@common/exports'
import { String, useStrings } from 'framework/strings'
import ToggleMonitoring from '@cv/pages/monitored-service/component/toggleMonitoring/ToggleMonitoring'

export interface ContextMenuActionsProps {
  onEdit?(): void
  onDelete?(): void
  onToggleMonitoredServiceData?: {
    refetch: () => void
    identifier: string
    enabled: boolean
  }
  titleText: string
  contentText: string
}

export default function ContextMenuActions({
  onEdit,
  onDelete,
  onToggleMonitoredServiceData,
  titleText,
  contentText
}: ContextMenuActionsProps): JSX.Element {
  const { getString } = useStrings()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { openDialog } = useConfirmationDialog({
    titleText,
    contentText,
    confirmButtonText: getString('delete'),
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
          {!!onEdit && <MenuItem icon="edit" text={<String stringID="edit" />} onClick={onEdit} />}
          {!!onDelete && (
            <MenuItem
              icon="trash"
              text={<String stringID="delete" />}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                openDialog()
              }}
            />
          )}

          {!!onToggleMonitoredServiceData && (
            <>
              <Menu.Divider />
              <MenuItem
                text={<String stringID="cv.turnService" />}
                labelElement={
                  <ToggleMonitoring
                    refetch={onToggleMonitoredServiceData.refetch}
                    identifier={onToggleMonitoredServiceData.identifier}
                    enable={onToggleMonitoredServiceData.enabled}
                  />
                }
              ></MenuItem>
            </>
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
