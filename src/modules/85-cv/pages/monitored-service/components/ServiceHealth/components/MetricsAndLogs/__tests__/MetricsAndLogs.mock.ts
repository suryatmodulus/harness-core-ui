import { RiskValues } from '@cv/utils/CommonUtils'

export const mockedHealthSourcesData = {
  data: {
    resource: [
      {
        identifier: 'GCO_Health_source',
        name: 'GCO Health source',
        type: 'STACKDRIVER_LOG'
      },
      {
        identifier: 'Appd_Health_source',
        name: 'Appd Health source',
        type: 'APP_DYNAMICS'
      }
    ]
  }
}

export const mockedClustersData = {
  metaData: {},
  resource: [
    {
      text: 'verification-svc',
      risk: RiskValues.HEALTHY,
      x: 0,
      y: 0,
      tag: 'KNOWN'
    }
  ],
  responseMessages: []
}
