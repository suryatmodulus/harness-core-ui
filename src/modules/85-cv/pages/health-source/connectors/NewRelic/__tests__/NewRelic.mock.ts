export const metricPack = {
  metaData: {},
  resource: [
    {
      uuid: 'D-2ObpgKQoOajGT7e-wzAQ',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'NEW_RELIC',
      identifier: 'Performance',
      category: 'Performance' as any,
      metrics: [
        {
          name: 'Errors per Minute',
          type: 'ERROR',
          path: 'SELECT count(`apm.service.transaction.error.count`) FROM Metric',
          validationPath: 'SELECT average(`apm.service.error.count`) FROM Metric',
          responseJsonPath: 'results.[0].average',
          validationResponseJsonPath: 'total.results.[0].average',
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          type: 'RESP_TIME',
          path: 'SELECT average(`apm.service.transaction.duration`) FROM Metric',
          validationPath: 'SELECT average(`apm.service.duration`) FROM Metric',
          responseJsonPath: 'results.[0].average',
          validationResponseJsonPath: 'total.results.[0].average',
          thresholds: [],
          included: true
        },
        {
          name: 'Calls per Minute',
          type: 'THROUGHPUT',
          path: 'SELECT rate(count(apm.service.transaction.duration), 1 minute) FROM Metric',
          validationPath: 'SELECT rate(count(apm.service.duration), 1 minute) FROM Metric',
          responseJsonPath: 'results.[0].result',
          validationResponseJsonPath: 'total.results.[0].result',
          thresholds: [],
          included: true
        },
        {
          name: 'Apdex',
          type: 'APDEX',
          path: 'SELECT apdex(`apm.service.transaction.apdex`) FROM Metric',
          validationPath: 'SELECT apdex(`apm.service.apdex`) FROM Metric',
          responseJsonPath: 'results.[0].score',
          validationResponseJsonPath: 'total.results.[0].score',
          thresholds: [],
          included: true
        }
      ],
      thresholds: undefined
    }
  ],
  responseMessages: []
}

export const applicationData = {
  status: 'SUCCESS',
  data: [
    {
      applicationName: 'My Application',
      applicationId: 107019083
    }
  ],
  metaData: null,
  correlationId: '111f90bc-a618-4884-be79-1d34dcfa862d'
}

export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'New relic 103',
      identifier: 'New_relic_101',
      type: 'NewRelic',
      spec: {
        connectorRef: 'newrelic',
        applicationName: 'My Application',
        applicationId: '107019083',
        feature: 'apm',
        metricPacks: [
          {
            identifier: 'Performance'
          }
        ]
      }
    }
  ],
  serviceRef: 'AppDService',
  environmentRef: 'AppDTestEnv',
  monitoredServiceRef: {
    name: 'Test Monitored service ',
    identifier: 'Test_Monitored_service',
    description: 'monitoredService',
    tags: {
      tag1: '',
      tag: '',
      tag2: ''
    }
  },
  healthSourceName: 'heath source name',
  healthSourceIdentifier: 'New_relic_101',
  sourceType: 'NewRelic',
  connectorRef: {
    label: 'newrelic',
    value: 'newrelic',
    scope: 'project',
    live: true,
    connector: {
      name: 'newrelic',
      identifier: 'newrelic',
      description: null,
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      tags: {},
      type: 'NewRelic',
      spec: {
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/',
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: []
      }
    }
  },
  product: {
    label: 'apm',
    value: 'apm'
  }
}

export const newrelicInput = {
  applicationId: '107019083',
  applicationName: 'My Application',
  connectorRef: {
    connector: {
      description: null,
      identifier: 'newrelic',
      name: 'newrelic',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      spec: {
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: [],
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/'
      },
      tags: {},
      type: 'NewRelic'
    },
    label: 'newrelic',
    live: true,
    scope: 'project',
    value: 'newrelic'
  },
  identifier: 'New_relic_101',
  isEdit: true,
  metricPacks: [{ identifier: 'Performance' }],
  name: 'heath source name',
  product: {
    label: 'apm',
    value: 'apm'
  },
  type: 'NewRelic'
}

export const expectedNewRelicData = {
  applicationId: '107019083',
  applicationName: 'My Application',
  connectorRef: {
    connector: {
      description: null,
      identifier: 'newrelic',
      name: 'newrelic',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      spec: {
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: [],
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/'
      },
      tags: {},
      type: 'NewRelic'
    },
    label: 'newrelic',
    live: true,
    scope: 'project',
    value: 'newrelic'
  },
  identifier: 'New_relic_101',
  isEdit: true,
  metricPacks: [{ identifier: 'Performance' }],
  name: 'heath source name',
  product: {
    label: 'apm',
    value: 'apm'
  },
  type: 'NewRelic'
}

export const validationData = {
  status: 'SUCCESS',
  data: [
    {
      metricPackName: 'Performance',
      overallStatus: 'NO_DATA',
      values: [
        {
          metricName: 'Calls per Minute',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        },
        {
          metricName: 'Stall Count',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        },
        {
          metricName: 'Errors per Minute',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        },
        {
          metricName: 'Average Response Time (ms)',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        }
      ]
    },
    {
      metricPackName: 'Errors',
      overallStatus: 'NO_DATA',
      values: [
        {
          metricName: 'Number of Errors',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        }
      ]
    }
  ],
  metaData: null,
  correlationId: '4dff5c5b-fa2e-44bc-8eca-2e06485d1cab'
}

export const onPreviousPayload = {
  connectorRef: {
    connector: {
      description: null,
      identifier: 'newrelic',
      name: 'newrelic',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      spec: {
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: [],
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/'
      },
      tags: {},
      type: 'NewRelic'
    },
    label: 'newrelic',
    live: true,
    scope: 'project',
    value: 'newrelic'
  },
  environmentRef: 'AppDTestEnv',
  healthSourceIdentifier: 'New_relic_101',
  healthSourceList: [
    {
      identifier: 'New_relic_101',
      name: 'New relic 103',
      spec: {
        applicationId: '107019083',
        applicationName: 'My Application',
        connectorRef: 'newrelic',
        feature: 'apm',
        metricPacks: [{ identifier: 'Performance' }]
      },
      type: 'NewRelic'
    }
  ],
  healthSourceName: 'heath source name',
  isEdit: true,
  monitoredServiceRef: {
    description: 'monitoredService',
    identifier: 'Test_Monitored_service',
    name: 'Test Monitored service ',
    tags: { tag: '', tag1: '', tag2: '' }
  },
  product: { label: 'apm', value: 'apm' },
  serviceRef: 'AppDService',
  sourceType: 'NewRelic'
}

export const onSubmitPayload = {
  identifier: 'New_relic_101',
  name: 'heath source name',
  spec: {
    applicationId: '107019083',
    applicationName: 'My Application',
    connectorRef: 'newrelic',
    feature: 'apm',
    metricPacks: [{ identifier: 'Performance' }]
  },
  type: 'NewRelic'
}

export const validationMissingApplication = {
  metricData: { Performance: true },
  newRelicApplication: { label: undefined, value: undefined }
}

export const validationMissingMetricData = {
  metricData: {},
  newRelicApplication: { label: 'manager', value: 'manager' }
}

export const validationValidPayload = {
  metricData: { Performance: true },
  newRelicApplication: { label: 'manager', value: 'manager' }
}
