import produce from 'immer'
import type { Action, ActionType, State } from './types'

export function resetSearch(state: State, _action: Action<ActionType.ResetSearch>): State {
  return produce(state, draft => {
    draft.searchData.currentIndex--
  })
}
