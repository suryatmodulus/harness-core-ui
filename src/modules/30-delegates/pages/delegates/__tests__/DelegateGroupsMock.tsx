/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DelegateGroupDetails, DelegateInsightsDetails } from 'services/portal'

const insightsMock = {
  insights: [
    {
      counts: [
        {
          key: 'SUCCESSFUL',
          value: 1
        },
        {
          key: 'FAILED',
          value: 1
        },
        {
          key: 'IN_PROGRESS',
          value: 1
        },
        {
          key: 'PERPETUAL_TASK_ASSIGNED',
          value: 1
        }
      ],
      timeStamp: 43322342
    }
  ]
} as DelegateInsightsDetails

export const delegateGroupsMock: DelegateGroupDetails[] = [
  {
    activelyConnected: true,
    delegateConfigurationId: 'configId1',
    delegateDescription: 'description1',
    delegateGroupIdentifier: 'delGroupIdentifier1',
    delegateInsightsDetails: insightsMock,
    delegateInstanceDetails: [],
    delegateType: 'KUBERNETES',
    groupCustomSelectors: ['customtag1', 'customtag2'],
    groupHostName: 'groupHostName1',
    groupId: 'dsadsadsad22',
    groupImplicitSelectors: {
      implicitSelector1: 'GROUP_SELECTORS'
    },
    groupName: 'delegate-1',
    lastHeartBeat: 1616541640941,
    sizeDetails: {
      cpu: 1,
      label: 'cpu1',
      ram: 16,
      replicas: 2,
      size: 'EXTRA_SMALL',
      taskLimit: 2
    }
  },
  {
    activelyConnected: false,
    delegateConfigurationId: 'configId1',
    delegateDescription: 'description1',
    delegateGroupIdentifier: 'delGroupIdentifier2',
    delegateInsightsDetails: {},
    delegateInstanceDetails: [],
    delegateType: 'KUBERNETES',
    groupCustomSelectors: [],
    groupHostName: 'groupHostName1',
    groupId: 'groupId1',
    groupImplicitSelectors: {},
    groupName: 'Group1',
    lastHeartBeat: 20000,
    sizeDetails: {
      cpu: 1,
      label: 'cpu1',
      ram: 16,
      replicas: 2,
      size: 'EXTRA_SMALL',
      taskLimit: 2
    }
  }
]

export const singleDelegateResponseMock = {
  metadata: '',
  resource: {
    delegateGroupDetails: [delegateGroupsMock[0]]
  }
}

export const singleDelegateWithoutTagsResponseMock = {
  metadata: '',
  resource: {
    delegateGroupDetails: [{ ...delegateGroupsMock[0], tags: [] }]
  }
}

export const multipleDelegatesMock = {
  metadata: '',
  resource: {
    delegateGroupDetails: delegateGroupsMock
  }
}
