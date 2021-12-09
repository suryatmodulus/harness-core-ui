export const MockManualQueryData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'prometheus',
      identifier: 'prometheus',
      type: 'Prometheus',
      spec: {
        connectorRef: 'prometheusConnector',
        metricDefinitions: [
          {
            query: 'count(container_cpu_load_average_10s{container="cv-demo",namespace="cv-demo"})',
            serviceIdentifier: 'todolist',
            envIdentifier: 'production',
            isManualQuery: false,
            groupName: 'group1',
            metricName: 'NoLongerManualQuery',
            identifier: 'My Identifier',
            serviceInstanceFieldName: 'alertname',
            prometheusMetric: 'container_cpu_load_average_10s',
            serviceFilter: [
              { labelName: 'container', labelValue: 'cv-demo', queryFilterString: 'container="cv-demo"' }
            ],
            envFilter: [{ labelName: 'namespace', labelValue: 'cv-demo', queryFilterString: 'namespace="cv-demo"' }],
            additionalFilters: null,
            aggregation: 'count',
            sli: { enabled: true },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: { enabled: true, serviceInstanceFieldName: 'serviceInstanceFieldName' },
              riskProfile: {
                category: 'Infrastructure',
                metricType: 'INFRA',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            }
          }
        ]
      },
      service: 'todolist',
      environment: 'production'
    }
  ],
  monitoringSourceName: 'todolist',
  monitoredServiceIdentifier: 'todolist',
  healthSourceName: 'prometheus',
  healthSourceIdentifier: 'prometheus',
  sourceType: 'Prometheus',
  connectorRef: 'prometheusConnector',
  product: {}
}

export const MockManualQueryDataWithoutIdentifier = {
  ...MockManualQueryData,
  healthSourceList: [
    {
      ...MockManualQueryData.healthSourceList[0],
      spec: {
        ...MockManualQueryData.healthSourceList[0].spec,
        metricDefinitions: [
          {
            ...MockManualQueryData.healthSourceList[0].spec.metricDefinitions[0],
            identifier: undefined
          }
        ]
      }
    }
  ]
}
