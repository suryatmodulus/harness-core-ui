import produce from 'immer'
import { get, set } from 'lodash-es'
import type { Action, ActionType, State } from './types'

export function resetSectionData(state: State, action: Action<ActionType.ResetSection>): State {
  const { payload } = action
  const unit = get(state, ['dataMap', payload])

  if (!unit) return state

  return produce(state, draft => {
    set(draft.dataMap[payload], 'status', unit.unitStatus)
    set(draft.dataMap[payload], 'isOpen', false)
  })
}
