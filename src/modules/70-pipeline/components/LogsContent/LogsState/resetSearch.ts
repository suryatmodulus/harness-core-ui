import produce from 'immer'
import { mapValues } from 'lodash-es'

import type { Action, ActionType, State } from './types'

export function resetSearch(state: State, _action: Action<ActionType.ResetSearch>): State {
  return produce(state, draft => {
    draft.searchData = { currentIndex: 0, text: '', linesWithResults: [] }
    draft.dataMap = mapValues(state.dataMap, unit => {
      return {
        ...unit,
        data: unit.data.map(({ searchIndices, ...rest }) => rest)
      }
    })
  })
}
