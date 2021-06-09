import React from 'react'
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso'
import { sum } from 'lodash-es'

import { GroupHeader, GroupHeaderProps, LogViewerAccordionStatus } from './GroupHeader/GroupHeader'
import { MultiLogLine } from './MultiLogLine/MultiLogLine'
import type { State } from '../LogsState/types'
import type { UseActionCreatorReturn } from '../LogsState/actions'

const STATUSES_FOR_ACCORDION_SKIP: LogViewerAccordionStatus[] = ['LOADING', 'NOT_STARTED']

export interface GroupedLogsProps {
  state: State
  actions: UseActionCreatorReturn
}

export function GroupedLogs(
  props: GroupedLogsProps,
  ref: React.ForwardedRef<null | GroupedVirtuosoHandle>
): React.ReactElement {
  const { state, actions } = props

  const groupedCounts = state.logKeys.map(key => {
    const section = state.dataMap[key]
    return section.isOpen ? section.data.length : 0
  })

  function handleSectionClick(id: string, _props: GroupHeaderProps): boolean | void {
    const currentSection = state.dataMap[id]

    if (currentSection?.status && STATUSES_FOR_ACCORDION_SKIP.includes(currentSection?.status)) {
      return false
    }

    if (!currentSection?.data.length) {
      actions.fetchSectionData(id)
    } else {
      actions.toggleSection(id)
    }

    return false
  }

  return (
    <GroupedVirtuoso
      overscan={5}
      ref={ref}
      groupCounts={groupedCounts}
      followOutput={() => 'auto'}
      groupContent={index => {
        const logKey = state.logKeys[index]
        const unit = state.dataMap[logKey]

        return <GroupHeader {...unit} id={logKey} onSectionClick={handleSectionClick} />
      }}
      itemContent={(index, groupIndex) => {
        const logKey = state.logKeys[groupIndex]
        const unit = state.dataMap[logKey]
        const previousCount = sum(groupedCounts.slice(0, groupIndex))
        const lineNumber = index - previousCount
        const logData = unit.data[lineNumber]

        return (
          <MultiLogLine
            {...logData}
            lineNumber={lineNumber}
            limit={unit.data.length}
            searchText={state.searchData.text}
            currentSearchIndex={state.searchData.currentIndex}
          />
        )
      }}
    />
  )
}

export const GroupedLogsWithRef = React.forwardRef<null | GroupedVirtuosoHandle, GroupedLogsProps>(GroupedLogs)
