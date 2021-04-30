import type { ResponseBoolean, ResponsePageUserInfo } from 'services/cd-ng'

export const userGroupInfo = {
  status: 'SUCCESS',
  data: {
    userGroupDTO: {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      identifier: 'New_RG',
      name: 'New RG',
      users: ['lv0euRhKRCyiXWzS7pOg6g', 'ZqXNvYmURnO46PX7HwgEtQ'],
      notificationConfigs: [],
      description: '',
      tags: {}
    },
    users: [
      { name: 'Admin', email: 'admin@harness.io', uuid: 'lv0euRhKRCyiXWzS7pOg6g' },
      { name: 'default2fa', email: 'default2fa@harness.io', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' }
    ],
    roleAssignmentsMetadataDTO: [
      {
        identifier: 'role_assignment_YQthy4XoyNVcN0tNz2Qf',
        roleIdentifier: '_account_viewer',
        roleName: 'Account Viewer',
        resourceGroupIdentifier: '_all_resources',
        resourceGroupName: 'All Resources',
        managedRole: true
      }
    ],
    lastModifiedAt: 1618931089212
  },
  metaData: '',
  correlationId: ''
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const userInfo: ResponsePageUserInfo = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 10,
    content: [
      {
        uuid: 'rbac2',
        name: 'rbac1',
        email: 'rbac1@harness.io',
        admin: false,
        twoFactorAuthenticationEnabled: false
      },
      {
        uuid: 'rbac2',
        name: 'rbac2',
        email: 'rbac2@harness.io',
        admin: false,
        twoFactorAuthenticationEnabled: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: {},
  correlationId: ''
}
