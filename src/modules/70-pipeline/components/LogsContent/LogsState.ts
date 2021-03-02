import produce from 'immer'
import { set, findLast, snakeCase } from 'lodash-es'

import type { ExecutionNode, UnitProgress } from 'services/cd-ng'
import {
  isExecutionComplete,
  isExecutionSuccess,
  isExecutionFailed,
  isExecutionRunning,
  isExecutionRunningLike
} from '@pipeline/utils/statusHelpers'
import type { LogViewerAccordionStatus } from '@common/components/MultiLogsViewer/MultiLogsViewer'
import { LITE_ENGINE_TASK } from '@pipeline/utils/executionUtils'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'

export interface ProgressMapValue extends Pick<UnitProgress, 'startTime' | 'endTime'> {
  status: LogViewerAccordionStatus
}

export enum ActionType {
  CreateSections = 'CreateSections',
  FetchSectionData = 'FetchSectionData',
  FetchingSectionData = 'FetchingSectionData',
  UpdateSectionData = 'UpdateSectionData',
  ToggleSection = 'ToggleSection'
}

export interface LogSectionData {
  title: React.ReactNode
  data: string
  startTime?: number
  endTime?: number
  id: string
  status: LogViewerAccordionStatus
  isOpen?: boolean
  logKey: string
  dataSource: 'blob' | 'stream'
  unitStatus: LogViewerAccordionStatus
  manuallyToggled?: boolean
}

export interface CreateSectionsPayload extends ExecutionPathProps {
  node: ExecutionNode
  module: 'cd' | 'ci' | 'unknown'
  stageIdentifier: string
  stageStatus?: string
  runSequence?: number
  selectedStep: string
}

export interface Action<T extends ActionType> {
  type: T
  payload: T extends ActionType.CreateSections
    ? CreateSectionsPayload
    : T extends ActionType.FetchSectionData
    ? string
    : T extends ActionType.FetchingSectionData
    ? string
    : T extends ActionType.UpdateSectionData
    ? { id: string; data: string }
    : T extends ActionType.ToggleSection
    ? string
    : never
}

export interface State {
  units: string[]
  dataMap: Record<string, LogSectionData>
  selectedStep: string
}

const LOG_TYPE_LENGTH = 4
const TIMESTAMP_LENGTH = 24
const NON_MUTATE_STATES: LogViewerAccordionStatus[] = ['LOADING', 'QUEUED']

