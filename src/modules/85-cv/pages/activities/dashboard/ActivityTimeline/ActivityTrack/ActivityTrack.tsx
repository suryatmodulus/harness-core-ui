import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, Color, Layout, Text, Icon, Container } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { Overlay } from '@blueprintjs/core'
import cx from 'classnames'
import {
  Activity,
  ActivityBucket,
  ACTIVITY_CARD_HEIGHT,
  placeActivitiesOnTrack,
  ACTIVITY_SELECTION_EVENT
} from './ActivityTrackUtils'
import css from './ActivityTrack.module.scss'

export interface ActivityTrackProps {
  trackName: string
  trackIcon: IconProps
  cardContent: (activity: Activity) => JSX.Element
  aggregateCoverCard?: (activities: Activity[]) => JSX.Element
  onActivityClick: (activity: Activity | null) => void
  activities: Activity[]
  startTime: number
  endTime: number
  timelineContainerRef?: HTMLDivElement | null
}

interface ActivityCardProps {
  cardContent: ActivityTrackProps['cardContent']
  aggregateCoverCard: ActivityTrackProps['aggregateCoverCard']
  activityBucket: ActivityBucket
  onActivityClick: ActivityTrackProps['onActivityClick']
  selectedActivityId?: string
  timelineContainerRef?: HTMLDivElement | null
}

const TRACK_WIDTH = 140

