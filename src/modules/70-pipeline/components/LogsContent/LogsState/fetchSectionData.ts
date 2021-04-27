import produce from 'immer'
import { set } from 'lodash-es'
import type { Action, ActionType, State } from './types'

export function fetchSectionData(state: State, action: Action<ActionType.FetchSectionData>): State {
  const { payload } = action

  return produce(state, draft => {
    set(draft.dataMap[payload], 'status', 'LOADING')
  })
}
