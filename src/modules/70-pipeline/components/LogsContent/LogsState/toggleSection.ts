import produce from 'immer'
import { set } from 'lodash-es'

import type { Action, ActionType, State } from './types'

export function toggleSection(state: State, action: Action<ActionType.ToggleSection>): State {
  const { payload } = action

  return produce(state, draft => {
    set(draft.dataMap[payload], 'isOpen', !state.dataMap[payload].isOpen)
    set(draft.dataMap[payload], 'manuallyToggled', true)
  })
}
