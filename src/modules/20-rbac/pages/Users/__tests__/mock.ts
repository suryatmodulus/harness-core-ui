import type {
  ResponseBoolean,
  ResponsePageInvite,
  ResponsePageUserAggregate,
  ResponsePageUserMetadataDTO
} from 'services/cd-ng'

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const roleMockData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 50,
    content: [
      {
        role: {
          identifier: '_account_viewer',
          name: 'Account Viewer',
          permissions: [
            'core_service_view',
            'core_organization_view',
            'core_environment_view',
            'core_secret_view',
            'core_connector_view'
          ],
          allowedScopeLevels: ['account'],
          description: 'View an account',
          tags: null
        },
        scope: null,
        harnessManaged: true,
        createdAt: 1615054539384,
        lastModifiedAt: 1617625090481
      },
      {
        role: {
          identifier: '_account_admin',
          name: 'Account Admin',
          permissions: [
            'core_organization_create',
            'core_service_edit',
            'core_secret_delete',
            'core_organization_view',
            'core_environment_view',
            'core_service_delete',
            'core_secret_edit',
            'core_connector_create',
            'core_connector_edit',
            'core_secret_view',
            'core_secret_access',
            'core_connector_view',
            'core_connector_access',
            'core_environment_access',
            'core_service_view',
            'core_service_access',
            'core_environment_edit',
            'core_connector_delete',
            'core_environment_delete'
          ],
          allowedScopeLevels: ['account'],
          description: 'Administer an account',
          tags: null
        },
        scope: null,
        harnessManaged: true,
        createdAt: 1615054539397,
        lastModifiedAt: 1617711363209
      },
      {
        role: {
          identifier: 'Custom_Role',
          name: 'Custom Role',
          permissions: [
            'core_organization_create',
            'core_secret_delete',
            'core_organization_view',
            'core_secret_edit',
            'core_secret_view'
          ],
          allowedScopeLevels: ['account'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc', orgIdentifier: null, projectIdentifier: null },
        harnessManaged: false,
        createdAt: 1617901019095,
        lastModifiedAt: 1617941758361
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: 'dd49f20d-3685-4b65-8ee9-69f22bafbad9'
}

export const resourceGroupsMockData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 50,
    content: [
      {
        resourceGroup: {
          accountIdentifier: 'testAcc',
          identifier: 'Custom_RG',
          name: 'Custom RG',
          resourceSelectors: [{ type: 'DynamicResourceSelector', resourceType: 'SECRET' }],
          fullScopeSelected: false,
          tags: {},
          description: '',
          color: '#e6b800'
        },
        createdAt: 1617943146592,
        lastModifiedAt: 1617943226983,
        harnessManaged: false
      },
      {
        resourceGroup: {
          accountIdentifier: 'testAcc',
          orgIdentifier: null,
          projectIdentifier: null,
          identifier: '_all_resources',
          name: 'All Resources',
          resourceSelectors: [],
          fullScopeSelected: true,
          tags: { predefined: 'true' },
          description: 'Resource Group containing all resources',
          color: '#0061fc'
        },
        createdAt: 1617721392670,
        lastModifiedAt: 1617721392670,
        harnessManaged: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: ''
}

export const usersMockData: ResponsePageUserMetadataDTO = {
  status: 'SUCCESS',
  data: {
    content: [{ name: 'Admin', email: 'admin@harness.io', uuid: 'uuid' }]
  },
  metaData: undefined,
  correlationId: ''
}

export const pendingUserMock: ResponsePageInvite = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 10,
    content: [
      {
        id: 'id1',
        name: 'Admin_123_123',
        email: 'admin@harness.io',
        accountIdentifier: 'testAcc',
        roleBindings: [
          {
            roleIdentifier: '_account_viewer',
            roleName: 'Account Viewer',
            resourceGroupIdentifier: 'New_123',
            resourceGroupName: 'New 123',
            managedRole: true
          }
        ],
        inviteType: 'ADMIN_INITIATED_INVITE',
        approved: false
      },
      {
        id: 'id2',
        name: 'default',
        email: 'default@harness.io',
        accountIdentifier: 'testAcc',
        roleBindings: [
          {
            roleIdentifier: 'New_Role',
            roleName: 'New Role',
            resourceGroupIdentifier: 'New_123',
            resourceGroupName: 'New 123',
            managedRole: false
          }
        ],
        inviteType: 'ADMIN_INITIATED_INVITE',
        approved: false
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const activeUserMock: ResponsePageUserAggregate = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        user: {
          name: 'abc',
          email: 'abc@harness.io',
          uuid: '123'
        },
        roleAssignmentMetadata: [
          {
            identifier: 'role_assignment_vawmAV0YuQ9HlxmljpAu',
            roleIdentifier: '_account_admin',
            roleName: 'Account Admin',
            resourceGroupIdentifier: '_all_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: false
          },
          {
            identifier: 'role_assignment_obm6QvdxtfqrlDzug31t',
            roleIdentifier: '_account_viewer',
            roleName: 'Account Viewer',
            resourceGroupIdentifier: '_all_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: true
          }
        ]
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: ''
}
