export const mockedHealthSourcesData = {
  metaData: {},
  resource: [
    {
      identifier: 'Appd_Monitored_service/Appd_Health_source',
      name: 'Appd Health source',
      type: 'APP_DYNAMICS',
      verificationType: 'TIME_SERIES'
    },
    {
      identifier: 'Appd_Monitored_service/GCO_Health_source',
      name: 'GCO Health source',
      type: 'STACKDRIVER_LOG',
      verificationType: 'LOG'
    }
  ],
  responseMessages: []
}

export const mockedMultipleHealthSourcesData = {
  metaData: {},
  resource: [
    {
      identifier: 'Appd_Monitored_service/Appd_Health_source',
      name: 'Appd Health source',
      type: 'APP_DYNAMICS',
      verificationType: 'TIME_SERIES'
    },
    {
      identifier: 'Appd_Monitored_service/Prometheus_Health_source',
      name: 'Prometheus Health source',
      type: 'PROMETHEUS',
      verificationType: 'TIME_SERIES'
    }
  ],
  responseMessages: []
}
