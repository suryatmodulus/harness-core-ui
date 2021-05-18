import { findLast, set, snakeCase } from 'lodash-es'

import {
  isExecutionComplete,
  isExecutionFailed,
  isExecutionRunningLike,
  isExecutionSuccess
} from '@pipeline/utils/statusHelpers'
import type { LogViewerAccordionStatus } from '@common/components/MultiLogsViewer/LogViewerAccordion'
import type { Action, ActionType, LogSectionData, State, ProgressMapValue } from './types'

const NON_MUTATE_STATES: LogViewerAccordionStatus[] = ['LOADING', 'QUEUED']

export function createSections(state: State, action: Action<ActionType.CreateSections>): State {
  const { node, selectedStep, selectedStage } = action.payload

  if (!node) return { units: [], selectedStage, selectedStep, dataMap: {} }

  const isSameStage = selectedStage === state.selectedStage
  const isSameStep = isSameStage && selectedStep === state.selectedStep

  /**
   * task object must always be picked from the first entry
   * in `executableResponses`
   *
   * It can be either be a `taskChain`, `task` or `sync`
   */
  const executableResponse = node?.executableResponses?.[0] || {}
  const task =
    executableResponse.taskChain ||
    executableResponse.task ||
    executableResponse.sync ||
    executableResponse.async ||
    executableResponse.child

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
    const isRunning = isExecutionRunningLike(unitStatus)

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

    const runningUnit = findLast(units, unit => isExecutionRunningLike(dataMap[unit]?.unitStatus))
    key = runningUnit || null
  }

  if (key) {
    // if we are opening a section the set it to loading
    if (dataMap[key].status !== 'QUEUED' && !dataMap[key].data) {
      set(dataMap[key], 'status', 'LOADING')
    }

    set(dataMap[key], 'isOpen', true)
  }

  return { units, dataMap, selectedStep, selectedStage }
}
