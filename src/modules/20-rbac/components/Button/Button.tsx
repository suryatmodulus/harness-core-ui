import React, { ReactElement } from 'react'
import { pick } from 'lodash-es'
import { Button as CoreButton, ButtonProps as CoreButtonProps } from '@wings-software/uicore'
import { PopoverInteractionKind, Classes } from '@blueprintjs/core'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import { useFeature } from '@common/hooks/useFeatures'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { FeatureProps } from 'framework/featureStore/featureStoreUtil'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
// import { useStrings } from 'framework/strings'
// import type { FeatureProps } from 'framework/featureStore/FeaturesContext'
// import { FeatureWarningTooltip, DescriptionMap } from '@common/components/FeatureWarning/FeatureWarning'

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
  const { getString } = useStrings()
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
      const descriptionString =
        featureProps?.featureRequest.featureName && DescriptionMap[featureProps.featureRequest.featureName]

      return {
        disabled: true,
        tooltip: (
          <FeatureWarningTooltip
            darkTheme={true}
            featureName={featureProps?.featureRequest.featureName}
            description={(descriptionString && getString(descriptionString)) || ''}
          />
        )
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
      className={Classes.DARK}
      disabled={restProps.disabled || disabled}
      tooltip={disabled ? tooltip : restProps.tooltip ? restProps.tooltip : undefined}
      tooltipProps={
        disabled
          ? {
              hoverCloseDelay: 50,
              className: Classes.DARK,
              interactionKind: featureEnabled ? PopoverInteractionKind.HOVER_TARGET_ONLY : PopoverInteractionKind.HOVER
            }
          : tooltipProps
      }
    />
  )
}

export default RbacButton
