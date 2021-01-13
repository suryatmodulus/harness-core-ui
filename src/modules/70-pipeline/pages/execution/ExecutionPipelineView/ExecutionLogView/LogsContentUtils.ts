import { pick } from 'lodash-es'
import { getConfig, getUsingFetch, GetUsingFetchProps } from 'services/config'
import type { Line, LogBlobQueryParams, LogStreamQueryParams } from 'services/logs'
import type { GraphLayoutNode } from 'services/pipeline-ng'

export interface LogsContentSection {
  enableLogLoading: boolean
  sectionTitle: string
  sectionIdx: number
  sourceType: 'stream' | 'blob' | string
  queryVars: LogStreamQueryParams | LogBlobQueryParams
}

export function createLogSection(
  stageType?: 'ci' | 'cd' | string,
  logsToken?: string,
  accountId?: string,
  orgIdentifier?: string,
  projectIdentifier?: string,
  runSequence?: string,
  pipelineIdentifier?: string,
  stageIdentifier?: string,
  stageStatus?: string | undefined | any,
  stepIdentifier?: string,
  stepStatus?: string | undefined | any,
  stepType?: 'dependency-service' | string
): LogsContentSection[] {
  let enableLogLoading =
    !!logsToken &&
    !!accountId &&
    !!orgIdentifier &&
    !!projectIdentifier &&
    !!runSequence &&
    !!pipelineIdentifier &&
    !!stageIdentifier &&
    !!stageStatus &&
    !!stepIdentifier &&
    !!stepStatus &&
    !!stepType

  if (stageType === 'ci') {
    let sourceType = 'blob'
    if (stepType === 'dependency-service') {
      // for dependency service we use STAGE status
      if (isStatusRunningLike(stageStatus)) {
        sourceType = 'stream'
      }
      enableLogLoading = isStatusActiveLike(stageStatus) && enableLogLoading
    } else {
      if (isStatusRunningLike(stepStatus)) {
        sourceType = 'stream'
      }
      enableLogLoading = isStatusActiveLike(stepStatus) && enableLogLoading
    }

    const queryVars = {
      accountID: `${accountId}`,
      key: `${accountId}/${orgIdentifier}/${projectIdentifier}/${pipelineIdentifier}/${runSequence}/${stageIdentifier}/${stepIdentifier}`,
      'X-Harness-Token': logsToken!
    }

    // CI stage has one section
    return [
      {
        enableLogLoading: enableLogLoading,
        sectionTitle: 'Logs',
        sectionIdx: 0,
        sourceType: sourceType,
        queryVars
      }
    ]
  } else if (stageType === 'cd') {
    // TODO implement for CD STAGE
    return []
  }

  return []
}

export function getStageType(node?: GraphLayoutNode): 'ci' | 'cd' | string {
  if (node?.moduleInfo?.ci) {
    return 'ci'
  } else if (node?.moduleInfo?.cd) {
    return 'cd'
  }
  return 'unknown'
}

/*
Rules:
| 'Running'      // stream
| 'Failed'       // blob
| 'NotStarted'   // do not load logs 
| 'Expired'      // do not load logs 
| 'Aborted'      // blob
| 'Queued'       // do not load logs 
| 'Paused'       // stream 
| 'Waiting'      // do not load logs 
| 'Success'      // blob
| 'Suspended'    // do not load logs 
*/

function isStatusRunningLike(status: 'Running' | string | undefined): boolean {
  return status === 'Running' || status === 'Paused'
}

function isStatusActiveLike(status: 'NotStarted' | 'Expired' | 'Waiting' | 'Suspended' | string | undefined): boolean {
  const nonActive = status === 'NotStarted' || status === 'Expired' || status === 'Waiting' || status === 'Suspended'
  return !nonActive
}

/**
 * Get log response from blob
 *
 * NOTE: Custom implementation as we cannot use DTO (response is a string)
 */
const logBlobPromise = (
  props: GetUsingFetchProps<string, void, LogBlobQueryParams, void>,
  signal?: RequestInit['signal']
) => getUsingFetch<string, void, LogBlobQueryParams, void>(getConfig('log-service'), `/blob`, props, signal)

/**
 * Get Logs from blob
 */
export async function getLogsFromBlob(
  queryParams: LogBlobQueryParams,
  signal?: RequestInit['signal']
): Promise<Line[]> {
  return logBlobPromise(
    {
      queryParams: pick(queryParams, ['key', 'accountID']) as LogBlobQueryParams,
      requestOptions: { headers: { 'X-Harness-Token': queryParams['X-Harness-Token'] } }
    },
    signal
  ).then((resp: string) => {
    const lines = resp.split('\n')
    let data: any[] = []
    try {
      data = lines.filter(line => line.length > 0).map(line => line && JSON.parse(line))
    } catch (ex) {
      // TBD: how to handle errors
      // response: {error_msg: "..."}
    }

    const parsedData = data.map((item: any) => {
      return {
        ...item,
        out: item?.out?.replace(`\n`, '')
      }
    })

    return parsedData
  })
}
