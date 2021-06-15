import produce from 'immer'
import { set } from 'lodash-es'
import { sanitizeHTML } from '@common/utils/StringUtils'
import type { Action, ActionType, State, LogSectionData } from './types'

export function updateSectionData(state: State, action: Action<ActionType.UpdateSectionData>): State {
  const { payload } = action

  return produce(state, draft => {
    const unit = state.dataMap[payload.id]
    const data = payload.data.split('\n').reduce<LogSectionData['data']>((accumulator, line) => {
      if (line.length > 0) {
        try {
          const { level, time, out } = JSON.parse(line) as Record<string, string>

          accumulator.push({ text: { level: sanitizeHTML(level), time, out: sanitizeHTML(out) } })
        } catch (e) {
          //
        }
      }

      return accumulator
    }, [])

    // update status only for blob data
    if (unit?.dataSource === 'blob') {
      set(draft.dataMap[payload.id], 'status', unit.unitStatus)
    }

    set(draft.dataMap[payload.id], 'isOpen', true)
    set(draft.dataMap[payload.id], 'data', data)
  })
}
