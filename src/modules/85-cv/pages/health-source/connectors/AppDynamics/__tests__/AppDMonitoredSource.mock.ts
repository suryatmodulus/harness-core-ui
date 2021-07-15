export const SourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'AppD 101',
      identifier: 'AppD_101',
      type: 'AppDynamics',
      spec: {
        connectorRef: 'AppD_Connector_102',
        feature: 'Application Monitoring',
        appdApplicationName: 'Harness-Dev',
        appdTierName: 'manager',
        metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
      },
      service: 'TestDemo',
      environment: 'TestDemo101'
    },
    {
      name: 'dasdsadasd',
      identifier: 'dasdsadasd',
      type: 'AppDynamics',
      spec: {
        connectorRef: 'AppD_Connector',
        feature: 'Application Monitoring',
        appdApplicationName: 'Harness-Dev',
        appdTierName: 'manager',
        metricPacks: [{ identifier: 'Performance' }]
      },
      service: 'TestDemo',
      environment: 'TestDemo101'
    }
  ],
  environmentName: 'TestDemo101',
  environmentIdentifier: 'TestDemo101',
  serviceName: 'TestDemo',
  serviceIdentifier: 'TestDemo',
  monitoringSourceName: 'AppD Test',
  monitoredServiceIdentifier: 'AppD_Test',
  product: 'Application Monitoring',
  appdApplicationName: 'Harness-Dev',
  appdTierName: 'manager',
  metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }],
  healthSourceName: 'AppD 101',
  healthSourceidentifier: 'AppD_101',
  sourceType: 'AppDynamics',
  connectorRef: {
    label: 'AppD Connector 102',
    value: 'AppD_Connector_102',
    scope: 'project',
    live: true,
    connector: {
      name: 'AppD Connector 102',
      identifier: 'AppD_Connector_102',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      tags: {},
      type: 'AppDynamics',
      spec: {
        username: 'raghu@harness.io',
        accountname: 'harness-test',
        controllerUrl: 'https://harness-test.saas.appdynamics.com/controller/',
        delegateSelectors: [],
        passwordRef: 'AppDSecret',
        clientSecretRef: null,
        clientId: null,
        authType: 'UsernamePassword'
      }
    }
  }
}

export const ApplicationName = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 15,
    pageItemCount: 15,
    pageSize: 10000,
    content: [
      {
        name: 'Harness-CI-Manager',
        id: 708406
      },
      {
        name: 'Harness-Dev',
        id: 708417
      },
      {
        name: 'cv-app',
        id: 7596
      },
      {
        name: 'cv-app-ng',
        id: 343254
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'b23ba1a0-90ba-44b1-9ab0-ac4a193c5809'
}

export const MetricPack = {
  metaData: {},
  resource: [
    {
      uuid: 'S2vfVwx8TSCkcxjSXLZupg',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'APP_DYNAMICS',
      identifier: 'Errors',
      category: 'Errors',
      metrics: [
        {
          name: 'Number of Errors',
          type: 'ERROR',
          path: 'Errors|__tier_name__|__metric_filter__|Number of Errors',
          validationPath: 'Overall Application Performance|__tier_name__|Exceptions per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        }
      ],
      thresholds: null
    },
    {
      uuid: 'mvMy4bRuQ-uBju4hH2WKxw',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'APP_DYNAMICS',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Average Wait Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Wait Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Calls per Minute',
          type: 'THROUGHPUT',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Stall Count',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Stall Count',
          validationPath: 'Overall Application Performance|__tier_name__|Stall Count',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Number of Slow Calls',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Number of Slow Calls',
          validationPath: 'Overall Application Performance|__tier_name__|Number of Slow Calls',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: '95th Percentile Response Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|95th Percentile Response Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Normal Average Response Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Normal Average Response Time (ms)',
          validationPath: 'Overall Application Performance|__tier_name__|Normal Average Response Time (ms)',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Errors per Minute',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Errors per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Response Time (ms)',
          validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Average Block Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Block Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Average CPU Used (ms)',
          type: 'INFRA',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average CPU Used (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Number of Very Slow Calls',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Number of Very Slow Calls',
          validationPath: 'Overall Application Performance|__tier_name__|Number of Very Slow Calls',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        }
      ],
      thresholds: null
    }
  ],
  responseMessages: []
}

export const AppTier = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10000,
    content: [
      {
        id: 1192087,
        name: 'manager'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '7c9c29a7-5bd4-4df4-86d0-2a0bc94249fe'
}

export const ValidationData = {
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
