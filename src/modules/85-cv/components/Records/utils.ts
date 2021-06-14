import { formatJSON } from '@cv/pages/monitoring-source/google-cloud-operations/GoogleCloudOperationsMonitoringSourceUtils'

type GCOLogsHighchartsOptionAndRecords = {
  records: string[]
}

type GCOLogsSampleData = any

export function transformGCOLogsSampleData(sampleData?: GCOLogsSampleData[]): GCOLogsHighchartsOptionAndRecords {
  if (!sampleData?.length) {
    return { records: [] }
  }

  const transformedValue: GCOLogsHighchartsOptionAndRecords = { records: [] }
  for (const sample of sampleData) {
    const formattedJson = formatJSON(sample)
    if (formattedJson) {
      transformedValue.records.push(formattedJson)
    }
  }

  return transformedValue
}
