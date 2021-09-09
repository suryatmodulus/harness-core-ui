import React, { useLayoutEffect, useMemo, useCallback, useRef, useState } from 'react'
import { Container } from '@wings-software/uicore'
import Draggable from 'react-draggable'
import cx from 'classnames'
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
    initialSliderWidth: initialWidth,
    className,
    containerWidth: propsContainerWidth,
    leftContainerOffset = 0,
    minSliderWidth,
    onSliderDragEnd
  } = props
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const sliderContainerRef = useRef<HTMLDivElement>(null)
  const [{ width, leftOffset, rightHandlePosition, leftHandlePosition, onClickTransition }, setSliderAspects] =
    useState<SliderAspects>({
      width: initialWidth,
      leftOffset: 0,
      rightHandlePosition: initialWidth - INITIAL_RIGHT_SLIDER_OFFSET,
      leftHandlePosition: LEFT_SLIDER_OFFSET
    })

  const onClick = useCallback(
    e => {
      if (!sliderContainerRef.current) return
      const updatedSliderAspects = determineSliderPlacementForClick({
        clickEventX: e.clientX,
        containerOffset: sliderContainerRef.current.getBoundingClientRect().x,
        containerWidth,
        sliderAspects: { width, leftOffset, rightHandlePosition, leftHandlePosition }
      })
      if (updatedSliderAspects) {
        setSliderAspects(updatedSliderAspects)
        onSliderDragEnd?.(calculateSliderDragEndData(updatedSliderAspects, e, containerWidth))
      }
    },
    [width, leftOffset, rightHandlePosition, leftHandlePosition, containerWidth]
  )

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
    sliderContainerRef.current.parentNode?.addEventListener('click', onClick, false)

    return () => sliderContainerRef.current?.parentNode?.removeEventListener('click', onClick, false)
  }, [sliderContainerRef.current, onClick])

  const containerStyles = useMemo(
    () => ({ width: propsContainerWidth, left: leftContainerOffset }),
    [propsContainerWidth, leftContainerOffset]
  )

  return (
    <div className={cx(css.main, className)} ref={sliderContainerRef} style={containerStyles}>
      <Container
        className={css.sliderContainer}
        width={width}
        style={{ left: leftOffset, transition: onClickTransition }}
        onClick={e => e.stopPropagation()}
      >
        <TimelineSliderHandle
          className={css.leftHandle}
          bounds={LEFT_SLIDER_BOUNDS}
          defaultPosition={{ x: leftHandlePosition, y: 0 }}
          onDragEnd={e =>
            onSliderDragEnd?.(
              calculateLeftHandleDragEndData(
                { width, leftHandlePosition, leftOffset, rightHandlePosition },
                e as MouseEvent,
                containerWidth
              )
            )
          }
          onDrag={e => {
            e.stopPropagation()
            const draggableEvent = e as MouseEvent
            if (isLeftHandleWithinBounds({ draggableEvent, leftOffset, minSliderWidth, width })) {
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
            minSliderWidth
          )}
          onDragEnd={(_, dragData) =>
            onSliderDragEnd?.(
              calculateRightHandleDragEndData(
                { width, leftHandlePosition, leftOffset, rightHandlePosition },
                dragData,
                containerWidth
              )
            )
          }
          onDrag={(e, dragData) => {
            e.stopPropagation()
            const draggableEvent = e as MouseEvent
            if (draggableEvent.movementX === 0) return
            setSliderAspects(currAspects => calculateSliderAspectsOnRightHandleDrag(currAspects, dragData))
          }}
        />
      </Container>
    </div>
  )
}
