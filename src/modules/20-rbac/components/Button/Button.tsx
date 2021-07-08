import React from 'react'
import { pick } from 'lodash-es'
import { Button as CoreButton, ButtonProps as CoreButtonProps } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

interface ButtonProps extends CoreButtonProps {
  permission: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
}

const RbacButton: React.FC<ButtonProps> = ({ permission: permissionRequest, tooltipProps, ...restProps }) => {
  const [canDoAction] = usePermission(
    {
      ...pick(permissionRequest, ['resourceScope', 'resource', 'options']),
      permissions: [permissionRequest.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )

  return (
    <CoreButton
      {...restProps}
      disabled={restProps.disabled || !canDoAction}
      tooltip={
        !canDoAction ? (
          <RBACTooltip
            permission={permissionRequest.permission}
            resourceType={permissionRequest.resource.resourceType}
            resourceScope={permissionRequest.resourceScope}
          />
        ) : restProps.tooltip ? (
          restProps.tooltip
        ) : undefined
      }
      tooltipProps={
        !canDoAction ? { hoverCloseDelay: 50, interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY } : tooltipProps
      }
    />
  )
}

export default RbacButton
