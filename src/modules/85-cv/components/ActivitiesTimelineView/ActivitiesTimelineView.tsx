import React, { useState } from 'react'
import { Container, Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import TimelineView, { TimelineViewProps } from '@cv/components/TimelineView/TimelineView'
import type { ActivityDashboardDTO } from 'services/cv'
import { useStrings } from 'framework/exports'
import { PredefinedLabels } from './TimelineViewLabel'
import { EventDetailsForChange } from '../EventDetailsForChange/EventDetailsForChange'
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
  infrastructureChanges?: Array<EventData>
  otherChanges?: Array<EventData>
  className?: string
  timelineViewProps?: Omit<TimelineViewProps, 'startTime' | 'endTime' | 'renderItem' | 'rows'>
}

const MAX_STACKED_EVENTS = 3
const BATCH_BREAKPOINT = 70
const HORIZONTAL_STACK_OFFSET = 4

function generateEventsToPlot(items: EventData[], selected?: EventData): EventData[] {
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
    } else if (
      item.verificationResult === 'IN_PROGRESS' ||
      item.verificationResult === 'NOT_STARTED' ||
      item.verificationResult === 'IGNORED'
    ) {
      inProgressEvents.push(item)
    }
  }

  const result: EventData[] = []

  if (failedEvents.length + passedEvents.length + inProgressEvents.length <= MAX_STACKED_EVENTS) {
    // If for some reason, there are events that are not of failed/passed/progress types,
    // we should end the searching if the number does not exceed MAX_STACKED_EVENTS
    result.push(...failedEvents)
    result.push(...passedEvents)
    result.push(...inProgressEvents)
  } else {
    const buckets = [failedEvents, passedEvents, inProgressEvents]
    let currentBucketIndex = 0
    const selectedIndex = items.findIndex(i => i === selected)
    if (selectedIndex >= 0) {
      // We should make sure selected event is always in a batch
      result.push(items[selectedIndex])
    }
    while (result.length < MAX_STACKED_EVENTS) {
      if (buckets[currentBucketIndex].length) {
        const current = buckets[currentBucketIndex].shift()!
        if (current !== selected) {
          result.push(current)
        }
      }
      currentBucketIndex = (currentBucketIndex + 1) % buckets.length
    }
  }

  result.sort((a, b) => a.startTime - b.startTime)
  return result
}

export default function ActivitiesTimelineView({
  startTime,
  endTime,
  canSelect,
  preselectedEvent,
  deployments = [],
  infrastructureChanges = [],
  otherChanges = [],
  timelineViewProps,
  className
}: ActivitiesTimelineViewProps): JSX.Element {
  const [selectedEvent, setSelectedEvent] = useState<EventData | undefined>()
  const [zoomRange, setZoomRange] = useState<{ startTime: number; endTime: number } | undefined>()
  const [selectedActivities, setSelectedActivities] = useState<undefined | EventData[]>(undefined)
  const { getString } = useStrings()

  // const zoomIn = (items: Array<EventData>) => {
  //   let zoomStartTime = items[0].startTime
  //   let zoomEndTime = items[items.length - 1].startTime
  //   const diff = zoomEndTime - zoomStartTime || 1000 * 60 * 5
  //   zoomStartTime = Math.max(zoomStartTime - Math.floor(diff / 2), startTime)
  //   zoomEndTime = Math.min(zoomEndTime + Math.floor(diff / 2), endTime)
  //   setZoomRange({
  //     startTime: zoomStartTime,
  //     endTime: zoomEndTime
  //   })
  // }

  const zoomOut = () => setZoomRange(undefined)

  const renderItem = (item: EventData) => {
    return (
      <Container className={styles.eventItem} onClick={() => setSelectedActivities([item])}>
        <EventSvg
          selected={item === selectedEvent || item === preselectedEvent}
          item={item}
          onSelect={canSelect ? setSelectedEvent : undefined}
        />
      </Container>
    )
  }
  const renderBatch = (items: Array<EventData>) => {
    const itemsToRender = generateEventsToPlot(items, preselectedEvent)
    const aditionalStyles: any = {}
    const selectedEventIndex = itemsToRender.findIndex(i => i === selectedEvent || i === preselectedEvent)
    if (selectedEventIndex >= 0) {
      const start = items[0].startTime
      const end = items[items.length - 1].startTime
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
        <Container onClick={() => setSelectedActivities(items)} className={styles.itemsGroup}>
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
      {/* {(canSelect || preselectedEvent) && (
        <ActivitiesTimelineHeader selectedItem={selectedEvent || (zoomRange ? undefined : preselectedEvent)} />
      )} */}
      {preselectedEvent && <Text className={styles.changeText}>{getString('changes')}</Text>}
      <TimelineView
        {...selectedRange}
        labelsWidth={200}
        rows={[
          {
            name: PredefinedLabels.deployments,
            data: deployments
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
      {selectedActivities && (
        <EventDetailsForChange
          onCloseCallback={() => setSelectedActivities(undefined)}
          selectedActivities={selectedActivities}
        />
      )}
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
