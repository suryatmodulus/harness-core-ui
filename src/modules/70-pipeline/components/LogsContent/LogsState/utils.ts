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