export function reducer<T extends ActionType>(state: State, action: Action<T>): State {
  switch (action.type) {
    // Action for creating the sections
    case ActionType.CreateSections: {
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
      } = (action as Action<ActionType.CreateSections>).payload

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
              : `${accountId}/${orgIdentifier}/${projectIdentifier}/${pipelineIdentifier}/${runSequence}/${stageIdentifier}/${node?.identifier}`
        }

        return { units, dataMap: { [units[0]]: sectionData }, selectedStep }
      } else if (module === 'cd') {
        /**
         * task object must always be picked from the first entry
         * in `executableResponses`
         *
         * It can be either be a `taskChain` or a `task`
         */
        const task = node?.executableResponses?.[0]?.taskChain || node?.executableResponses?.[0]?.task

        const { units = [], logKeys = [] } = task || ({} as any)
        const progressMap = new Map<string, ProgressMapValue>()
        const isStepComplete = isExecutionComplete(node.status)
        let useUnitProgresses = true

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
        } else {
          // This section is meant for backward compatability, Should be removed after some time
          useUnitProgresses = false
          /**
           * taskId to use to pick the progress data
           * NOTE: second element for progress
           */
          const taskId =
            node?.executableResponses?.[1]?.taskChain?.taskId || node?.executableResponses?.[0]?.task?.taskId || ''

          /**
           * `taskIdToProgressDataMap` is an array with statuses for all the units.
           * It may have multiple entries for a given unit.
           * We must use the latest one always.
           *
           * Hence we loop over the entries nand create a map out of it.
           */
          ;(node?.taskIdToProgressDataMap?.[taskId] || []).forEach(row => {
            if (row.commandUnitName) {
              progressMap.set(row.commandUnitName, {
                status: row.commandExecutionStatus,
                startTime: 0,
                endTime: 0
              })
            }
          }, {})
        }

        const getStatusforUnitLegacy = (unit: string, index: number): ProgressMapValue['status'] => {
          const unitProgress = progressMap.get(unit)

          if (isStepComplete && (isExecutionRunning(unitProgress?.status) || logKeys[index])) {
            return snakeCase(node.status).toUpperCase() as ProgressMapValue['status']
          }

          return unitProgress?.status || 'NOT_STARTED'
        }

        const dataMap = units.reduce((acc: Record<string, LogSectionData>, unit: string, i: number) => {
          /**
           * progressMap must have a status for this unit.
           * In case it doesn't, fallback to the 'UNKNOWN' status.
           */
          const unitProgress = progressMap.get(unit)
          const unitStatus: LogViewerAccordionStatus = useUnitProgresses
            ? unitProgress?.status || 'NOT_STARTED'
            : getStatusforUnitLegacy(unit, i)

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
            dataSource: isRunning ? 'stream' : 'blob'
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
            const failedUnit = units.find((unit: string) => isExecutionFailed(dataMap[unit].unitStatus))
            key = failedUnit || null
          }
        } else {
          // open the running section
          const runningUnit = findLast([...progressMap.keys()], unit => isExecutionRunning(dataMap[unit].unitStatus))
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
    // Action to fetch the section data
    case ActionType.FetchSectionData: {
      const payload = (action as Action<ActionType.FetchSectionData>).payload

      return produce(state, draft => {
        set(draft.dataMap[payload], 'status', 'LOADING')
      })
    }
    // Action for fetching the section data
    case ActionType.FetchingSectionData: {
      const payload = (action as Action<ActionType.FetchingSectionData>).payload

      return produce(state, draft => {
        set(draft.dataMap[payload], 'status', 'QUEUED')
      })
    }
    // Action for updating the section data
    case ActionType.UpdateSectionData: {
      const payload = (action as Action<ActionType.UpdateSectionData>).payload

      if (state.dataMap[payload.id]?.data === payload.data) return state

      return produce(state, draft => {
        const unit = state.dataMap[payload.id]
        const data = payload.data.split('\n').reduce((str, line) => {
          if (line.length > 0) {
            let lineStr = line

            try {
              const { level, time, out } = JSON.parse(line) as Record<string, string>

              // fix padding in timestamp
              const timeStr = time.padEnd?.(TIMESTAMP_LENGTH, ' ') || time

              // clean up the out string and add left padding to make it align correctly
              const outStr = out
                .trim()
                .split('\n')
                .map((l, i) => (i === 0 ? l : `${' '.repeat(LOG_TYPE_LENGTH)}\t${' '.repeat(TIMESTAMP_LENGTH)}\t${l}`))
                .join('\n')

              lineStr = `${level}\t${timeStr}\t${outStr}`
            } catch (e) {
              //
            }

            lineStr = lineStr.trim()

            if (lineStr.length > 0) {
              return `${str}\n${lineStr}`
            }
          }

          return str
        }, '')

        // update status only for blob data
        if (unit.dataSource === 'blob') {
          set(draft.dataMap[payload.id], 'status', unit.unitStatus)
        }

        set(draft.dataMap[payload.id], 'isOpen', true)
        set(draft.dataMap[payload.id], 'data', data.trim())
      })
    }
    // Action for toggling a section
    case ActionType.ToggleSection: {
      const payload = (action as Action<ActionType.ToggleSection>).payload
      return produce(state, draft => {
        set(draft.dataMap[payload], 'isOpen', !state.dataMap[payload].isOpen)
        set(draft.dataMap[payload], 'manuallyToggled', true)
      })
    }
    default:
      return state
  }
}
