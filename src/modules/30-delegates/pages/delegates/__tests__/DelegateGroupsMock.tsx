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
    delegateType: 'ECS',
    groupCustomSelectors: [],
    groupHostName: 'groupHostName1',
    groupId: 'dsadsadsad22',
    groupImplicitSelectors: {},
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
    delegateGroupIdentifier: 'delGroupIdentifier1',
    delegateInsightsDetails: {},
    delegateInstanceDetails: [],
    delegateType: 'delType1',
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
