const insightsMock = [
  {
    timestamp: 2313213123123,
    counts: [
      {
        SUCCESSFUL: 3,
        FAILED: 1,
        IN_PROGRESS: 1
      },
      {
        SUCCESSFUL: 5
      }
    ]
  },
  {
    timestamp: 2313213123123,
    counts: [
      {
        IN_PROGRESS: 1
      },
      {
        SUCCESSFUL: 1,
        FAILED: 1
      }
    ]
  }
]

export const delegateGroupsMock = [
  {
    groupId: 'dsadsadsad22',
    delegateType: 'ECS',
    groupName: 'delegate-1',
    groupHostName: '',
    delegateDescription: '',
    delegateConfigurationId: null,
    sizeDetails: null,
    groupImplicitSelectors: {},
    delegateInsightsDetails: insightsMock,
    lastHeartBeat: 1616541640941,
    activelyConnected: true,
    delegateInstanceDetails: [],
    insights: [{}]
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
