import React from 'react'
import { Color, IconName, Text } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { getConfig, getUsingFetch, GetUsingFetchProps } from 'services/config'
import type { Line, LogBlobQueryParams, LogStreamQueryParams } from 'services/logs'
import type { ExecutionNode, GraphLayoutNode } from 'services/pipeline-ng'
import { LITE_ENGINE_TASK } from '@pipeline/utils/executionUtils'
import { isExecutionComplete } from '@pipeline/utils/statusHelpers'

export enum LogsStatus {
  Running = 'RUNNING',
  Failure = 'FAILURE',
  Success = 'SUCCESS',
  Paused = 'PAUSED'
}

export interface LogsContentSection {
  enableLogLoading: boolean
  sectionTitle: string | ((sectionIdx: number) => JSX.Element)
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
  step?: ExecutionNode,
  disableAuto?: boolean,
  forceLoadSectionIdx?: number
): LogsContentSection[] {
  // TODO: remove some/all of the logic for CI to BE after beta
  if (stageType === 'ci') {
    let enableLogLoading =
      !!logsToken &&
      !!accountId &&
      !!orgIdentifier &&
      !!projectIdentifier &&
      !!runSequence &&
      !!pipelineIdentifier &&
      !!stageIdentifier &&
      !!stageStatus &&
      !!step?.identifier &&
      !!step?.status &&
      !!step?.stepType

    let sourceType = 'blob'
    if (step?.stepType === 'dependency-service') {
      // for dependency service we use STAGE status
      if (isStatusRunningLike(stageStatus)) {
        sourceType = 'stream'
      }
      enableLogLoading = isStatusActiveLike(stageStatus) && enableLogLoading
    } else {
      if (isStatusRunningLike(step?.status)) {
        sourceType = 'stream'
      }
      enableLogLoading = isStatusActiveLike(step?.status) && enableLogLoading
    }

    let key
    // NOTE: exception for Initialize/liteEngineTask
    if (step?.stepType === LITE_ENGINE_TASK) {
      // TODO: DTO
      const taskObj = (step?.executableResponses?.find(item => item['task']) as any)?.task
      key = taskObj?.logKeys?.[0]

      enableLogLoading = !!key && enableLogLoading
    } else {
      key = `${accountId}/${orgIdentifier}/${projectIdentifier}/${pipelineIdentifier}/${runSequence}/${stageIdentifier}/${step?.identifier}`
    }

    const queryVars = {
      accountID: `${accountId}`,
      key,
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
    // CD stage logs data
    // TODO: DTO
    // NOTE: first element for logKeys and units
    const taskObj = (step?.executableResponses?.[0]?.taskChain as any) || (step?.executableResponses?.[0]?.task as any)
    const logKeys = taskObj?.logKeys || []
    const sectionTitles = taskObj?.units || []
    const isStepCompleted = isExecutionComplete(step?.status)

    // NOTE: second element for progress
    const taskId =
      step?.executableResponses?.[1]?.taskChain?.taskId || step?.executableResponses?.[0]?.task?.taskId || ''
    const nameStatusMap = new Map<string, string>()
    const progressData = step?.taskIdToProgressDataMap?.[taskId] || []
    progressData.forEach(item => {
      nameStatusMap.set(item.commandUnitName, item.commandExecutionStatus)
    })
    const currentRunningIdx = getCurrentRunningUnitIdx(nameStatusMap, sectionTitles)

    return logKeys.map((key: string, idx: number) => {
      let enableLogLoading =
        forceLoadSectionIdx !== -1
          ? forceLoadSectionIdx === idx
          : currentRunningIdx !== -1
          ? currentRunningIdx === idx
          : idx === 0

      // overwrite
      if (disableAuto && forceLoadSectionIdx === -1) {
        enableLogLoading = false
      }

      return {
        enableLogLoading,
        sectionTitle: function logTitle(sectionIdx: number) {
          const status = nameStatusMap.get(sectionTitles[sectionIdx]) as LogsStatus
          return (
            <Text icon={getLogStatusIcon(isStepCompleted, status)} iconProps={getLogStatusIconProps(status)}>
              {sectionTitles[idx] || ''}
            </Text>
          )
        },
        sectionIdx: idx,
        sourceType: currentRunningIdx === idx && !isStepCompleted ? 'stream' : 'blob',
        queryVars: {
          accountID: `${accountId}`,
          key,
          'X-Harness-Token': logsToken!
        }
      }
    })
  }

  return []
}

export function getLogStatusIconProps(status?: LogsStatus): Omit<IconProps, 'name'> {
  if (status === LogsStatus.Failure) {
    return { padding: { right: 'medium' }, color: Color.RED_500 }
  } else if (status === LogsStatus.Paused) {
    return { padding: { right: 'medium' }, color: Color.ORANGE_400 }
  } else {
    return { padding: { right: 'medium' } }
  }
}
export function getLogStatusIcon(isStepCompleted: boolean, status?: LogsStatus): IconName | undefined {
  if (status === LogsStatus.Failure) {
    return 'circle-cross'
  } else if (status === LogsStatus.Paused) {
    return 'pause'
  } else if (status === LogsStatus.Running && !isStepCompleted) {
    return 'spinner'
  } else if (status) {
    return 'tick-circle'
  }
  return 'circle'
}

export function getStageType(node?: GraphLayoutNode): 'ci' | 'cd' | string {
  if (node?.moduleInfo?.ci) {
    return 'ci'
  } else if (node?.moduleInfo?.cd) {
    return 'cd'
  }
  return 'unknown'
}

function getCurrentRunningUnitIdx(nameStatusMap: Map<string, string>, unitNames: string[]): number {
  let runningIdx = -1
  unitNames.forEach((unitName: string, idx: number) => {
    if (nameStatusMap.get(unitName) === 'RUNNING') {
      runningIdx = idx
    }
  })

  return runningIdx
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

export function isStatusRunningLike(status: 'Running' | string | undefined): boolean {
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
    let data: any[] = []
    try {
      const lines = resp.split('\n')
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
