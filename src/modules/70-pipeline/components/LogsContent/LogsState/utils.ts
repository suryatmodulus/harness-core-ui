/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { escapeStringRegexp } from '@common/utils/StringUtils'

import type { State } from './types'

export function getRegexForSearch(str: string): RegExp {
  return new RegExp(escapeStringRegexp(str), 'gi')
}

export function getDefaultReducerState(props: Partial<Pick<State, 'selectedStage' | 'selectedStep'>> = {}): State {
  return {
    units: [],
    logKeys: [],
    selectedStage: props.selectedStage || '',
    selectedStep: props.selectedStep || '',
    dataMap: {},
    searchData: {
      text: '',
      currentIndex: 0,
      linesWithResults: []
    }
  }
}

export const logsCache = new Map<string, string>()
