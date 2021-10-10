export const HealthSourceList = [
  {
    name: 'dasdsadasd',
    identifier: 'dasdsadasd',
    type: 'AppDynamics',
    spec: {
      connectorRef: 'AppD_Connector',
      feature: 'Application Monitoring',
      applicationName: 'Harness-Dev',
      tierName: 'manager',
      metricPacks: [{ identifier: 'Performance' }]
    },
    service: 'TestDemo',
    environment: 'TestDemo101'
  },
  {
    name: 'AppD 101',
    identifier: 'AppD_101',
    type: 'AppDynamics' as any,
    spec: {
      connectorRef: 'AppD_Connector_102',
      feature: 'Application Monitoring',
      applicationName: 'Harness-Dev',
      tierName: 'manager',
      metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
    },
    service: 'TestDemo',
    environment: 'TestDemo101'
  }
]

export const selectedRow = {
  name: 'GCO Metrics',
  identifier: 'GCO_Metrics',
  type: 'Stackdriver',
  spec: {
    connectorRef: 'Testgcpnew',
    metricDefinitions: [
      {
        dashboardName: 'Prod-1 Runtime Workflow Related Mongo Metrics',
        dashboardPath: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc',
        metricName: 'custom.googleapis.com/user/x_mongo_prod_workflow_executions_count',
        jsonMetricDefinition: {
          dataSets: [
            {
              timeSeriesQuery: {
                timeSeriesFilter: {
                  filter:
                    'metric.type="custom.googleapis.com/user/x_mongo_prod_workflow_executions_count" resource.type="global"',
                  aggregation: { alignmentPeriod: '60s', perSeriesAligner: 'ALIGN_MEAN' }
                },
                unitOverride: '1'
              }
            }
          ]
        },
        metricTags: ['Workflow Executions Count'],
        riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] },
        isManualQuery: false,
        serviceInstanceField: null
      }
    ],
    feature: 'Cloud Metrics',
    product: { label: 'Cloud Metrics', value: 'Cloud Metrics' }
  }
}

export const changeSource = [
  { category: 'Deployment', type: 'HarnessCD', spec: {}, enabled: true, name: 'dadasd', identifier: 'dadasd' }
]

export const tableData = [
  {
    name: 'GCO Metrics',
    identifier: 'GCO_Metrics',
    type: 'Stackdriver',
    spec: {
      connectorRef: 'Testgcpnew',
      metricDefinitions: [
        {
          dashboardName: 'Prod-1 Runtime Workflow Related Mongo Metrics',
          dashboardPath: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc',
          metricName: 'custom.googleapis.com/user/x_mongo_prod_workflow_executions_count',
          jsonMetricDefinition: {
            dataSets: [
              {
                timeSeriesQuery: {
                  timeSeriesFilter: {
                    filter:
                      'metric.type="custom.googleapis.com/user/x_mongo_prod_workflow_executions_count" resource.type="global"',
                    aggregation: { alignmentPeriod: '60s', perSeriesAligner: 'ALIGN_MEAN' }
                  },
                  unitOverride: '1'
                }
              }
            ]
          },
          metricTags: ['Workflow Executions Count'],
          riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] },
          isManualQuery: false,
          serviceInstanceField: null
        }
      ],
      feature: 'Cloud Metrics',
      product: { label: 'Cloud Metrics', value: 'Cloud Metrics' }
    }
  },
  {
    name: 'appd',
    identifier: 'appd',
    type: 'AppDynamics',
    spec: {
      connectorRef: 'TestAppd',
      feature: 'Application Monitoring',
      applicationName: 'cv-app',
      tierName: 'docker-tier',
      metricPacks: [{ identifier: 'Performance' }]
    }
  }
]

export const onDleteWithChangeSource = {
  monitoredService: {
    sources: {
      changeSources: [
        {
          category: 'Deployment',
          enabled: true,
          identifier: 'dadasd',
          name: 'dadasd',
          spec: {},
          type: 'HarnessCD'
        }
      ],
      healthSources: [
        {
          identifier: 'appd',
          name: 'appd',
          spec: {
            applicationName: 'cv-app',
            connectorRef: 'TestAppd',
            feature: 'Application Monitoring',
            metricPacks: [
              {
                identifier: 'Performance'
              }
            ],
            tierName: 'docker-tier'
          },
          type: 'AppDynamics'
        }
      ]
    }
  }
}

export const onDeleteWithOutChangeSource = {
  monitoredService: {
    sources: {
      changeSources: [],
      healthSources: [
        {
          identifier: 'appd',
          name: 'appd',
          spec: {
            applicationName: 'cv-app',
            connectorRef: 'TestAppd',
            feature: 'Application Monitoring',
            metricPacks: [
              {
                identifier: 'Performance'
              }
            ],
            tierName: 'docker-tier'
          },
          type: 'AppDynamics'
        }
      ]
    }
  }
}
