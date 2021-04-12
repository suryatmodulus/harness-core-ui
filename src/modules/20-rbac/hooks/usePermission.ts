import { omit, pick } from 'lodash-es'

import { useDeepCompareEffect } from '@common/hooks'
import { usePermissionsContext, PermissionRequestOptions } from '@rbac/interfaces/PermissionsContext'
import type { PermissionCheck, ResourceScope } from 'services/rbac'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ResourceType } from '@rbac/interfaces/ResourceType'

export interface Resource {
  resourceType: ResourceType
  resourceIdentifier: string
}

export interface PermissionRequest {
  resourceScope: ResourceScope
  resource?: Resource
  permission: PermissionIdentifier
}

export interface PermissionsRequest {
  resourceScope: ResourceScope
  resource?: Resource
  permissions: PermissionIdentifier[]
  options?: PermissionRequestOptions
}

export function getDTOFromRequest(permissionRequest: PermissionRequest): PermissionCheck | undefined {
  const { resource, resourceScope, permission } = permissionRequest
  if (!resource) {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    if (projectIdentifier) {
      return {
        resourceType: ResourceType.PROJECT,
        resourceIdentifier: projectIdentifier,
        resourceScope: {
          accountIdentifier,
          orgIdentifier
        },
        permission
      }
    } else if (orgIdentifier) {
      return {
        resourceType: ResourceType.ORGANIZATION,
        resourceIdentifier: orgIdentifier,
        resourceScope: { accountIdentifier },
        permission
      }
    }
    return {
      resourceType: ResourceType.ACCOUNT,
      resourceIdentifier: accountIdentifier as string,
      resourceScope: {},
      permission
    }
  }
  return {
    resourceScope,
    ...resource,
    permission
  }
}

export function usePermission(permissionsRequest: PermissionsRequest, deps: Array<any> = []): Array<boolean> {
  const { NG_RBAC_ENABLED } = useFeatureFlags()
  const { requestPermission, checkPermission, cancelRequest } = usePermissionsContext()
  const { options } = permissionsRequest

  useDeepCompareEffect(() => {
    if (NG_RBAC_ENABLED) {
      // generate PermissionRequest for every action user requested
      permissionsRequest.permissions.forEach(permission => {
        const permissionCheckDto = getDTOFromRequest({
          permission,
          ...pick(permissionsRequest, ['resourceScope', 'resource'])
        } as PermissionRequest)
        // register request in the context
        requestPermission(permissionCheckDto, options)
      })
    }

    return () => {
      if (NG_RBAC_ENABLED) {
        // cancel above request when this hook instance is unmounting
        permissionsRequest.permissions.forEach(permissionIdentifier => {
          cancelRequest({
            ...omit(permissionsRequest, 'permissions'),
            permission: permissionIdentifier
          } as PermissionCheck)
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // hook should return boolean for every action requested, in same order
  return permissionsRequest.permissions.map(permission =>
    NG_RBAC_ENABLED
      ? checkPermission({
          ...omit(permissionsRequest, 'permissions'),
          permission
        } as PermissionCheck)
      : true
  )
}
