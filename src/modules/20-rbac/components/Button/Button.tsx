import React from 'react'
import { Button as CoreButton, ButtonProps as CoreButtonProps } from '@wings-software/uicore'

import { usePermission, PermissionsRequest, PermissionRequest } from '@rbac/hooks/usePermission'
import { useStrings } from 'framework/exports'

interface ButtonProps extends CoreButtonProps {
  permission: PermissionRequest
}

const RbacButton: React.FC<ButtonProps> = ({ permission: permissionRequest, ...restProps }) => {
  const { getString } = useStrings()
  const [canDoAction] = usePermission(
    {
      resourceScope: permissionRequest.resourceScope,
      resource: permissionRequest.resource,
      permissions: [permissionRequest.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )

  return (
    <CoreButton
      {...restProps}
      disabled={restProps.disabled || !canDoAction}
      tooltip={!canDoAction ? getString('noPermission') : undefined}
    />
  )
}

export default RbacButton
