import type { MutateMethod } from 'restful-react'
import type {
  CustomHealthMetricDefinition,
  CustomHealthSampleDataRequest,
  FetchSampleDataQueryParams,
  ResponseObject,
  TimestampInfo
} from 'services/cv'

export const onFetchRecords = async (
  urlPath?: string,
  endTime?: TimestampInfo,
  startTime?: TimestampInfo,
  requestMethod?: CustomHealthMetricDefinition['method'],
  query?: string,
  getSampleData?: MutateMethod<ResponseObject, CustomHealthSampleDataRequest, FetchSampleDataQueryParams, void>,
  onFetchRecordsSuccess?: (data: { [key: string]: { [key: string]: any } }) => void
): Promise<void> => {
  if (!urlPath || !endTime || !startTime) {
    return
  }

  const payload: CustomHealthSampleDataRequest = {
    method: requestMethod || 'GET',
    urlPath,
    endTime,
    startTime
  }

  if (query && requestMethod === 'POST') {
    payload['body'] = query
  }
  const recordsvalue = await getSampleData?.(payload)
  if (recordsvalue?.data) {
    onFetchRecordsSuccess?.(recordsvalue?.data)
  }
}
