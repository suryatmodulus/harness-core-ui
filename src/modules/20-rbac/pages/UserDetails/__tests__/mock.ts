import type { ResponseBoolean } from 'services/cd-ng'

export const userInfo = {
  status: 'SUCCESS',
  data: {
    user: { name: 'dummy', email: 'dummy@harness.io', uuid: 'dummy' },
    roleBindings: [
      {
        identifier: 'role_assignment_JZcId0QnciEQsfOtUYlo',
        roleIdentifier: 'New_Role',
        roleName: 'New Role',
        resourceGroupIdentifier: '_all_resources',
        resourceGroupName: 'All Resources',
        managedRole: false
      },
      {
        identifier: 'role_assignment_wHQ0QnLTID3MSVGzKchN',
        roleIdentifier: 'TestRole',
        roleName: 'TestRole',
        resourceGroupIdentifier: '_all_resources',
        resourceGroupName: 'All Resources',
        managedRole: false
      },
      {
        identifier: 'role_assignment_VSS2NofHI92c9TibXh03',
        roleIdentifier: '_account_dummy',
        roleName: 'Account dummy',
        resourceGroupIdentifier: '_all_resources',
        resourceGroupName: 'All Resources',
        managedRole: true
      },
      {
        identifier: 'role_assignment_gfLKLhqViVlNahxOfks7',
        roleIdentifier: '_account_viewer',
        roleName: 'Account Viewer',
        resourceGroupIdentifier: '_all_resources',
        resourceGroupName: 'All Resources',
        managedRole: true
      },
      {
        identifier: 'role_assignment_RkYa8Hrtp2CZJIJbUE7C',
        roleIdentifier: 'ufbvfbvbfv',
        roleName: 'ufbvfbvbfv',
        resourceGroupIdentifier: '_all_resources',
        resourceGroupName: 'All Resources',
        managedRole: false
      }
    ]
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

export const userGroupInfo = {
  status: 'SUCCESS',
  data: [
    {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      identifier: 'test',
      name: 'testGroup',
      users: ['u1'],
      notificationConfigs: [],
      description: '',
      tags: {}
    }
  ],
  metaData: '',
  correlationId: ''
}
