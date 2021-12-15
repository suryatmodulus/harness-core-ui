import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@common/interfaces/ResourceInterface'

const mockPermission: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier } = {
  resource: { resourceType: ResourceType.FEATUREFLAG },
  permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
}

export default mockPermission
