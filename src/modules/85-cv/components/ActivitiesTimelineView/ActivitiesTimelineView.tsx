import React, { useState } from 'react'
import { Container, Text, Button } from '@wings-software/uikit'
import cx from 'classnames'
import TimelineView, { TimelineViewProps } from '@common/components/TimelineView/TimelineView'
import type { ActivityDashboardDTO } from 'services/cv'
import { PredefinedLabels } from './TimelineViewLabel'
import { TimelineTooltip } from './TimelineTooltip'
import ActivitiesTimelineHeader from './ActivitiesTimelineHeader'
import EventSvg from './EventSvg'
import styles from './ActivitiesTimelineView.module.scss'

export interface EventData {
  startTime: number
  name: string
  verificationResult: ActivityDashboardDTO['verificationStatus']
  headerLabels?: {
    primary?: string
    secondary?: string
  }
  [x: string]: any
}

export interface ActivitiesTimelineViewProps {
  startTime: number
  endTime: number
  canSelect?: boolean
  preselectedEvent?: EventData
  deployments?: Array<EventData>
  configChanges?: Array<EventData>
  infrastructureChanges?: Array<EventData>
  otherChanges?: Array<EventData>
  className?: string
  timelineViewProps?: Omit<TimelineViewProps, 'startTime' | 'endTime' | 'renderItem' | 'rows'>
}

const MAX_STACKED_EVENTS = 3
const BATCH_BREAKPOINT = 70
const HORIZONTAL_STACK_OFFSET = 4

function generateEventsToPlot(items: EventData[]): EventData[] {
  if (!items?.length) return []
  if (items.length <= MAX_STACKED_EVENTS) return items
  const failedEvents = []
  const passedEvents = []
  const inProgressEvents = []

  for (const item of items) {
    if (item.verificationResult === 'ERROR' || item.verificationResult === 'VERIFICATION_FAILED') {
      failedEvents.push(item)
    } else if (item.verificationResult === 'VERIFICATION_PASSED') {
      passedEvents.push(item)
    } else if (item.verificationResult === 'IN_PROGRESS' || item.verificationResult === 'NOT_STARTED') {
      inProgressEvents.push(item)
    }
  }

  if (failedEvents.length && passedEvents.length && inProgressEvents.length) {
    return [...inProgressEvents.slice(0, 1), ...failedEvents.slice(0, 1), ...passedEvents.slice(0, 1)]
  }

  const typesWithEvents = []
  if (inProgressEvents.length) {
    typesWithEvents.push(inProgressEvents)
  }
  if (failedEvents.length) {
    typesWithEvents.push(failedEvents)
  }
  if (passedEvents.length) {
    typesWithEvents.push(passedEvents)
  }

  if (typesWithEvents.length === 1) {
    return typesWithEvents[0]
  }

  if (typesWithEvents[0].length >= typesWithEvents[1].length) {
    return [...typesWithEvents[0].slice(0, 2), ...typesWithEvents[1].slice(0, 1)]
  }

  return [...typesWithEvents[0].slice(0, 1), ...typesWithEvents[1]?.slice(0, 2)]
}

