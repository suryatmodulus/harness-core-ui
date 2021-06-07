import produce from 'immer'
import type { Action, ActionType, State } from './types'

export function goToNextSearchResult(state: State, _action: Action<ActionType.GoToNextSearchResult>): State {
  return produce(state, draft => {
    const index = state.searchData.currentIndex
    const total = draft.searchData.linesWithResults.length
    draft.searchData.currentIndex = total > 0 ? (index + 1) % total : 0
  })
}
