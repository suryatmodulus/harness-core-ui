import { get } from 'lodash-es'
import type { MetricData, RestResponsePageTimeSeriesMetricDataDTO, TimeSeriesMetricDataDTO } from 'services/cv'

export function generatePointsForTimeSeries(
  data: RestResponsePageTimeSeriesMetricDataDTO,
  startTime: number,
  endTime: number
): RestResponsePageTimeSeriesMetricDataDTO | undefined {
  const content = data?.resource?.content

  if (content && content.length) {
    for (const analysis of content) {
      if (!analysis?.metricDataList?.length) {
        continue
      }
      sortAnalysisData(analysis)
      const filledMetricData: MetricData[] = [...analysis.metricDataList]
      const analysisStartTime = analysis?.metricDataList[0]?.timestamp
      const analysisEndTime = analysis?.metricDataList[analysis?.metricDataList?.length - 1]?.timestamp

      updateStartTime(analysisStartTime, startTime, filledMetricData)
      updateEndTime(analysisEndTime, endTime, filledMetricData)

      analysis.metricDataList = filledMetricData

      return data
    }
  } else {
    return data
  }
}

function sortAnalysisData(analysis: TimeSeriesMetricDataDTO): void {
  if (analysis?.metricDataList) {
    analysis.metricDataList.sort((a: MetricData, b: MetricData) => {
      if (!a?.timestamp) {
        return b?.timestamp ? -1 : 0
      }
      if (!b?.timestamp) {
        return 1
      }
      return a.timestamp - b.timestamp
    })
  }
}

function updateEndTime(analysisEndTime: number | undefined, endTime: number, filledMetricData: MetricData[]): void {
  if (analysisEndTime && analysisEndTime < endTime) {
    filledMetricData.push({ timestamp: endTime, value: undefined })
  }
}

function updateStartTime(
  analysisStartTime: number | undefined,
  startTime: number,
  filledMetricData: MetricData[]
): void {
  if (analysisStartTime && analysisStartTime > startTime) {
    filledMetricData.unshift({ timestamp: startTime, value: undefined })
  }
}

export function getErrorMessage(errorObj?: any): string | undefined {
  return get(errorObj, 'data.detailedMessage') || get(errorObj, 'data.message')
}
