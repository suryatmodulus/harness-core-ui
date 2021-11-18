import React from 'react'

import type { ButtonProps } from '@wings-software/uicore'
import RbacButton from '@rbac/components/Button/Button'
import type { PermissionRequest } from '@rbac/hooks/usePermission'
import type { FeatureRequest } from 'framework/featureStore/featureStoreUtil'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

interface FeatureProps {
  featureRequest: FeatureRequest
  isPermissionPrioritized?: boolean
}

interface ManagePrincipalButtonProps extends ButtonProps {
  resourceIdentifier?: string
  resourceType: ResourceType.USERGROUP | ResourceType.USER
  featureProps?: FeatureProps
}

const ManagePrincipalButton: React.FC<ManagePrincipalButtonProps> = ({
  resourceIdentifier,
  resourceType,
  featureProps,
  ...restProps
}) => {
  const permission: PermissionRequest = {
    resource: {
      resourceType,
      resourceIdentifier
    },
    permission:
      resourceType === ResourceType.USER ? PermissionIdentifier.MANAGE_USER : PermissionIdentifier.MANAGE_USERGROUP
  }

  return <RbacButton {...restProps} permission={permission} featureProps={featureProps} />
}

export default ManagePrincipalButton
