export const GCOMetricsHealthSourceInitialData = {
  isEdit: false,
  healthSourceList: [
    {
      name: 'test',
      identifier: 'test',
      type: 'Prometheus',
      spec: {
        connectorRef: 'account.prometheus',
        metricDefinitions: [
          {
            identifier: 'myId',
            metricName: 'Prometheus Metric',
            riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: {
                enabled: false,
                serviceInstanceFieldName: null,
                serviceInstanceMetricPath: null
              },
              riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] }
            },
            sli: { enabled: false },
            query:
              'min(aggregator_openapi_v2_regeneration_count{apiservice="apiservice",beta_kubernetes_io_arch="beta_kubernetes_io_arch",alertstate="alertstate",app="app",app="app",beta_kubernetes_io_os="beta_kubernetes_io_os"})',
            groupName: 'check',
            serviceInstanceFieldName: null,
            prometheusMetric: 'aggregator_openapi_v2_regeneration_count',
            serviceFilter: [
              { labelName: 'apiservice', labelValue: 'apiservice' },
              { labelName: 'beta_kubernetes_io_arch', labelValue: 'beta_kubernetes_io_arch' }
            ],
            envFilter: [
              { labelName: 'alertstate', labelValue: 'alertstate' },
              { labelName: 'app', labelValue: 'app' }
            ],
            additionalFilters: [
              { labelName: 'app', labelValue: 'app' },
              { labelName: 'beta_kubernetes_io_os', labelValue: 'beta_kubernetes_io_os' }
            ],
            aggregation: 'min',
            isManualQuery: false
          }
        ]
      }
    },
    {
      type: 'Prometheus',
      identifier: 'jkljkl',
      name: 'jkljkl',
      spec: {
        connectorRef: 'account.prometheus',
        feature: 'apm',
        metricDefinitions: [
          {
            prometheusMetric: 'aggregator_openapi_v2_regeneration_count',
            metricName: 'Prometheus Metric',
            identifier: 'check',
            serviceFilter: [{ labelName: 'alertstate', labelValue: 'alertstate' }],
            isManualQuery: false,
            query: 'count(\n\taggregator_openapi_v2_regeneration_count\t{\n\n})',
            envFilter: [{ labelName: 'alertname', labelValue: 'alertname' }],
            additionalFilters: [{ labelName: '__name__', labelValue: '__name__' }],
            aggregation: 'count',
            groupName: 'fgh',
            sli: { enabled: false },
            analysis: {
              riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] },
              liveMonitoring: { enabled: true },
              deploymentVerification: { enabled: false }
            }
          }
        ]
      }
    }
  ],
  serviceRef: 'service14',
  environmentRef: 'datadogtest',
  monitoredServiceRef: { name: 'service14_datadogtest', identifier: 'service14_datadogtest' },
  product: { value: 'Cloud Metrics', label: 'Cloud Metrics' },
  sourceType: 'Gcp',
  connectorRef: 'GCP',
  healthSourceName: 'ghjngh fgj f',
  healthSourceIdentifier: 'ghjngh_fgj_f',
  selectedDashboards: [
    {
      name: 'Delegate Perpetual Tasks - freemium',
      path: 'projects/778566137835/dashboards/081fe911-79e9-4d4e-9875-84b35e3f934d'
    }
  ]
}
