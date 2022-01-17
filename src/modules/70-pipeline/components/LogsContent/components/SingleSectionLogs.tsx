/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
