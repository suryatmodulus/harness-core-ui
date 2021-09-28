export const mockedServiceDependencies = {
  metaData: {},
  resource: {
    nodes: [
      {
        serviceRef: 'Test_Service_103',
        environmentRef: 'Test_env_102',
        riskScore: -1,
        riskLevel: 'NO_ANALYSIS',
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      },
      {
        serviceRef: 'Test_Service_104',
        environmentRef: 'Test_env_102',
        riskScore: 0,
        riskLevel: 'LOW',
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      }
    ],
    edges: [
      {
        from: 'Test_Service_103_Test_env_102',
        to: 'Test_Service_104_Test_env_102'
      }
    ]
  },
  responseMessages: []
}

export const mockedDependenciesResults = {
  data: [
    {
      from: 'Test_Service_103_Test_env_102',
      to: 'Test_Service_104_Test_env_102'
    }
  ],
  nodes: [
    {
      icon: 'cd-main',
      id: 'Test_Service_103_Test_env_102',
      status: 'NO_ANALYSIS'
    },
    {
      icon: 'cd-main',
      id: 'Test_Service_104_Test_env_102',
      status: 'LOW'
    }
  ]
}
