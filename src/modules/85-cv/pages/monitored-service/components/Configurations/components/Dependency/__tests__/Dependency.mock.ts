export const monitoredService = {
  isEdit: true,
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  identifier: 'monitoredservice101',
  name: 'Monitored Service 101',
  type: 'Application' as any,
  description: 'Monitored Service with change source and health source',
  serviceRef: 'ServiceRef102',
  environmentRef: 'EnvironmentRef102',
  tags: { tag1: '', tag2: '' },
  sources: {
    healthSources: [
      {
        name: 'Splunk 102',
        identifier: 'splunk102',
        type: 'Splunk' as any,
        spec: {
          connectorRef: 'Splunk_Conn',
          feature: 'Cloud Logs' as any,
          queries: [
            {
              name: 'SPLUNK Logs Query',
              query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
              serviceInstanceIdentifier: '_sourcetype'
            }
          ]
        }
      }
    ],
    changeSources: [
      {
        name: 'PagerDuty 101',
        identifier: 'pagerduty',
        type: 'PagerDuty' as any,
        desc: 'Alert from PagerDuty',
        enabled: true,
        category: 'Alert' as any,
        spec: {
          connectorRef: 'PagerDutyConnector',
          pagerDutyServiceId: 'pagerDutyServiceId101'
        }
      }
    ]
  },
  dependencies: [
    {
      monitoredServiceIdentifier: 'service1'
    },
    {
      monitoredServiceIdentifier: 'service2'
    }
  ]
}

export const monitoredServiceList = {
  data: {
    content: [
      {
        identifier: 'monitoresService1',
        serviceRef: 'service1',
        serviceName: 'Service 1'
      },
      {
        identifier: 'monitoresService2',
        serviceRef: 'service2',
        serviceName: 'Service 2'
      },
      {
        identifier: 'monitoresService3',
        serviceRef: 'service3',
        serviceName: 'Service 3'
      }
    ]
  }
}

export const updatedPayload = {
  dependencies: [
    {
      monitoredServiceIdentifier: 'service1'
    },
    {
      monitoredServiceIdentifier: 'service2'
    }
  ],
  description: 'Monitored Service with change source and health source',
  environmentRef: 'EnvironmentRef102',
  identifier: 'monitoredservice101',
  isEdit: true,
  name: 'Monitored Service 101',
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  serviceRef: 'ServiceRef102',
  sources: {
    changeSources: [
      {
        category: 'Alert',
        desc: 'Alert from PagerDuty',
        enabled: true,
        identifier: 'pagerduty',
        name: 'PagerDuty 101',
        spec: {
          connectorRef: 'PagerDutyConnector',
          pagerDutyServiceId: 'pagerDutyServiceId101'
        },
        type: 'PagerDuty'
      }
    ],
    healthSources: [
      {
        identifier: 'splunk102',
        name: 'Splunk 102',
        spec: {
          connectorRef: 'Splunk_Conn',
          feature: 'Cloud Logs',
          queries: [
            {
              name: 'SPLUNK Logs Query',
              query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
              serviceInstanceIdentifier: '_sourcetype'
            }
          ]
        },
        type: 'Splunk'
      }
    ]
  },
  tags: {
    tag1: '',
    tag2: ''
  },
  type: 'Application'
}
