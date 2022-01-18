/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
