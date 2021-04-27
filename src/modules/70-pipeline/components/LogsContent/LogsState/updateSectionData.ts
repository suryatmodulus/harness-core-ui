import produce from 'immer'
import { set } from 'lodash-es'
import { formatStringDataToLogContentArray } from '@common/components/MultiLogsViewer/LogLine'
import type { Action, ActionType, State } from './types'

const LOG_TYPE_LENGTH = 4
const TIMESTAMP_LENGTH = 24

export function updateSectionData(state: State, action: Action<ActionType.UpdateSectionData>): State {
  const { payload } = action

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
    if (unit?.dataSource === 'blob') {
      set(draft.dataMap[payload.id], 'status', unit.unitStatus)
    }

    set(draft.dataMap[payload.id], 'formattedData', formatStringDataToLogContentArray(payload.data))
    set(draft.dataMap[payload.id], 'isOpen', true)
    set(draft.dataMap[payload.id], 'data', data.trim())
  })
}
