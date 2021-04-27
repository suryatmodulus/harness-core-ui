import { findLast, set, snakeCase } from 'lodash-es'

import {
  isExecutionComplete,
  isExecutionFailed,
  isExecutionRunning,
  isExecutionRunningLike,
  isExecutionSuccess
} from '@pipeline/utils/statusHelpers'
import { LITE_ENGINE_TASK } from '@pipeline/utils/executionUtils'
import type { LogViewerAccordionStatus } from '@common/components/MultiLogsViewer/LogViewerAccordion'
import type { Action, ActionType, LogSectionData, State, ProgressMapValue } from './types'

const NON_MUTATE_STATES: LogViewerAccordionStatus[] = ['LOADING', 'QUEUED']

export function createSections(state: State, action: Action<ActionType.CreateSections>): State {
  const {
    node,
    module,
    accountId,
    orgIdentifier,
    pipelineIdentifier,
    projectIdentifier,
    runSequence,
    stageIdentifier,
    selectedStep,
    stageStatus
  } = action.payload

  if (!node) return state

  const isSameStep = selectedStep === state.selectedStep

  if (module === 'ci') {
    const units = ['Logs']

    const dataSource =
      (node.stepType === 'dependency-service' && isExecutionRunningLike(stageStatus)) ||
      isExecutionRunningLike(node.status)
        ? 'stream'
        : 'blob'

    const sectionData: LogSectionData = {
      title: 'Logs',
      id: 'Logs',
      data: isSameStep ? state.dataMap?.Logs?.data || '' : '',
      dataSource,
      isOpen: isSameStep ? state.dataMap?.Logs?.isOpen : dataSource === 'stream',
      status: isSameStep ? state.dataMap?.Logs?.status : 'NOT_STARTED',
      unitStatus: isSameStep ? state.dataMap?.Logs?.unitStatus : 'NOT_STARTED',
      logKey:
        node.stepType === LITE_ENGINE_TASK
          ? ((node.executableResponses || []).find(item => item.task)?.task as any)?.logKeys?.[0]
          : `${accountId}/${orgIdentifier}/${projectIdentifier}/${pipelineIdentifier}/${runSequence}/${stageIdentifier}/${node?.identifier}`,
      formattedData: isSameStep ? state.dataMap?.Logs?.formattedData || [] : []
    }

    return { units, dataMap: { [units[0]]: sectionData }, selectedStep }
  } else {
    /**
     * task object must always be picked from the first entry
     * in `executableResponses`
     *
     * It can be either be a `taskChain`, `task` or `sync`
     */
    const executableResponse = node?.executableResponses?.[0] || {}
    const task =
      executableResponse.taskChain || executableResponse.task || executableResponse.sync || executableResponse.async

    // eslint-disable-next-line prefer-const
    let { units = [], logKeys = [] } = task || ({} as any)
    const progressMap = new Map<string, ProgressMapValue>()
    const isStepComplete = isExecutionComplete(node.status)
    let hasNoUnits = false

    if (units.length === 0 && logKeys.length > 0) {
      hasNoUnits = true
      units = logKeys.map((_: unknown, i: number) => `Section ${i + 1}`)
    }

    if (Array.isArray(node.unitProgresses)) {
      node.unitProgresses.forEach(row => {
        if (row.unitName) {
          progressMap.set(row.unitName, {
            status: row.status as LogViewerAccordionStatus,
            startTime: row.startTime,
            endTime: row.endTime
          })
        }
      })
    }

    const dataMap = units.reduce((acc: Record<string, LogSectionData>, unit: string, i: number) => {
      /**
       * progressMap must have a status for this unit.
       * In case it doesn't, fallback to the 'UNKNOWN' status.
       */
      const unitProgress = hasNoUnits
        ? { status: snakeCase(node.status || 'NotStarted').toUpperCase() as LogViewerAccordionStatus }
        : progressMap.get(unit)
      const unitStatus: LogViewerAccordionStatus = unitProgress?.status || 'NOT_STARTED'
      const currentStatus = state.dataMap[unit]?.status
      const manuallyToggled = !!state.dataMap[unit]?.manuallyToggled
      const isRunning = isExecutionRunning(unitStatus)

      acc[unit] = {
        title: unit,
        id: unit,
        data: isSameStep ? state.dataMap[unit]?.data || '' : '',
        logKey: logKeys[i],
        isOpen: isSameStep && manuallyToggled ? state.dataMap[unit]?.isOpen : isRunning,
        manuallyToggled: isSameStep ? manuallyToggled : false,
        status: isSameStep && NON_MUTATE_STATES.includes(currentStatus) && isRunning ? currentStatus : unitStatus,
        unitStatus,
        startTime: unitProgress?.startTime,
        endTime: unitProgress?.endTime,
        dataSource: isRunning ? 'stream' : 'blob',
        formattedData: isSameStep ? state.dataMap[unit]?.formattedData || [] : []
      }

      return acc
    }, {})

    let key: string | null = null

    if (isStepComplete) {
      const isStepSuccess = isExecutionSuccess(node.status)

      // if step is successful
      if (isStepSuccess) {
        // open the first section
        key = units[0]
      } else {
        // find and open the first failed section
        const failedUnit = units.find((unit: string) => isExecutionFailed(dataMap[unit]?.unitStatus))
        key = failedUnit || null
      }
    } else {
      // open the running section
      const runningUnit = findLast([...progressMap.keys()], unit => isExecutionRunning(dataMap[unit]?.unitStatus))
      key = runningUnit || null
    }

    // if we are openening a section the set it to loading
    if (key && dataMap[key].status !== 'QUEUED') {
      set(dataMap[key], 'status', 'LOADING')
    }

    return { units, dataMap, selectedStep }
  }

  return state
}
