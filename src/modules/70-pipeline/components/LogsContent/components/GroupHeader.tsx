import React from 'react'
import { Icon, IconName } from '@wings-software/uicore'

import { Duration } from '@common/components'

import css from './GroupedHeader.module.scss'

export type LogViewerAccordionStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING' | 'NOT_STARTED' | 'LOADING' | 'QUEUED'

export interface GroupHeaderProps {
  title: React.ReactNode
  startTime?: number
  endTime?: number
  id: string
  status: LogViewerAccordionStatus
  isOpen?: boolean
  onSectionClick?(id: string, props: GroupHeaderProps): boolean | void
}

const statusIconMap: Record<LogViewerAccordionStatus, IconName> = {
  SUCCESS: 'tick-circle',
  FAILURE: 'circle-cross',
  RUNNING: 'spinner',
  QUEUED: 'spinner',
  NOT_STARTED: 'circle',
  LOADING: 'circle'
}

/**
 * Component which renders a section of a log
 */
export function GroupHeader(props: GroupHeaderProps): React.ReactElement {
  const { title, isOpen, status, id, onSectionClick, startTime, endTime } = props
  const [open, setOpen] = React.useState(!!isOpen)

  // sync `isOpen` flag
  React.useEffect(() => {
    setOpen(!!isOpen)
  }, [isOpen, setOpen])

  /**
   * Toggle the accordion
   */
  function toggleStatus(): void {
    const ret = onSectionClick?.(id, props)

    if (ret !== false) {
      setOpen(e => {
        return !e
      })
    }
  }

  const isLoading = status === 'LOADING'

  return (
    <div className={css.groupedHeader} data-open={open} data-status={status?.toLowerCase()}>
      <div className={css.sectionSummary} onClick={toggleStatus}>
        <Icon className={css.chevron} name={isLoading ? 'spinner' : 'chevron-right'} />
        <Icon
          className={css.status}
          name={status && status in statusIconMap ? statusIconMap[status] : 'circle'}
          size={12}
        />
        <div className={css.text}>
          <div>{title}</div>
          {startTime ? (
            <Duration className={css.duration} durationText=" " startTime={startTime} endTime={endTime} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
