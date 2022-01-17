/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Menu, Popover, Position } from '@blueprintjs/core'
import { Color, Button, ButtonVariation, useConfirmationDialog } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import type { ContextMenuActionsProps } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'

export default function ContextMenuActions({
  onEdit,
  onDelete,
  titleText,
  contentText,
  confirmButtonText,
  deleteLabel,
  editLabel,
  RbacPermissions
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
          {!!onEdit && (
            <RbacMenuItem
              icon="edit"
              text={editLabel ?? <String stringID="edit" />}
              onClick={onEdit}
              permission={RbacPermissions?.edit}
            />
          )}
          {!!onDelete && (
            <RbacMenuItem
              icon="trash"
              text={deleteLabel ?? <String stringID="delete" />}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                openDialog()
              }}
              permission={RbacPermissions?.delete}
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
