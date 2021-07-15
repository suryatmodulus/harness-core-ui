export const SourceDataMock = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'Test  AppD  101',
      identifier: 'Test_AppD_101',
      type: 'AppDynamics',
      spec: {
        connectorRef: 'AppD_Connector_102',
        feature: 'Application Monitoring',
        appdApplicationName: 'Harness-CI-Manager',
        appdTierName: 'manager',
        metricPacks: [{ identifier: 'Errors' }]
      },
      service: 'AppDService',
      environment: 'AppDTestEnv'
    }
  ],
  environmentName: 'AppDTestEnv',
  environmentIdentifier: 'AppDTestEnv',
  serviceName: 'AppDService',
  serviceIdentifier: 'AppDService',
  monitoringSourceName: 'Test Monitored service ',
  monitoredServiceIdentifier: 'Test_Monitored_service',
  product: 'Application Monitoring',
  appdApplicationName: 'Harness-CI-Manager',
  appdTierName: 'manager',
  metricPacks: [{ identifier: 'Errors' }],
  healthSourceName: 'Test  AppD  101',
  healthSourceidentifier: 'Test_AppD_101',
  sourceType: 'AppDynamics',
  connectorRef: 'AppD_Connector_102'
}

export const expectedResponse = {}
