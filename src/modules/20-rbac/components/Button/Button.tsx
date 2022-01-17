/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { pick } from 'lodash-es'
import { Button as CoreButton, ButtonProps as CoreButtonProps } from '@harness/uicore'
import { PopoverInteractionKind, Classes } from '@blueprintjs/core'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import { useGetFirstDisabledFeature } from '@common/hooks/useFeatures'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { FeaturesProps } from 'framework/featureStore/featureStoreUtil'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'

export interface ButtonProps extends CoreButtonProps {
  permission?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  featuresProps?: FeaturesProps & { warningMessage?: string }
}

export interface BtnProps {
  disabled: boolean
  tooltip?: ReactElement
  darkTheme?: boolean
}

const RbacButton: React.FC<ButtonProps> = ({
  permission: permissionRequest,
  featuresProps,
  tooltipProps,
  ...restProps
}) => {
  const [canDoAction] = usePermission(
    {
      ...pick(permissionRequest, ['resourceScope', 'resource', 'options']),
      permissions: [permissionRequest?.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )

  const { featureEnabled, disabledFeatureName } = useGetFirstDisabledFeature(featuresProps?.featuresRequest)

  function getBtnProps(): BtnProps {
    // if permission check override the priorirty
    if (featuresProps?.isPermissionPrioritized && permissionRequest && !canDoAction) {
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
    if (featuresProps?.featuresRequest && disabledFeatureName) {
      return {
        disabled: true,
        darkTheme: false,
        tooltip: (
          <FeatureWarningTooltip
            featureName={disabledFeatureName as FeatureIdentifier}
            warningMessage={featuresProps.warningMessage}
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

  if (!featuresProps?.featuresRequest && !permissionRequest) {
    return <CoreButton {...restProps} tooltipProps={tooltipProps} />
  }

  const btnProps = getBtnProps()
  const { disabled, tooltip, darkTheme } = btnProps

  return (
    <CoreButton
      {...restProps}
      disabled={restProps.disabled || disabled}
      tooltip={disabled ? tooltip : restProps.tooltip ? restProps.tooltip : undefined}
      tooltipProps={
        disabled
          ? {
              hoverCloseDelay: 50,
              className: darkTheme ? Classes.DARK : undefined,
              interactionKind: featureEnabled ? PopoverInteractionKind.HOVER_TARGET_ONLY : PopoverInteractionKind.HOVER
            }
          : tooltipProps
      }
    />
  )
}

export default RbacButton
