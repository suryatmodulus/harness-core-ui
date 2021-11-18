import React, { ReactElement } from 'react'
import { pick } from 'lodash-es'
import { Button as CoreButton, ButtonProps as CoreButtonProps } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import { useFeature } from '@common/hooks/useFeatures'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { FeatureProps } from 'framework/featureStore/featureStoreUtil'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'

export interface ButtonProps extends CoreButtonProps {
  permission?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  featureProps?: FeatureProps
}

export interface BtnProps {
  disabled: boolean
  tooltip?: ReactElement
}

const RbacButton: React.FC<ButtonProps> = ({
  permission: permissionRequest,
  featureProps,
  tooltipProps,
  ...restProps
}) => {
  const { enabled: featureEnabled } = useFeature({
    featureRequest: featureProps?.featureRequest
  })
  const [canDoAction] = usePermission(
    {
      ...pick(permissionRequest, ['resourceScope', 'resource', 'options']),
      permissions: [permissionRequest?.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )

  function getBtnProps(): BtnProps {
    // if permission check override the priorirty
    if (featureProps?.isPermissionPrioritized && permissionRequest && !canDoAction) {
      return {
        disabled: true,
        tooltip: (
          <RBACTooltip
            permission={permissionRequest.permission}
            resourceType={permissionRequest.resource.resourceType}
            resourceScope={permissionRequest.resourceScope}
          />
        )
      }
    }

    // feature check by default take priority
    if (featureProps?.featureRequest && !featureEnabled) {
      return {
        disabled: true,
        tooltip: <FeatureWarningTooltip featureName={featureProps?.featureRequest.featureName} />
      }
    }

    // permission check
    if (permissionRequest && !canDoAction) {
      return {
        disabled: true,
        tooltip: (
          <RBACTooltip
            permission={permissionRequest.permission}
            resourceType={permissionRequest.resource.resourceType}
            resourceScope={permissionRequest.resourceScope}
          />
        )
      }
    }

    return {
      disabled: false
    }
  }

  if (!featureProps?.featureRequest && !permissionRequest) {
    return <CoreButton {...restProps} tooltipProps={tooltipProps} />
  }

  const btnProps = getBtnProps()
  const { disabled, tooltip } = btnProps

  return (
    <CoreButton
      {...restProps}
      disabled={restProps.disabled || disabled}
      tooltip={disabled ? tooltip : restProps.tooltip ? restProps.tooltip : undefined}
      tooltipProps={
        disabled
          ? {
              hoverCloseDelay: 50,
              interactionKind: featureEnabled ? PopoverInteractionKind.HOVER_TARGET_ONLY : PopoverInteractionKind.HOVER
            }
          : tooltipProps
      }
    />
  )
}

export default RbacButton
