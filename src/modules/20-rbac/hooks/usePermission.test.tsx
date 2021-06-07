import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { PermissionCheck } from 'services/rbac'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionsProvider } from '@rbac/interfaces/PermissionsContext'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { getDTOFromRequest, usePermission } from './usePermission'
import mocks from './permissionMocks.json'

jest.useFakeTimers()

describe('getDTOFromRequest', () => {
  test('create in account scope', () => {
    expect(
      getDTOFromRequest(
        {
          permission: PermissionIdentifier.UPDATE_SECRET,
          resource: {
            resourceType: ResourceType.SECRET
          }
        },
        { accountIdentifier: 'account' }
      )
    ).toMatchObject({
      permission: PermissionIdentifier.UPDATE_SECRET,
      resourceType: ResourceType.SECRET,
      resourceScope: { accountIdentifier: 'account' }
    } as PermissionCheck)
  })

  test('edit in account scope', () => {
    expect(
      getDTOFromRequest(
        {
          resource: {
            resourceType: ResourceType.SECRET,
            resourceIdentifier: 'secret'
          },
          permission: PermissionIdentifier.UPDATE_SECRET
        },
        {
          accountIdentifier: 'account'
        }
      )
    ).toMatchObject({
      resourceScope: {
        accountIdentifier: 'account'
      },
      resourceType: ResourceType.SECRET,
      resourceIdentifier: 'secret',
      permission: PermissionIdentifier.UPDATE_SECRET
    } as PermissionCheck)
  })

  test('create in account scope with custom scope', () => {
    expect(
      getDTOFromRequest(
        {
          permission: PermissionIdentifier.UPDATE_SECRET,
          resource: {
            resourceType: ResourceType.SECRET
          },
          resourceScope: {
            accountIdentifier: 'account',
            orgIdentifier: 'org',
            projectIdentifier: 'project'
          }
        },
        { accountIdentifier: 'account' }
      )
    ).toMatchObject({
      permission: PermissionIdentifier.UPDATE_SECRET,
      resourceType: ResourceType.SECRET,
      resourceScope: { accountIdentifier: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }
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
  beforeEach(() => {
    getPermissions.mockClear()
  })

  test('when RBAC is disabled', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={{ featureFlags: { NG_RBAC_ENABLED: false } }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        usePermission({
          resourceScope: { accountIdentifier: 'dummy' },
          resource: {
            resourceType: ResourceType.PROJECT
          },
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
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={{ featureFlags: { NG_RBAC_ENABLED: true } }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        usePermission({
          resourceScope: { accountIdentifier: 'dummy' },
          resource: {
            resourceType: ResourceType.PROJECT
          },
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
      <TestWrapper
        path={routes.toProjects({ accountId: ':accountId' })}
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={{ featureFlags: { NG_RBAC_ENABLED: true } }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </TestWrapper>
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

    expect(getPermissions).toHaveBeenCalledWith({
      permissions: [
        {
          resourceScope: {
            accountIdentifier: 'dummy',
            orgIdentifier: 'default'
          },
          resourceType: 'PROJECT',
          resourceIdentifier: 'nextgenui',
          permission: 'core_project_edit'
        },
        {
          resourceScope: {
            accountIdentifier: 'dummy',
            orgIdentifier: 'default'
          },
          resourceType: 'PROJECT',
          resourceIdentifier: 'nextgenui',
          permission: 'core_project_delete'
        }
      ]
    })

    // should return actual value after API call completes
    expect(result.current[0]).toBe(true)
    expect(result.current[1]).toBe(false)
  })

  test('basic function with default scope', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toConnectors({
          accountId: ':accountId',
          orgIdentifier: ':orgIdentifier',
          projectIdentifier: ':projectIdentifier'
        })}
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
        defaultAppStoreValues={{ featureFlags: { NG_RBAC_ENABLED: true } }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </TestWrapper>
    )
    const { waitForNextUpdate } = renderHook(
      () =>
        usePermission({
          resource: {
            resourceIdentifier: 'connector',
            resourceType: ResourceType.CONNECTOR
          },
          permissions: [PermissionIdentifier.DELETE_CONNECTOR]
        }),
      { wrapper }
    )

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(getPermissions).toHaveBeenCalledWith({
      permissions: [
        {
          resourceScope: {
            accountIdentifier: 'account',
            orgIdentifier: 'org',
            projectIdentifier: 'project'
          },
          resourceType: 'CONNECTOR',
          resourceIdentifier: 'connector',
          permission: 'core_connector_delete'
        }
      ]
    })
  })

  test('when api has incomplete response', async () => {
    const getPermissionslocal = jest.fn(() => {
      return {}
    })

    jest.mock('services/rbac', () => {
      return {
        useGetAccessControlList: jest.fn(() => {
          return {
            mutate: getPermissionslocal
          }
        })
      }
    })

    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={{ featureFlags: { NG_RBAC_ENABLED: true } }}
      >
        <PermissionsProvider debounceWait={0}>{children}</PermissionsProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        usePermission({
          resource: {
            resourceIdentifier: 'connector',
            resourceType: ResourceType.CONNECTOR
          },
          permissions: [PermissionIdentifier.DELETE_CONNECTOR]
        }),
      { wrapper }
    )

    jest.runAllTimers()

    // should return true even when API doesn't return anything for this request
    expect(result.current[0]).toBe(true)
  })
})
