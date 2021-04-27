import produce from 'immer'
import { set } from 'lodash-es'
import type { Action, ActionType, State } from './types'

export function resetSectionData(state: State, action: Action<ActionType.ResetSection>): State {
  const { payload } = action

  return produce(state, draft => {
    set(draft.dataMap[payload], 'status', state.dataMap[payload].unitStatus)
    set(draft.dataMap[payload], 'isOpen', false)
  })
}
