import React from 'react'
import { IconName, Menu, Position } from '@blueprintjs/core'
import { Popover } from '@wings-software/uicore'
import type { PopoverProps } from '@wings-software/uicore/dist/components/Popover/Popover'
import { useParams } from 'react-router-dom'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import css from './TemplatesActionPopover.module.scss'

export interface TemplatesActionPopoverProps extends PopoverProps {
  open?: boolean
  items?: {
    icon?: IconName
    label: string
    onClick: () => void
  }[]
  setMenuOpen: (flag: boolean) => void
  className?: string
}
export const TemplatesActionPopover = (props: React.PropsWithChildren<TemplatesActionPopoverProps>) => {
  const { items, open, children, setMenuOpen, className, content, ...popoverProps } = props
  const { accountId, orgIdentifier, projectIdentifier, templateIdentifier } = useParams<TemplateStudioPathProps>()

  const [canAddNewTemplate] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.TEMPLATE,
        resourceIdentifier: templateIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_TEMPLATE]
    },
    [accountId, orgIdentifier, projectIdentifier, templateIdentifier]
  )

  return (
    <Popover
      isOpen={open}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      position={Position.BOTTOM_RIGHT}
      className={className}
      popoverClassName={css.popOver}
      disabled={!canAddNewTemplate}
      {...popoverProps}
    >
      {children}
      {content ? (
        content
      ) : items ? (
        <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
          {items?.map(item => {
            return (
              <Menu.Item
                icon={item.icon}
                text={item.label}
                key={item.label}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  item.onClick()
                  setMenuOpen(false)
                }}
              />
            )
          })}
        </Menu>
      ) : null}
    </Popover>
  )
}
