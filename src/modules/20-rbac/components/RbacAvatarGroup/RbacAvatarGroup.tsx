import React from 'react'
import { pick } from 'lodash-es'
import { AvatarGroup, AvatarGroupProps } from '@wings-software/uicore'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

interface RbacAvatarGroupProps extends AvatarGroupProps {
  permission: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  disabled?: boolean
}

const RbacAvatarGroup: React.FC<RbacAvatarGroupProps> = ({ permission: permissionRequest, ...restProps }) => {
  const [canDoAction] = usePermission(
    {
      ...pick(permissionRequest, ['resourceScope', 'resource', 'options']),
      permissions: [permissionRequest.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )

  const disabledTooltip = restProps.onAddTooltip && restProps.disabled ? restProps.onAddTooltip : undefined

  return (
    <AvatarGroup
      {...restProps}
      onAddTooltip={
        canDoAction ? (
          disabledTooltip
        ) : (
          <RBACTooltip
            permission={permissionRequest.permission}
            resourceType={permissionRequest.resource.resourceType}
            resourceScope={permissionRequest.resourceScope}
          />
        )
      }
      onAdd={event => {
        if (canDoAction && !restProps.disabled) restProps.onAdd?.(event)
        else event.stopPropagation()
      }}
    />
  )
}

export default RbacAvatarGroup
