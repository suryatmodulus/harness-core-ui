import React, { createContext, useContext, useState, useCallback } from 'react'
import { isEqual, get } from 'lodash-es'
import debounce from 'p-debounce'
import produce from 'immer'

import { useGetAccessControlList, PermissionCheck, AccessControl } from 'services/rbac'

type Permissions = Map<string, boolean>

export interface PermissionRequestOptions {
  skipCache?: boolean
}

export interface PermissionsContextProps {
  permissions: Permissions
  requestPermission: (permissionRequest?: PermissionCheck, options?: PermissionRequestOptions) => void
  checkPermission: (permissionRequest: PermissionCheck) => boolean
  cancelRequest: (permissionRequest: PermissionCheck) => void
}

export const PermissionsContext = createContext<PermissionsContextProps>({
  permissions: new Map<string, boolean>(),
  requestPermission: () => void 0,
  checkPermission: () => false,
  cancelRequest: () => void 0
})

export function usePermissionsContext(): PermissionsContextProps {
  return useContext(PermissionsContext)
}

interface PermissionsProviderProps {
  debounceWait?: number
}

export const keysToCompare = [
  'resourceScope.accountIdentifier',
  'resourceScope.orgIdentifier',
  'resourceScope.projectIdentifier',
  'resourceType',
  'resourceIdentifier',
  'permission'
]

export const getStringKeyFromObjectValues = (
  permissionRequest: PermissionCheck,
  keys: string[],
  glue = '/'
): string => {
  // pick specific keys, get their values, and join with a `/`
  return keys
    .map(key => get(permissionRequest, key))
    .filter(value => value)
    .join(glue)
}

let pendingRequests: PermissionCheck[] = []

export function PermissionsProvider(props: React.PropsWithChildren<PermissionsProviderProps>): React.ReactElement {
  const { debounceWait = 50 } = props
  const [permissions, setPermissions] = useState<Permissions>(new Map<string, boolean>())

  const { mutate: getPermissions } = useGetAccessControlList({})
  const debouncedGetPermissions = useCallback(debounce(getPermissions, debounceWait), [getPermissions, debounceWait])

  // this function is called from `usePermission` hook for every resource user is interested in
  // collect all requests until `debounceWait` is triggered
  async function requestPermission(
    permissionRequest?: PermissionCheck,
    options?: PermissionRequestOptions
  ): Promise<void> {
    if (!permissionRequest) return

    const { skipCache = false } = options || {}

    // exit early if we already fetched this permission before
    // disabling this will disable caching, because it will make a fresh request and update in the store
    if (!skipCache && permissions.has(getStringKeyFromObjectValues(permissionRequest, keysToCompare))) {
      return
    }

    // check if this request is already queued
    if (!pendingRequests.find(req => isEqual(req, permissionRequest))) {
      pendingRequests.push(permissionRequest)
    }

    try {
      // try to fetch the permissions after waiting for `debounceWait` ms
      const res = await debouncedGetPermissions({
        permissions: pendingRequests
      })

      // clear pending requests after API call
      pendingRequests = []

      // `p-debounce` package ensure all debounced promises are resolved at this stage
      setPermissions(oldPermissions => {
        return produce(oldPermissions, draft => {
          // find the current request in aggregated response
          const hasAccess = !!res.data?.accessControlList?.find((perm: AccessControl) =>
            isEqual(perm, permissionRequest)
          )?.permitted

          // update current request in the map
          draft.set(getStringKeyFromObjectValues(permissionRequest, keysToCompare), hasAccess)
        })
      })
    } catch (err) {
      // clear pending requests even if api fails
      pendingRequests = []
    }
  }

  function checkPermission(permissionRequest: PermissionCheck): boolean {
    const permission = permissions.get(getStringKeyFromObjectValues(permissionRequest, keysToCompare))
    // only use map value if it's defined. absence of data doesn't mean permission denied.
    if (typeof permission === 'boolean') return permission
    else return true
  }

  function cancelRequest(permissionRequest: PermissionCheck): void {
    // remove any matching requests
    pendingRequests = pendingRequests.filter(req => !isEqual(req, permissionRequest))
  }

  return (
    <PermissionsContext.Provider value={{ permissions, requestPermission, checkPermission, cancelRequest }}>
      {props.children}
    </PermissionsContext.Provider>
  )
}
