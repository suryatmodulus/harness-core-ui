import React, { ReactElement } from 'react'
import { ThumbnailSelect, ThumbnailSelectProps } from '@wings-software/uicore'
import type { Item } from '@wings-software/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import type { PermissionIdentifier } from 'microfrontends'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import type { FeatureProps } from 'framework/featureStore/FeaturesContext'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarning'

export interface RbacFields {
  disabled: boolean
  tooltip?: ReactElement
}

const getRbacFieldsForItem = (featureProps?: FeatureProps, featureEnabled?: boolean): RbacFields => {
  if (featureProps?.featureRequest && !featureEnabled) {
    return {
      disabled: true,
      tooltip: <FeatureWarningTooltip featureName={featureProps?.featureRequest.featureName} />
    }
  }
  return {
    disabled: false
  }
}

export interface RbacThumbnailItem extends Item {
  permission?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  featureProps?: FeatureProps
}

const ApplyRbacOnThumbnailItem = (rbacThumbnailItem: RbacThumbnailItem): Item => {
  // Use the features and permissions hooks to add the 'disabled' and 'tooltip' props to the items
  const { featureProps, ...restItemProps } = rbacThumbnailItem
  const { enabled: featureEnabled } = useFeature({
    featureRequest: featureProps?.featureRequest
  })

  const { disabled, tooltip } = getRbacFieldsForItem(featureProps, featureEnabled)

  return { ...restItemProps, tooltip, disabled: rbacThumbnailItem.disabled || disabled }
}

export interface RbacThumbnailSelectProps extends Omit<ThumbnailSelectProps, 'items'> {
  items: RbacThumbnailItem[]
}

export const RbacThumbnailSelect = (props: RbacThumbnailSelectProps) => {
  const { items: itemsWithRbacProps, ...restProps } = props
  const rbacAppliedItems = itemsWithRbacProps.map(itemWithRbacProps => ApplyRbacOnThumbnailItem(itemWithRbacProps))
  return <ThumbnailSelect items={rbacAppliedItems} {...restProps} />
}
