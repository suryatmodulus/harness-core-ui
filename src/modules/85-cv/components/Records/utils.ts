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

export function formatJSON(val?: string | Record<string, unknown>): string | undefined {
  try {
    if (!val) return
    const res = typeof val === 'string' ? JSON.parse(val) : val
    return JSON.stringify(res, null, 2)
  } catch (e) {
    return
  }
}
