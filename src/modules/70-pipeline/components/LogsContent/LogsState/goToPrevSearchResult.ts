import produce from 'immer'
import type { Action, ActionType, State } from './types'

export function goToPrevSearchResult(state: State, _action: Action<ActionType.GoToPrevSearchResult>): State {
  return produce(state, draft => {
    const index = state.searchData.currentIndex
    const total = draft.searchData.linesWithResults.length
    draft.searchData.currentIndex = total > 0 ? (total + index - 1) % total : 0
  })
}