function ActivityCard(props: ActivityCardProps): JSX.Element {
  const { cardContent, activityBucket, onActivityClick, selectedActivityId, aggregateCoverCard } = props
  const [isExpandedView, setExpandView] = useState(false)
  const { activities } = activityBucket
  const activitiesToRender = isExpandedView ? activities : [activities[0]]
  const toggleExpandCallback = (expandView: boolean) => () => {
    setExpandView(expandView)
    if (!expandView && selectedActivityId) {
      onActivityClick(null)
    }
  }

  return (
    <Container className={cx(isExpandedView ? css.expandedActivityCard : undefined)}>
      <Overlay
        isOpen={isExpandedView}
        className={css.overlayOnExpand}
        lazy={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        onClose={toggleExpandCallback(false)}
      >
        <Container />
      </Overlay>
      {activities.length > 1 && aggregateCoverCard && !isExpandedView ? (
        <Card
          interactive={true}
          elevation={1}
          className={css.activityCardContent}
          style={{ height: ACTIVITY_CARD_HEIGHT }}
          onClick={toggleExpandCallback(!isExpandedView)}
        >
          {aggregateCoverCard(activities)}
        </Card>
      ) : (
        <Container>
          {isExpandedView && (
            <Card
              interactive={false}
              elevation={1}
              style={{ height: ACTIVITY_CARD_HEIGHT }}
              className={css.activityCardContent}
            >
              {selectedActivityId
                ? cardContent?.(activities.find(activity => activity?.uuid === selectedActivityId) || ({} as Activity))
                : undefined}
            </Card>
          )}
          {activitiesToRender.map(activity => (
            <Card
              key={activity.uuid}
              interactive={true}
              elevation={1}
              className={cx(
                css.activityCardContent,
                selectedActivityId === activity.uuid ? css.selectedCard : undefined
              )}
              style={{ height: ACTIVITY_CARD_HEIGHT }}
              onClick={() => {
                if (selectedActivityId !== activity.uuid) {
                  onActivityClick({ ...activity, offset: 0 })
                } else {
                  onActivityClick(null)
                }
              }}
            >
              {cardContent?.(activity)}
            </Card>
          ))}
        </Container>
      )}
      {activities.length > 1 && (
        <Text
          background={Color.BLUE_600}
          color={Color.WHITE}
          font={{ size: 'xsmall' }}
          className={css.stackedCardCount}
          onClick={toggleExpandCallback(!isExpandedView)}
        >
          {isExpandedView ? 'Collapse' : `+ ${activities.length}`}
        </Text>
      )}
    </Container>
  )
}

function ActivityCardWrapper(props: ActivityCardProps): JSX.Element {
  const { cardContent, activityBucket, onActivityClick, timelineContainerRef, aggregateCoverCard } = props
  const [isVisible, setVisible] = useState(false)
  const [selectedActivityId, setSelected] = useState<string | undefined>()
  const cardRef = useRef<HTMLDivElement>(null)
  const eventEmitHandler = useCallback(
    event => {
      if (!event?.detail?.isOwnBucket) setSelected(undefined)
      document.removeEventListener(ACTIVITY_SELECTION_EVENT, eventEmitHandler, false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedActivityId]
  )

  useEffect(() => {
    if (selectedActivityId) document.addEventListener(ACTIVITY_SELECTION_EVENT, eventEmitHandler, false)
    return () => {
      if (selectedActivityId) document.removeEventListener(ACTIVITY_SELECTION_EVENT, eventEmitHandler, false)
    }
  }, [eventEmitHandler, selectedActivityId])

  useEffect(() => {
    if (!cardRef || !cardRef?.current || !timelineContainerRef) return
    const cardRefElement = cardRef.current
    const intersectionObserver = new IntersectionObserver(arr => setVisible(arr[0].isIntersecting), {
      rootMargin: `500px 0px 500px 0px`,
      root: timelineContainerRef,
      threshold: 0.5
    })
    intersectionObserver.observe(cardRefElement)
    return () => {
      intersectionObserver.unobserve(cardRefElement)
      intersectionObserver.disconnect()
    }
  }, [cardRef, timelineContainerRef])

  return (
    <div ref={cardRef} className={css.activityCard} style={{ height: ACTIVITY_CARD_HEIGHT, top: activityBucket.top }}>
      {isVisible ? (
        <ActivityCard
          key={`${activityBucket.startTime}-${activityBucket.endTime}-${activityBucket.top}`}
          activityBucket={activityBucket}
          cardContent={cardContent}
          selectedActivityId={selectedActivityId}
          aggregateCoverCard={aggregateCoverCard}
          onActivityClick={selectedActivity => {
            document.dispatchEvent(
              new CustomEvent(ACTIVITY_SELECTION_EVENT, {
                bubbles: true,
                detail: selectedActivityId ? { isOwnBucket: true } : undefined
              })
            )
            setSelected(selectedActivity?.uuid)
            onActivityClick(
              selectedActivity
                ? { ...selectedActivity, ref: cardRef?.current || undefined, top: activityBucket.top }
                : null
            )
          }}
        />
      ) : null}
    </div>
  )
}

export function ActivityTrack(props: ActivityTrackProps): JSX.Element {
  const {
    trackIcon: iconProps,
    trackName,
    activities,
    cardContent,
    startTime,
    endTime,
    onActivityClick,
    timelineContainerRef,
    aggregateCoverCard
  } = props
  const { activityBuckets, timelineHeight } = useMemo(
    () => placeActivitiesOnTrack(startTime, endTime, activities),
    [startTime, endTime, activities]
  )

  return (
    <Container
      style={{
        height: timelineHeight + ACTIVITY_CARD_HEIGHT * 2,
        width: TRACK_WIDTH,
        padding: 'var(--spacing-xsmall)'
      }}
      id={trackName}
      className={css.main}
    >
      <Layout.Vertical
        background={Color.GREY_100}
        className={css.trackTitle}
        style={{ alignItems: 'center' }}
        padding="small"
      >
        <Icon {...iconProps} />
        <Text>{trackName}</Text>
      </Layout.Vertical>
      {activityBuckets.map((intervalBucket, index) => (
        <ActivityCardWrapper
          key={index}
          aggregateCoverCard={aggregateCoverCard}
          timelineContainerRef={timelineContainerRef}
          activityBucket={intervalBucket}
          cardContent={cardContent}
          onActivityClick={onActivityClick}
        />
      ))}
    </Container>
  )
}
