export const formikValue = {
  metricName: 'CustomHealth Metric 101',
  metricIdentifier: 'CustomHealthMetric101',
  groupName: { label: 'Group 1', value: 'Group 1' },
  continuousVerification: false,
  healthScore: true,
  sli: false,
  riskCategory: 'Errors/ERROR',
  serviceInstanceIdentifier: 'serviceInstance',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  queryType: 'SERVICE_BASED',
  requestMethod: 'POST',
  query: 'Select * from ',
  baseURL: '',
  pathURL:
    'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations',
  metricValue: '$.series.[*].pointlist.[*]',
  timestamp: '$.series.[*].pointlist.[*]',
  timestampFormat: 'MMMM DD YY',
  serviceInstancePath: '',
  startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
  endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' }
}