export default function ActivitiesTimelineView({
  startTime,
  endTime,
  canSelect,
  preselectedEvent,
  deployments = [],
  configChanges = [],
  infrastructureChanges = [],
  otherChanges = [],
  timelineViewProps,
  className
}: ActivitiesTimelineViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventData | undefined>()
  const [zoomRange, setZoomRange] = useState<{ startTime: number; endTime: number } | undefined>()

  const zoomIn = (items: Array<EventData>) => {
    let zoomStartTime = items[0].startTime
    let zoomEndTime = items[items.length - 1].startTime
    const diff = zoomEndTime - zoomStartTime || 1000 * 60 * 5
    zoomStartTime = Math.max(zoomStartTime - Math.floor(diff / 2), startTime)
    zoomEndTime = Math.min(zoomEndTime + Math.floor(diff / 2), endTime)
    setZoomRange({
      startTime: zoomStartTime,
      endTime: zoomEndTime
    })
  }

  const zoomOut = () => setZoomRange(undefined)

  const renderItem = (item: EventData) => {
    return (
      <Container className={styles.eventItem}>
        <TimelineTooltip items={[item]}>
          <EventSvg
            selected={item === selectedEvent || item === preselectedEvent}
            item={item}
            onSelect={canSelect ? setSelectedEvent : undefined}
          />
        </TimelineTooltip>
        <Text font={{ size: 'xsmall' }} lineClamp={1} width={BATCH_BREAKPOINT}>
          {item.name}
        </Text>
      </Container>
    )
  }
  const renderBatch = (items: Array<EventData>) => {
    const itemsToRender = generateEventsToPlot(items)
    const aditionalStyles: any = {}
    const selectedEventIndex = itemsToRender.findIndex(i => i === selectedEvent || i === preselectedEvent)
    if (selectedEventIndex >= 0) {
      const start = itemsToRender[0].startTime
      const end = itemsToRender[itemsToRender.length - 1].startTime
      if (end - start > 0) {
        const x = itemsToRender[selectedEventIndex].startTime
        const percentagePart = ((x - start) * 100) / (end - start)
        const absolutePart = selectedEventIndex * HORIZONTAL_STACK_OFFSET
        aditionalStyles.width = 0
        aditionalStyles.marginLeft = `calc(${percentagePart}% - ${absolutePart}px)`
      }
    }
    return (
      <Container className={styles.eventBatch} style={aditionalStyles}>
        <TimelineTooltip items={items}>
          <Container onClick={() => zoomIn(items)} className={styles.itemsGroup}>
            {itemsToRender.map((item: EventData, index: number) =>
              index + 1 > MAX_STACKED_EVENTS ? null : (
                <EventSvg
                  key={index}
                  selected={item === selectedEvent || item === preselectedEvent}
                  style={{
                    top: -index * 2,
                    left: index * HORIZONTAL_STACK_OFFSET,
                    zIndex: MAX_STACKED_EVENTS - index
                  }}
                  item={item}
                />
              )
            )}
          </Container>
        </TimelineTooltip>
        {selectedEventIndex === -1 && (
          <Text font={{ size: 'xsmall' }} lineClamp={1} width={BATCH_BREAKPOINT}>{`${items.length} Events`}</Text>
        )}
      </Container>
    )
  }

  const selectedRange = zoomRange || { startTime, endTime }

  return (
    <Container className={cx(styles.main, className)}>
      {zoomRange && (
        <Button
          className={styles.resetZoomButton}
          iconProps={{ size: 12 }}
          rightIcon="main-zoom-out"
          minimal
          onClick={zoomOut}
        ></Button>
      )}
      {(canSelect || preselectedEvent) && (
        <ActivitiesTimelineHeader selectedItem={selectedEvent || (zoomRange ? undefined : preselectedEvent)} />
      )}
      <TimelineView
        {...selectedRange}
        labelsWidth={215}
        rows={[
          {
            name: PredefinedLabels.deployments,
            data: deployments
          },
          {
            name: PredefinedLabels.configChanges,
            data: configChanges
          },
          {
            name: PredefinedLabels.infrastructureChanges,
            data: infrastructureChanges
          },
          {
            name: PredefinedLabels.otherChanges,
            data: otherChanges
          }
        ]}
        renderItem={renderItem}
        minItemsDistance={BATCH_BREAKPOINT}
        renderBatch={renderBatch}
        {...timelineViewProps}
      />
    </Container>
  )
}

export function ActivitiesFlagBorder() {
  return <Container className="activities-timeline-flag-border" />
}

export function MockedActivitiesTimelineView() {
  const [startDate] = useState(1602590400000)
  const [endDate] = useState(1602590400000 + 4 * 60 * 60 * 1000)
  return (
    <ActivitiesTimelineView
      startTime={startDate}
      endTime={endDate}
      canSelect
      deployments={[
        { startTime: 1602590400000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' },
        { startTime: 1602590400000 + 30 * 60 * 1000, name: 'DB Deletion 2', verificationResult: 'VERIFICATION_PASSED' },
        {
          startTime: 1602590400000 + 120 * 60 * 1000,
          name: 'DB Deletion 3',
          verificationResult: 'VERIFICATION_FAILED'
        },
        {
          startTime: 1602590400000 + 140 * 60 * 1000,
          name: 'DB Deletion 4',
          verificationResult: 'VERIFICATION_PASSED'
        },
        { startTime: 1602590400000 + 170 * 60 * 1000, name: 'DB Deletion 5', verificationResult: 'VERIFICATION_FAILED' }
      ]}
    />
  )
}
