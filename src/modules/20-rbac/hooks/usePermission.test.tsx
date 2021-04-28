import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { PermissionCheck } from 'services/rbac'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionsProvider } from '@rbac/interfaces/PermissionsContext'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { getDTOFromRequest, usePermission } from './usePermission'
import mocks from './permissionMocks.json'

jest.useFakeTimers()

describe('getDTOFromRequest', () => {
  test('create in account scope', () => {
    expect(
      getDTOFromRequest({
        permission: PermissionIdentifier.UPDATE_SECRET,
        resourceScope: { accountIdentifier: 'account' }
      })
    ).toMatchObject({
      permission: PermissionIdentifier.UPDATE_SECRET,
      resourceType: ResourceType.ACCOUNT,
      resourceIdentifier: 'account'
    } as PermissionCheck)
  })

  test('create in org scope', () => {
    expect(
      getDTOFromRequest({
        permission: PermissionIdentifier.UPDATE_SECRET,
        resourceScope: { accountIdentifier: 'account', orgIdentifier: 'org' }
      })
    ).toMatchObject({
      permission: PermissionIdentifier.UPDATE_SECRET,
      resourceType: ResourceType.ORGANIZATION,
      resourceIdentifier: 'org'
    } as PermissionCheck)
  })

  test('create in project scope', () => {
    expect(
      getDTOFromRequest({
        permission: PermissionIdentifier.UPDATE_SECRET,
        resourceScope: { accountIdentifier: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }
      })
    ).toMatchObject({
      permission: PermissionIdentifier.UPDATE_SECRET,
      resourceType: ResourceType.PROJECT,
      resourceIdentifier: 'project'
    } as PermissionCheck)
  })

  test('edit in account scope', () => {
    expect(
      getDTOFromRequest({
        resourceScope: {
          accountIdentifier: 'account'
        },
        resource: {
          resourceType: ResourceType.SECRET,
          resourceIdentifier: 'secret'
        },
        permission: PermissionIdentifier.UPDATE_SECRET
      })
    ).toMatchObject({
      resourceScope: {
        accountIdentifier: 'account'
      },
      resourceType: ResourceType.SECRET,
      resourceIdentifier: 'secret',
      permission: PermissionIdentifier.UPDATE_SECRET
    } as PermissionCheck)
  })

  test('edit in org scope', () => {
    expect(
      getDTOFromRequest({
        resourceScope: {
          accountIdentifier: 'account',
          orgIdentifier: 'org'
        },
        resource: {
          resourceType: ResourceType.SECRET,
          resourceIdentifier: 'secret'
        },
        permission: PermissionIdentifier.UPDATE_SECRET
      })
    ).toMatchObject({
      resourceScope: {
        accountIdentifier: 'account',
        orgIdentifier: 'org'
      },
      resourceType: ResourceType.SECRET,
      resourceIdentifier: 'secret',
      permission: PermissionIdentifier.UPDATE_SECRET
    } as PermissionCheck)
  })

  test('edit in project scope', () => {
    expect(
      getDTOFromRequest({
        resourceScope: {
          accountIdentifier: 'account',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        },
        resource: {
          resourceType: ResourceType.SECRET,
          resourceIdentifier: 'secret'
        },
        permission: PermissionIdentifier.UPDATE_SECRET
      })
    ).toMatchObject({
      resourceScope: {
        accountIdentifier: 'account',
        orgIdentifier: 'org',
        projectIdentifier: 'project'
      },
      resourceType: ResourceType.SECRET,
      resourceIdentifier: 'secret',
      permission: PermissionIdentifier.UPDATE_SECRET
    } as PermissionCheck)
  })
})

const getPermissions = jest.fn(() => mocks.one)

jest.mock('services/rbac', () => {
  return {
    useGetAccessControlList: jest.fn(() => {
      return {
        mutate: getPermissions
      }
    })
  }
})

describe('usePermission', () => {
  test('when RBAC is disabled', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <AppStoreContext.Provider
        value={{
          featureFlags: { NG_RBAC_ENABLED: false },
          currentUserInfo: {},
          updateAppStore: jest.fn()
        }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </AppStoreContext.Provider>
    )
    const { result } = renderHook(
      () =>
        usePermission({
          resourceScope: { accountIdentifier: 'dummy' },
          permissions: [PermissionIdentifier.CREATE_PROJECT]
        }),
      { wrapper }
    )

    jest.runAllTimers()

    // should return true without making API call
    expect(getPermissions).not.toHaveBeenCalled()
    expect(result.current[0]).toBe(true)
  })

  test('when skipCondition is true', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <AppStoreContext.Provider
        value={{
          featureFlags: { NG_RBAC_ENABLED: true },
          currentUserInfo: {},
          updateAppStore: jest.fn()
        }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </AppStoreContext.Provider>
    )
    const { result } = renderHook(
      () =>
        usePermission({
          resourceScope: { accountIdentifier: 'dummy' },
          permissions: [PermissionIdentifier.CREATE_PROJECT],
          options: {
            skipCondition: () => true
          }
        }),
      { wrapper }
    )

    jest.runAllTimers()

    // should return true without making API call
    expect(getPermissions).not.toHaveBeenCalled()
    expect(result.current[0]).toBe(true)
  })

  test('basic function', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <AppStoreContext.Provider
        value={{
          featureFlags: { NG_RBAC_ENABLED: true },
          currentUserInfo: {},
          updateAppStore: jest.fn()
        }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </AppStoreContext.Provider>
    )
    const { result, waitForNextUpdate } = renderHook(
      () =>
        usePermission({
          resourceScope: { accountIdentifier: 'dummy', orgIdentifier: 'default' },
          resource: {
            resourceIdentifier: 'nextgenui',
            resourceType: ResourceType.PROJECT
          },
          permissions: [PermissionIdentifier.UPDATE_PROJECT, PermissionIdentifier.DELETE_PROJECT]
        }),
      { wrapper }
    )

    // should return true before API call completes
    expect(result.current[0]).toBe(true)
    expect(result.current[1]).toBe(true)

    jest.runAllTimers()
    await waitForNextUpdate()

    // should return actual value after API call completes
    expect(result.current[0]).toBe(true)
    expect(result.current[1]).toBe(false)
  })
})
