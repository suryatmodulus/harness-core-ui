import React from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import type { UseActionCreatorReturn } from '../LogsState/actions'
import type { State } from '../LogsState/types'
import { MultiLogLine } from './MultiLogLine/MultiLogLine'

export interface SingleSectionLogsProps {
  state: State
  actions: UseActionCreatorReturn
}

export function SingleSectionLogs(
  props: SingleSectionLogsProps,
  ref: React.ForwardedRef<VirtuosoHandle | null>
): React.ReactElement {
  const { state } = props

  const unitKey = state.logKeys[0]
  const unit = state.dataMap[unitKey]
  const length = unit.data.length

  return (
    <Virtuoso
      overscan={50}
      totalCount={length}
      ref={ref}
      followOutput="auto"
      itemContent={index => (
        <MultiLogLine
          {...unit.data[index]}
          lineNumber={index}
          limit={length}
          searchText={state.searchData.text}
          currentSearchIndex={state.searchData.currentIndex}
        />
      )}
    />
  )
}

export const SingleSectionLogsWithRef = React.forwardRef<VirtuosoHandle | null, SingleSectionLogsProps>(
  SingleSectionLogs
)
