import React from 'react'

import type { ButtonProps } from '@wings-software/uicore'
import RbacButton from '@rbac/components/Button/Button'
import type { PermissionRequest } from '@rbac/hooks/usePermission'
import type { FeaturesProps } from 'framework/featureStore/featureStoreUtil'
import { ResourceType } from '@common/interfaces/ResourceInterface'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

interface ManagePrincipalButtonProps extends ButtonProps {
  resourceIdentifier?: string
  resourceType: ResourceType.USERGROUP | ResourceType.USER
  featuresProps?: FeaturesProps
}

const ManagePrincipalButton: React.FC<ManagePrincipalButtonProps> = ({
  resourceIdentifier,
  resourceType,
  featuresProps,
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

  return <RbacButton {...restProps} permission={permission} featuresProps={featuresProps} />
}

export default ManagePrincipalButton
