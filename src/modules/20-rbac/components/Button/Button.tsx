import React from 'react'
import { pick } from 'lodash-es'
import { Button as CoreButton, ButtonProps as CoreButtonProps } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './Button.module.scss'

interface ButtonProps extends CoreButtonProps {
  permission: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
}

const RbacButton: React.FC<ButtonProps> = ({ permission: permissionRequest, ...restProps }) => {
  const [canDoAction] = usePermission(
    {
      ...pick(permissionRequest, ['resourceScope', 'resource', 'options']),
      permissions: [permissionRequest.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )
  if (canDoAction) return <CoreButton {...restProps} />
  return (
    <CoreButton
      {...restProps}
      tooltip={
        <RBACTooltip
          permission={permissionRequest.permission}
          resourceType={permissionRequest.resource.resourceType}
          resourceScope={permissionRequest.resourceScope}
        />
      }
      tooltipProps={{ hoverCloseDelay: 50, interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
      className={css.disableButton}
      onClick={e => {
        e.preventDefault()
      }}
    />
  )
}

export default RbacButton
