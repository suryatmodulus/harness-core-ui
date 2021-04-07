import React, { createContext, useContext, useState } from 'react'
import { pick, values } from 'lodash-es'
import debounce from 'p-debounce'
import produce from 'immer'

import { useGetAccessControlList, PermissionCheck, AccessControl } from 'services/rbac'

type Permissions = Map<string, boolean>

export interface PermissionRequestOptions {
  skipCache?: boolean
}

export interface PermissionsContextProps {
  permissions: Permissions
  requestPermission: (permissionRequest: PermissionCheck, options?: PermissionRequestOptions) => void
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shallowCompare(obj1: any, obj2: any, keys: Array<string | number | symbol>): boolean {
  for (const key of keys) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }
  return true
}

const keysToCompare = [
  'accountIdentifier',
  'orgIdentifier',
  'projectIdentifier',
  // 'resourceType', // TODO: enable once BE adds this in HAccessControlDTO
  'resourceIdentifier',
  'permission'
]

const getStringKeyFromObjectValues = (permissionRequest: PermissionCheck, keys: string[], glue = '/'): string => {
  // pick specific keys, get their values, and join with a `/`
  return values(pick(permissionRequest, keys)).join(glue)
}

export function PermissionsProvider(props: React.PropsWithChildren<PermissionsProviderProps>): React.ReactElement {
  const { debounceWait = 50 } = props
  const [permissions, setPermissions] = useState<Permissions>(new Map<string, boolean>())

  const { mutate: getPermissions } = useGetAccessControlList({})
  const debouncedGetPermissions = debounce(getPermissions, debounceWait)

  let pendingRequests: PermissionCheck[] = []

  // this function is called from `usePermission` hook for every resource user is interested in
  // collect all requests until `debounceWait` is triggered
  async function requestPermission(
    permissionRequest: PermissionCheck,
    options?: PermissionRequestOptions
  ): Promise<void> {
    const { skipCache = false } = options || {}
    // exit early if we already fetched this permission before
    // disabling this will disable caching, because it will make a fresh request and update in the store
    if (!skipCache && permissions.has(getStringKeyFromObjectValues(permissionRequest, keysToCompare))) {
      return
    }

    // check if this request is already queued
    if (!pendingRequests.find(req => shallowCompare(req, permissionRequest, keysToCompare))) {
      pendingRequests.push(permissionRequest)
    }

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
          shallowCompare(perm, permissionRequest, keysToCompare)
        )?.permitted

        // update current request in the map
        draft.set(getStringKeyFromObjectValues(permissionRequest, keysToCompare), hasAccess)
      })
    })
  }

  function checkPermission(permissionRequest: PermissionCheck): boolean {
    return !!permissions.get(getStringKeyFromObjectValues(permissionRequest, keysToCompare))
  }

  function cancelRequest(permissionRequest: PermissionCheck): void {
    // remove any matching requests
    pendingRequests = pendingRequests.filter(req => !shallowCompare(req, permissionRequest, keysToCompare))
  }

  return (
    <PermissionsContext.Provider value={{ permissions, requestPermission, checkPermission, cancelRequest }}>
      {props.children}
    </PermissionsContext.Provider>
  )
}
