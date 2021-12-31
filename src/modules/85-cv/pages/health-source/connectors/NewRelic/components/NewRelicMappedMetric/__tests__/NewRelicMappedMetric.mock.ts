export const connectorIdentifier = 'account.new_relic'
export const mappedMetricsMap = new Map()
export const formikValues = {
  name: 'NR-400',
  identifier: 'NR400',
  connectorRef: 'account.new_relic',
  isEdit: false,
  product: {
    value: 'apm',
    label: 'Full Stack Observability: APM'
  },
  type: 'NewRelic',
  mappedServicesAndEnvs: {},
  newRelicApplication: {
    label: '',
    value: ''
  },
  metricPacks: [],
  metricData: {},
  metricName: 'New Relic Metric',
  showCustomMetric: false
}
