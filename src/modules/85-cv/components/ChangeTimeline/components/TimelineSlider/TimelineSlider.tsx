import React, { useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react'
import { Container, Text } from '@wings-software/uicore'
import Draggable from 'react-draggable'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { LEFT_TEXTFIELD_WIDTH } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import type { SliderAspects, TimelineSliderProps } from './TimelineSlider.types'
import TimelineSliderHandle from './components/TimelineSliderHandle/TimelineSliderHandle'
import {
  calculateLeftHandleDragEndData,
  calculateRightHandleBounds,
  calculateRightHandleDragEndData,
  calculateSliderAspectsOnDrag,
  calculateSliderAspectsOnLeftHandleDrag,
  calculateSliderAspectsOnRightHandleDrag,
  calculateSliderDragEndData,
  determineSliderPlacementForClick,
  isLeftHandleWithinBounds,
  isSliderWithinBounds
} from './TimelineSlider.utils'
import {
  INITIAL_RIGHT_SLIDER_OFFSET,
  LEFT_SLIDER_BOUNDS,
  LEFT_SLIDER_OFFSET,
  MAGNIFYING_GLASS_BOUNDS
} from './TimelineSlider.constants'
import css from './TimelineSlider.module.scss'

export default function TimelineSlider(props: TimelineSliderProps): JSX.Element {
  const {
    initialSliderWidth,
    className,
    containerWidth: propsContainerWidth,
    leftContainerOffset = 0,
    minSliderWidth,
    onSliderDragEnd,
    infoCard,
    resetFocus,
    maxSliderWidth,
    hideSlider
  } = props
  const { getString } = useStrings()
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const sliderContainerRef = useRef<HTMLDivElement>(null)
  const [parentClickEvent, setParentClickEvent] = useState<MouseEvent>()
  const [isDragging, setIsDragging] = useState(false)
  const [{ width, leftOffset, rightHandlePosition, leftHandlePosition, onClickTransition }, setSliderAspects] =
    useState<SliderAspects>({
      width: initialSliderWidth,
      leftOffset: 0,
      rightHandlePosition: initialSliderWidth - INITIAL_RIGHT_SLIDER_OFFSET,
      leftHandlePosition: LEFT_SLIDER_OFFSET
    })

  useEffect(() => {
    if (!sliderContainerRef.current || !parentClickEvent) return
    if (isDragging) {
      setIsDragging(false)
      return
    }

    const updatedSliderAspects = determineSliderPlacementForClick({
      clickEventX: parentClickEvent.clientX,
      containerOffset: sliderContainerRef.current.getBoundingClientRect().x,
      containerWidth,
      sliderAspects: { width, leftOffset, rightHandlePosition, leftHandlePosition },
      isSliderHidden: hideSlider
    })

    if (updatedSliderAspects) {
      setSliderAspects(updatedSliderAspects)
      onSliderDragEnd?.(calculateSliderDragEndData(updatedSliderAspects, parentClickEvent, containerWidth))
    }
  }, [parentClickEvent, onSliderDragEnd])

  useLayoutEffect(() => {
    if (!sliderContainerRef.current) return
    if (!propsContainerWidth) {
      setContainerWidth(
        (sliderContainerRef.current.parentElement?.getBoundingClientRect().width || 0) - leftContainerOffset
      )
    } else if (typeof propsContainerWidth === 'string') {
      setContainerWidth(sliderContainerRef.current.getBoundingClientRect().width)
    }
  }, [propsContainerWidth, sliderContainerRef.current])

  useLayoutEffect(() => {
    if (!sliderContainerRef.current) return
    sliderContainerRef.current.parentNode?.addEventListener('click', setParentClickEvent as EventListener, false)

    return () =>
      sliderContainerRef.current?.parentNode?.removeEventListener('click', setParentClickEvent as EventListener, false)
  }, [sliderContainerRef.current])

  useEffect(() => {
    if (hideSlider) {
      setSliderAspects({
        width: initialSliderWidth,
        leftOffset: 0,
        rightHandlePosition: initialSliderWidth - INITIAL_RIGHT_SLIDER_OFFSET,
        leftHandlePosition: LEFT_SLIDER_OFFSET
      })
    }
  }, [hideSlider])

  const containerStyles = useMemo(() => {
    return { width: propsContainerWidth, left: leftContainerOffset }
  }, [propsContainerWidth, leftContainerOffset])

  if (hideSlider) {
    return <div className={cx(css.main, className)} ref={sliderContainerRef} style={containerStyles} />
  }

  return (
    <div className={cx(css.main, className)} ref={sliderContainerRef} style={containerStyles}>
      <Container className={css.mask} width={leftOffset} />
      <Container
        className={css.sliderContainer}
        width={width}
        style={{ left: leftOffset, transition: onClickTransition }}
        onClick={() => false}
      >
        {infoCard ? (
          <Container flex>
            <Container className={cx(css.card, { [css.reverseCard]: leftOffset < LEFT_TEXTFIELD_WIDTH })}>
              {infoCard}
              <Text
                className={css.resetButton}
                onClick={e => {
                  e.stopPropagation()
                  resetFocus?.()
                }}
              >
                {getString('reset')}
              </Text>
            </Container>
          </Container>
        ) : null}
        <TimelineSliderHandle
          className={css.leftHandle}
          bounds={LEFT_SLIDER_BOUNDS}
          defaultPosition={{ x: leftHandlePosition, y: 0 }}
          onDragEnd={e => {
            onSliderDragEnd?.(
              calculateLeftHandleDragEndData(
                { width, leftHandlePosition, leftOffset, rightHandlePosition },
                e as MouseEvent,
                containerWidth
              )
            )
          }}
          onDrag={e => {
            e.stopPropagation()
            setIsDragging(true)
            const draggableEvent = e as MouseEvent
            if (isLeftHandleWithinBounds({ draggableEvent, leftOffset, minSliderWidth, width, maxSliderWidth })) {
              setSliderAspects(currAspects => calculateSliderAspectsOnLeftHandleDrag(currAspects, draggableEvent))
            }
          }}
        />
        <Draggable
          axis="x"
          bounds={MAGNIFYING_GLASS_BOUNDS}
          onStop={e => {
            onSliderDragEnd?.(
              calculateSliderDragEndData(
                { width, leftHandlePosition, leftOffset, rightHandlePosition },
                e as MouseEvent,
                containerWidth
              )
            )
          }}
          onDrag={e => {
            e.stopPropagation()
            const draggableEvent = e as MouseEvent
            if (isSliderWithinBounds({ draggableEvent, leftOffset, width, containerWidth })) {
              setSliderAspects(currAspects => calculateSliderAspectsOnDrag(currAspects, draggableEvent))
            }
          }}
        >
          <div className={css.magnifyingGlass} />
        </Draggable>
        <TimelineSliderHandle
          className={css.rightHandle}
          position={{ x: rightHandlePosition, y: 0 }}
          bounds={calculateRightHandleBounds(
            { width, leftHandlePosition, leftOffset, rightHandlePosition },
            containerWidth,
            minSliderWidth,
            maxSliderWidth
          )}
          onDragEnd={(_, dragData) => {
            onSliderDragEnd?.(
              calculateRightHandleDragEndData(
                { width, leftHandlePosition, leftOffset, rightHandlePosition },
                dragData,
                containerWidth
              )
            )
          }}
          onDrag={(e, dragData) => {
            e.stopPropagation()
            setIsDragging(true)
            const draggableEvent = e as MouseEvent
            if (draggableEvent.movementX === 0) return
            setSliderAspects(currAspects => calculateSliderAspectsOnRightHandleDrag(currAspects, dragData))
          }}
        />
      </Container>
      <Container
        className={css.mask}
        width={containerWidth - leftOffset - width}
        style={{ left: leftOffset + width }}
      />
    </div>
  )
}
