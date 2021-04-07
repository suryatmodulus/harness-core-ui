import type { ResponseRoleResponse, ResponseSetString } from 'services/rbac'

export const resourceTypesMockData: ResponseSetString = {
  status: 'SUCCESS',
  data: ['ACCOUNT', 'ORGANIZATION', 'PROJECT', 'SECRET'],
  metaData: {},
  correlationId: '97683e83-6a8a-4e9f-9607-534cc499016f'
}

export const roleMockData: ResponseRoleResponse = {
  status: 'SUCCESS',
  data: {
    role: {
      identifier: 'identifier',
      name: 'name',
      permissions: [
        'core.project.delete',
        'core.organization.create',
        'core.organization.edit',
        'core.project.edit',
        'core.project.view',
        'core.organization.view',
        'core.project.create'
      ],
      allowedScopeLevels: ['account'],
      description: 'description',
      tags: { ui: '', dev: '' }
    },
    scope: { accountIdentifier: 'testAcc' },
    harnessManaged: false,
    createdAt: 1614260652905,
    lastModifiedAt: 1614669872800
  },
  metaData: {},
  correlationId: '3b452fb0-aa4b-4f31-979a-f0b3fd61772d'
}

export const permissionListMockData = {
  status: 'SUCCESS',
  data: [
    {
      permission: {
        identifier: 'core.project.edit',
        name: 'Edit Project',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'project', 'account'],
        resourceType: 'PROJECT',
        action: 'edit'
      }
    },
    {
      permission: {
        identifier: 'core.project.create',
        name: 'Create Project',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'account'],
        resourceType: 'PROJECT',
        action: 'create'
      }
    },
    {
      permission: {
        identifier: 'core.project.view',
        name: 'View Project',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'project', 'account'],
        resourceType: 'PROJECT',
        action: 'view'
      }
    },
    {
      permission: {
        identifier: 'core.organization.edit',
        name: 'Edit Organization',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'account'],
        resourceType: 'ORGANIZATION',
        action: 'edit'
      }
    },
    {
      permission: {
        identifier: 'core.organization.create',
        name: 'Create Organization',
        status: 'ACTIVE',
        allowedScopeLevels: ['account'],
        resourceType: 'ORGANIZATION',
        action: 'create'
      }
    },
    {
      permission: {
        identifier: 'core.organization.delete',
        name: 'Delete Organization',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'account'],
        resourceType: 'ORGANIZATION',
        action: 'delete'
      }
    },
    {
      permission: {
        identifier: 'core.organization.view',
        name: 'View Organization',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'account'],
        resourceType: 'ORGANIZATION',
        action: 'view'
      }
    },
    {
      permission: {
        identifier: 'core.project.delete',
        name: 'Delete Project',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'project', 'account'],
        resourceType: 'PROJECT',
        action: 'delete'
      }
    },
    {
      permission: {
        identifier: 'core.account.edit',
        name: 'Edit Account Settings',
        status: 'ACTIVE',
        allowedScopeLevels: ['account'],
        resourceType: 'ACCOUNT',
        action: 'edit'
      }
    },
    {
      permission: {
        identifier: 'core.account.delete',
        name: 'Delete Account',
        status: 'ACTIVE',
        allowedScopeLevels: ['account'],
        resourceType: 'ACCOUNT',
        action: 'delete'
      }
    },
    {
      permission: {
        identifier: 'core.secret.create',
        name: 'create secret',
        status: 'ACTIVE',
        allowedScopeLevels: ['organization', 'project', 'account'],
        resourceType: 'SECRET',
        action: 'create'
      }
    }
  ],
  metaData: {},
  correlationId: '9948d417-82e0-483c-a46d-ef24b659f433'
}
