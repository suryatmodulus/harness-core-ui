import { extendMoment } from 'moment-range'
import { get } from 'lodash-es'
import type { DatasourceTypeDTO, RestResponseTransactionMetricInfoSummaryPageDTO } from 'services/cv'
import type { HostTestData } from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow.constants'
import type { DeploymentMetricsAnalysisRowProps } from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow'

const moment = extendMoment(require('moment')) // eslint-disable-line

export function transformMetricData(
  metricData?: RestResponseTransactionMetricInfoSummaryPageDTO | null
): DeploymentMetricsAnalysisRowProps[] {
  if (!metricData?.resource || metricData.resource.pageResponse?.empty) {
    return []
  }

  const graphData: DeploymentMetricsAnalysisRowProps[] = []

  const range = moment.range(
    moment(metricData.resource?.deploymentStartTime),
    moment(metricData.resource?.deploymentEndTime)
  )
  const startOfRange = range.start.valueOf()

  for (const analysisData of metricData.resource?.pageResponse?.content || []) {
    const { nodes, transactionMetric, dataSourceType } = analysisData || {}
    if (!nodes?.length || !transactionMetric?.metricName || !transactionMetric.transactionName) continue

    const increment = Math.floor(range.diff() / Math.max(nodes.length - 1, 1))
    const controlPoints: Highcharts.SeriesLineOptions['data'][] = []
    const testPoints: HostTestData[] = []

    for (const hostInfo of nodes) {
      const { controlData, testData, risk, hostName } = hostInfo || {}
      const hostControlData: Highcharts.SeriesLineOptions['data'] = []
      const hostTestData: Highcharts.SeriesLineOptions['data'] = []

      controlData?.forEach((dataPoint, index) => {
        hostControlData.push({ x: startOfRange + index * increment, y: dataPoint })
      })

      testData?.forEach((dataPoint, index) => {
        hostTestData.push({ x: startOfRange + index * increment, y: dataPoint })
      })

      controlPoints.push(hostControlData)
      testPoints.push({ points: hostTestData, risk, name: hostName || '' })
    }

    graphData.push({
      controlData: controlPoints,
      testData: testPoints,
      transactionName: transactionMetric.transactionName,
      metricName: transactionMetric.metricName,
      healthSourceType: dataSourceType
    })
  }

  return graphData
}

export function dataSourceTypeToLabel(dataSourceType: DatasourceTypeDTO['dataSourceType']): string {
  switch (dataSourceType) {
    case 'APP_DYNAMICS':
      return 'AppDynamics'
    case 'SPLUNK':
      return 'Splunk'
    case 'STACKDRIVER':
      return 'Google Cloud Operations (Metrics)'
    case 'STACKDRIVER_LOG':
      return 'Google Cloud Operations (Logs)'
    case 'NEW_RELIC':
      return 'New Relic'
    case 'PROMETHEUS':
      return 'Prometheus'
    default:
      return ''
  }
}

export function getErrorMessage(errorObj?: any): string | undefined {
  return get(errorObj, 'data.detailedMessage') || get(errorObj, 'data.message')
}
