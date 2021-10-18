import React from 'react'
import { pick } from 'lodash-es'
import { AvatarGroup, AvatarGroupProps } from '@wings-software/uicore'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import { useFeature } from '@common/hooks/useFeatures'
import type { FeatureProps } from 'framework/featureStore/FeaturesContext'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { getTooltip } from '@rbac/utils/utils'

interface RbacAvatarGroupProps extends AvatarGroupProps {
  permission?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  disabled?: boolean
  featureProps?: FeatureProps
}

const RbacAvatarGroup: React.FC<RbacAvatarGroupProps> = ({
  permission: permissionRequest,
  featureProps,
  ...restProps
}) => {
  const [canDoAction] = usePermission(
    {
      ...pick(permissionRequest, ['resourceScope', 'resource', 'options']),
      permissions: [permissionRequest?.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )

  const { enabled: featureEnabled, featureDetail } = useFeature({
    featureRequest: featureProps?.featureRequest
  })

  const module = featureDetail?.moduleType && (featureDetail.moduleType.toLowerCase() as Module)

  const tooltipProps = getTooltip({ permissionRequest, featureProps, canDoAction, featureEnabled, module })
  const { tooltip } = tooltipProps

  const disabledTooltip = restProps.onAddTooltip && restProps.disabled ? restProps.onAddTooltip : undefined

  const enabled = canDoAction && featureEnabled

  return (
    <AvatarGroup
      {...restProps}
      onAddTooltip={enabled ? disabledTooltip : tooltip}
      onAdd={event => {
        if (enabled && !restProps.disabled) {
          restProps.onAdd?.(event)
        } else {
          event.stopPropagation()
        }
      }}
    />
  )
}

export default RbacAvatarGroup
