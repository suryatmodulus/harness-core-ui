/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseBoolean, ResponseUserAggregate } from 'services/cd-ng'

export const userInfo: ResponseUserAggregate = {
  status: 'SUCCESS',
  data: {
    user: { name: 'dummy', email: 'dummy@harness.io', uuid: 'dummy' },
    roleAssignmentMetadata: [
      {
        identifier: 'role_assignment_JZcId0QnciEQsfOtUYlo',
        roleIdentifier: 'New_Role',
        roleName: 'New Role',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_wHQ0QnLTID3MSVGzKchN',
        roleIdentifier: 'TestRole',
        roleName: 'TestRole',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_VSS2NofHI92c9TibXh03',
        roleIdentifier: '_account_dummy',
        roleName: 'Account dummy',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: true,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_gfLKLhqViVlNahxOfks7',
        roleIdentifier: '_account_viewer',
        roleName: 'Account Viewer',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: true,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_RkYa8Hrtp2CZJIJbUE7C',
        roleIdentifier: 'ufbvfbvbfv',
        roleName: 'ufbvfbvbfv',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      }
    ]
  },
  metaData: {},
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
