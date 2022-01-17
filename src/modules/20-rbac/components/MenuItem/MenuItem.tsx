/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { pick } from 'lodash-es'
import { IMenuItemProps, Menu, MenuItem, PopoverInteractionKind } from '@blueprintjs/core'
import { Popover } from '@wings-software/uicore'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import { useGetFirstDisabledFeature } from '@common/hooks/useFeatures'
import type { FeaturesProps } from 'framework/featureStore/featureStoreUtil'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { getTooltip } from '@rbac/utils/utils'
import css from './MenuItem.module.scss'

export interface RbacMenuItemProps extends IMenuItemProps {
  permission?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  featuresProps?: FeaturesProps
}

const RbacMenuItem: React.FC<RbacMenuItemProps> = ({ permission: permissionRequest, featuresProps, ...restProps }) => {
  const [canDoAction] = usePermission(
    {
      ...pick(permissionRequest, ['resourceScope', 'resource', 'options']),
      permissions: [permissionRequest?.permission || '']
    } as PermissionsRequest,
    [permissionRequest]
  )

  const { featureEnabled, disabledFeatureName } = useGetFirstDisabledFeature(featuresProps?.featuresRequest)

  let disabledFeatureProps
  if (disabledFeatureName) {
    disabledFeatureProps = {
      isPermissionPrioritized: featuresProps?.isPermissionPrioritized,
      featureRequest: {
        featureName: disabledFeatureName
      }
    }
  }

  const tooltipProps = getTooltip({
    permissionRequest,
    featureProps: disabledFeatureProps,
    canDoAction,
    featureEnabled
  })
  const { tooltip } = tooltipProps

  const noRequest = !featuresProps?.featuresRequest && !permissionRequest
  const enabled = canDoAction && featureEnabled

  if (noRequest || enabled) {
    return <Menu.Item {...restProps} />
  }

  return (
    <Popover
      openOnTargetFocus={false}
      fill
      usePortal
      hoverCloseDelay={50}
      interactionKind={featureEnabled ? PopoverInteractionKind.HOVER_TARGET_ONLY : PopoverInteractionKind.HOVER}
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
