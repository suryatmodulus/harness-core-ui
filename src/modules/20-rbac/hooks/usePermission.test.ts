import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { PermissionCheck } from 'services/rbac'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { getDTOFromRequest } from './usePermission'

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
