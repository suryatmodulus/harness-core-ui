import { RiskValues, getRiskColorValue } from '@cv/utils/CommonUtils'

export const mockedLogAnalysisData = {
  resource: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        projectIdentifier: 'Harshil',
        orgIdentifier: 'default',
        environmentIdentifier: 'Environment_102',
        serviceIdentifier: 'Service_102',
        logData: {
          text: 'prod-setup-205416',
          label: 0,
          count: 1,
          trend: [
            {
              timestamp: 1630567200000,
              count: 1
            }
          ],
          tag: 'KNOWN'
        }
      },
      {
        projectIdentifier: 'Harshil',
        orgIdentifier: 'default',
        environmentIdentifier: 'Environment_102',
        serviceIdentifier: 'Service_102',
        logData: {
          text: 'prod-setup-205416',
          label: 0,
          count: 1,
          trend: [
            {
              timestamp: 1630567200000,
              count: 1
            }
          ],
          tag: 'UNKNOWN'
        }
      },
      {
        projectIdentifier: 'Harshil',
        orgIdentifier: 'default',
        environmentIdentifier: 'Environment_102',
        serviceIdentifier: 'Service_102',
        logData: {
          text: 'prod-setup-205416',
          label: 0,
          count: 1,
          trend: [
            {
              timestamp: 1630567200000,
              count: 1
            }
          ],
          tag: 'UNEXPECTED'
        }
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const mockedLogsData = {
  metaData: {},
  resource: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 7,
    content: [
      {
        projectIdentifier: 'Harshil',
        orgIdentifier: 'CV',
        environmentIdentifier: 'prod',
        serviceIdentifier: 'service240',
        logData: {
          text: 'verification-svc',
          label: 0,
          count: 9000,
          riskScore: 0,
          riskStatus: RiskValues.HEALTHY,
          trend: [
            {
              timestamp: 1632045240000,
              count: 1000
            },
            {
              timestamp: 1632045540000,
              count: 1000
            },
            {
              timestamp: 1632043440000,
              count: 1000
            },
            {
              timestamp: 1632044340000,
              count: 1000
            },
            {
              timestamp: 1632045840000,
              count: 1000
            },
            {
              timestamp: 1632043740000,
              count: 1000
            },
            {
              timestamp: 1632044640000,
              count: 1000
            },
            {
              timestamp: 1632044040000,
              count: 1000
            },
            {
              timestamp: 1632044940000,
              count: 1000
            }
          ],
          tag: 'KNOWN'
        }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}

export const mockedLogData = {
  projectIdentifier: 'Harshil',
  orgIdentifier: 'CV',
  environmentIdentifier: 'prod',
  serviceIdentifier: 'service240',
  logData: {
    text: 'verification-svc',
    label: 0,
    count: 9000,
    riskScore: 0,
    riskStatus: RiskValues.HEALTHY,
    trend: [
      {
        timestamp: 1632045240000,
        count: 1000
      },
      {
        timestamp: 1632045540000,
        count: 1000
      },
      {
        timestamp: 1632043440000,
        count: 1000
      },
      {
        timestamp: 1632044340000,
        count: 1000
      },
      {
        timestamp: 1632045840000,
        count: 1000
      },
      {
        timestamp: 1632043740000,
        count: 1000
      },
      {
        timestamp: 1632044640000,
        count: 1000
      },
      {
        timestamp: 1632044040000,
        count: 1000
      },
      {
        timestamp: 1632044940000,
        count: 1000
      }
    ],
    tag: 'KNOWN'
  }
}

export const mockedLogsTableData = [
  {
    clusterType: 'KNOWN',
    count: 9000,
    message: 'verification-svc',
    messageFrequency: [
      {
        name: 'trendData',
        type: 'line',
        color: getRiskColorValue(RiskValues.HEALTHY),
        data: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
      }
    ],
    riskScore: 0,
    riskStatus: RiskValues.HEALTHY
  }
]
