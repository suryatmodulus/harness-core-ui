export const mockedLogAnalysisData = {
  metaData: {},
  resource: {
    totalPages: 5,
    totalItems: 51,
    pageItemCount: 0,
    pageSize: 10,
    content: [
      {
        message: 'Done with entity',
        clusterType: 'KNOWN_EVENT',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 410
      },
      {
        message:
          "[processNextCVTasks] Total time taken to process accountId Account{companyName='Shaw', accountName='Shaw 2'} is 1 (ms)",
        clusterType: 'KNOWN_EVENT',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 330
      },
      {
        message: 'for VP4Jp_fnRwObcTDj_hu8qA the cron will handle data collection',
        clusterType: 'UNEXPECTED_FREQUENY',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 19
      },
      {
        message:
          "[expireLongRunningCVTasks] Total time taken to process accountId Account{companyName='Arch U.S. MI Services Inc.', accountName='Arch U.S. MI Services Inc.-6206'} is 2 (ms)",
        clusterType: 'UNEXPECTED_FREQUENY',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 3
      },
      {
        message:
          "[retryCVTasks] Total time taken to process accountId Account{companyName='Harness.io', accountName='Puneet Test Pro'} is 0 (ms)",
        clusterType: 'KNOWN_EVENT',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 3
      },
      {
        message:
          "[expireLongRunningCVTasks] Total time taken to process accountId Account{companyName='Harness', accountName='CS - Marcos Gabriel-4229'} is 1 (ms)",
        clusterType: 'KNOWN_EVENT',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 3
      },
      {
        message:
          "[expireLongRunningCVTasks] Total time taken to process accountId Account{companyName='New York Life', accountName='NYL'} is 2 (ms)",
        clusterType: 'KNOWN_EVENT',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 3
      },
      {
        message:
          "[expireLongRunningCVTasks] Total time taken to process accountId Account{companyName='Times Higher Education', accountName='Times Higher Education'} is 2 (ms)",
        clusterType: 'KNOWN_EVENT',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 9
      },
      {
        message:
          "[retryCVTasks] Total time taken to process accountId Account{companyName='CS - Venkat2', accountName='CS - Venkat2'} is 0 (ms)",
        clusterType: 'UNKNOWN_EVENT',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 12
      },
      {
        message:
          "[expireLongRunningCVTasks] Total time taken to process accountId Account{companyName='AppDynamics', accountName='AppDynamics - Sales Demo'} is 2 (ms)",
        clusterType: 'UNKNOWN_EVENT',
        riskStatus: 'LOW',
        riskScore: 0.0,
        count: 3
      }
    ],
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}

export const mockedLogChartsData = {
  metaData: {},
  resource: [
    {
      label: 0,
      text: 'Done with entity',
      hostName: '1nxke32g14t3utr',
      risk: 'LOW',
      x: 0.045187841896648,
      y: -0.5087333618108428
    },
    {
      label: 0,
      text: 'Done with entity',
      hostName: '1nxke32g14t3uu3',
      risk: 'LOW',
      x: 0.045187841896648,
      y: -0.5087333618108428
    },
    {
      label: 0,
      text: 'Done with entity',
      hostName: '1nxke32g14t3utz',
      risk: 'LOW',
      x: 0.045187841896648,
      y: -0.5087333618108428
    },
    {
      label: 0,
      text: 'Done with entity',
      hostName: '1nxke32g14t3utw',
      risk: 'LOW',
      x: 0.045187841896648,
      y: -0.5087333618108428
    }
  ],
  responseMessages: []
}
