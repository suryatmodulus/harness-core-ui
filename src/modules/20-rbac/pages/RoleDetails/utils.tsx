import produce from 'immer'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceType } from '@common/interfaces/ResourceInterface'
import type { Permission, PermissionResponse } from 'services/rbac'

export const getPermissionMap = (permissionList?: PermissionResponse[]): Map<ResourceType, Permission[]> => {
  const permissionsMap: Map<ResourceType, Permission[]> = new Map()
  permissionList?.map(response => {
    if (response.permission.resourceType) {
      if (permissionsMap.has(response.permission.resourceType as ResourceType)) {
        permissionsMap.get(response.permission.resourceType as ResourceType)?.push(response.permission)
      } else permissionsMap.set(response.permission.resourceType as ResourceType, [response.permission])
    }
  })
  return permissionsMap
}

export const onPermissionChange = (
  permission: string,
  isAdd: boolean,
  permissions: string[],
  setPermissions: (value: React.SetStateAction<string[]>) => void
): void => {
  if (isAdd) {
    if (
      permission === PermissionIdentifier.EDIT_DASHBOARD ||
      permissions.indexOf(PermissionIdentifier.EDIT_DASHBOARD) !== -1
    ) {
      setPermissions(_permissions => [...permissions, permission, PermissionIdentifier.VIEW_DASHBOARD])
    } else {
      setPermissions(_permissions => [...permissions, permission])
    }
  } else if (
    !(
      permission === PermissionIdentifier.VIEW_DASHBOARD &&
      permissions.indexOf(PermissionIdentifier.EDIT_DASHBOARD) !== -1
    )
  ) {
    setPermissions(_permissions =>
      produce(_permissions, draft => {
        draft?.splice(permissions.indexOf(permission), 1)
      })
    )
  }
}
