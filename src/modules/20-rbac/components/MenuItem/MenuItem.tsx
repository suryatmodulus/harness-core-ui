import React from 'react'
import { pick } from 'lodash-es'
import { IMenuItemProps, Menu, MenuItem, PopoverInteractionKind } from '@blueprintjs/core'
import { Popover } from '@wings-software/uicore'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import { useFeature } from '@common/hooks/useFeatures'
import type { FeatureProps } from 'framework/featureStore/FeaturesContext'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { getTooltip } from '@rbac/utils/utils'
import css from './MenuItem.module.scss'

export interface RbacMenuItemProps extends IMenuItemProps {
  permission: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  featureProps?: FeatureProps
}

const RbacMenuItem: React.FC<RbacMenuItemProps> = ({ permission: permissionRequest, featureProps, ...restProps }) => {
  const [canDoAction] = usePermission(
    {
      ...pick(permissionRequest, ['resourceScope', 'resource', 'options']),
      permissions: [permissionRequest.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )

  const { enabled: featureEnabled, featureDetail } = useFeature({
    featureRequest: featureProps?.featureRequest
  })

  const module = featureDetail?.moduleType && (featureDetail.moduleType.toLowerCase() as Module)

  const tooltipProps = getTooltip({ permissionRequest, featureProps, canDoAction, featureEnabled, module })
  const { tooltip } = tooltipProps

  if (canDoAction && featureEnabled) {
    return <Menu.Item {...restProps} />
  }

  return (
    <Popover
      openOnTargetFocus={false}
      fill
      usePortal
      interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
      hoverCloseDelay={50}
      content={tooltip}
      className={css.popover}
      inheritDarkTheme={false}
    >
      <div
        onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
          event.stopPropagation()
        }}
      >
        <MenuItem {...restProps} disabled />
      </div>
    </Popover>
  )
}

export default RbacMenuItem
