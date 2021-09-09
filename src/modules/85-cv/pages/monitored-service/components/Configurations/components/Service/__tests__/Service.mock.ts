export const editModeData = {
  status: 'SUCCESS',
  data: {
    createdAt: 1626320974204,
    lastModifiedAt: 1630674529294,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      identifier: 'monitoredservice101',
      name: 'Monitored Service 101',
      type: 'Application',
      description: 'Monitored Service with change source and health source',
      serviceRef: 'ServiceRef102',
      environmentRef: 'EnvironmentRef102',
      tags: { tag1: '', tag2: '' },
      sources: {
        healthSources: [
          {
            name: 'Splunk 102',
            identifier: 'splunk102',
            type: 'Splunk',
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
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'c910c9e2-5a48-4f4b-9dad-afdeac54d060'
}

export const onUpdatePayload = {
  description: 'Monitored Service with change source and health source',
  environmentRef: 'EnvironmentRef102',
  identifier: 'monitoredservice101',
  name: 'Monitored Service 101',
  orgIdentifier: '1234_org',
  projectIdentifier: '1234_project',
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
