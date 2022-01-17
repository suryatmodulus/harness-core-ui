/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DraggableBounds, DraggableData } from 'react-draggable'
import { SLIDER_HANDLE_WIDTH } from './TimelineSlider.constants'
import type { SliderAspects, SliderEndpoints } from './TimelineSlider.types'

export function isLeftHandleWithinBounds({
  draggableEvent,
  leftOffset,
  minSliderWidth,
  maxSliderWidth,
  width
}: {
  draggableEvent: MouseEvent
  leftOffset: number
  minSliderWidth: number
  maxSliderWidth?: number
  width: number
}): boolean | undefined {
  if (draggableEvent.movementX === 0) return
  const diff = leftOffset + draggableEvent.movementX
  const updatedWidth = width - draggableEvent.movementX
  if (maxSliderWidth && updatedWidth > maxSliderWidth) return false
  return diff >= -3 && updatedWidth >= minSliderWidth
}

export function isSliderWithinBounds({
  draggableEvent,
  leftOffset,
  containerWidth,
  width
}: {
  draggableEvent: MouseEvent
  leftOffset: number
  containerWidth: number
  width: number
}): boolean | undefined {
  if (draggableEvent.movementX === 0) return
  return leftOffset + draggableEvent.movementX + width <= containerWidth && leftOffset + draggableEvent.movementX >= -3
}

export function determineSliderPlacementForClick({
  clickEventX,
  containerOffset,
  containerWidth,
  sliderAspects,
  isSliderHidden
}: {
  clickEventX: number
  containerOffset: number
  containerWidth: number
  isSliderHidden?: boolean
  sliderAspects: SliderAspects
}): SliderAspects | undefined {
  const offset = clickEventX - containerOffset

  // ensure click is within contanier bounds
  if (offset < 0 || offset > containerWidth) {
    return
  }

  // when slider is visible ensure the click is outside of slider dimensions
  if (
    !isSliderHidden &&
    offset >= sliderAspects.leftOffset - SLIDER_HANDLE_WIDTH &&
    offset <= sliderAspects.leftOffset + sliderAspects.width + SLIDER_HANDLE_WIDTH
  ) {
    return
  }

  for (let percentageValue = 0.5; percentageValue >= 0; percentageValue -= 0.01) {
    const centerOffset = offset - sliderAspects.width * percentageValue
    if (centerOffset < 0 || centerOffset + sliderAspects.width > containerWidth) continue
    return { ...sliderAspects, leftOffset: centerOffset, onClickTransition: 'left 250ms ease-in-out' }
  }
  return {
    ...sliderAspects,
    leftOffset: containerWidth - sliderAspects.width,
    onClickTransition: 'left 200ms ease-out'
  }
}

export function calculateSliderAspectsOnRightHandleDrag(
  currAspects: SliderAspects,
  dragData: DraggableData
): SliderAspects {
  return {
    ...currAspects,
    onClickTransition: undefined,
    rightHandlePosition: currAspects.rightHandlePosition + dragData.deltaX,
    width: currAspects.width + dragData.deltaX
  }
}

export function calculateSliderAspectsOnLeftHandleDrag(
  currAspects: SliderAspects,
  draggableEvent: MouseEvent
): SliderAspects {
  return {
    ...currAspects,
    onClickTransition: undefined,
    width: currAspects.width - draggableEvent.movementX,
    rightHandlePosition: currAspects.rightHandlePosition - draggableEvent.movementX,
    leftOffset: currAspects.leftOffset + draggableEvent.movementX
  }
}

export function calculateSliderAspectsOnDrag(currAspects: SliderAspects, draggableEvent: MouseEvent): SliderAspects {
  return {
    ...currAspects,
    onClickTransition: undefined,
    leftOffset: currAspects.leftOffset + draggableEvent.movementX
  }
}

export function calculateRightHandleDragEndData(
  currAspects: SliderAspects,
  dragData: DraggableData,
  containerWidth: number
): SliderEndpoints {
  return calculateSliderEndPoints(calculateSliderAspectsOnRightHandleDrag(currAspects, dragData), containerWidth)
}

export function calculateLeftHandleDragEndData(
  currAspects: SliderAspects,
  draggableEvent: MouseEvent,
  containerWidth: number
): SliderEndpoints {
  return calculateSliderEndPoints(calculateSliderAspectsOnLeftHandleDrag(currAspects, draggableEvent), containerWidth)
}

export function calculateSliderDragEndData(
  currAspects: SliderAspects,
  draggableEvent: MouseEvent,
  containerWidth: number
): SliderEndpoints {
  return calculateSliderEndPoints(calculateSliderAspectsOnDrag(currAspects, draggableEvent), containerWidth)
}

export function calculateSliderEndPoints(aspects: SliderAspects, containerWidth: number): SliderEndpoints {
  const startX = Math.max(0, aspects.leftOffset)
  const endX = Math.min(containerWidth, aspects.width + aspects.leftOffset)
  return {
    startX,
    endX,
    startXPercentage: startX / containerWidth,
    endXPercentage: endX / containerWidth
  }
}

export function calculateRightHandleBounds(
  sliderAspects: SliderAspects,
  containerWidth: number,
  minSliderWidth: number,
  maxSliderWidth?: number
): DraggableBounds {
  const { leftOffset, rightHandlePosition, width } = sliderAspects
  return {
    right: Math.min(maxSliderWidth || containerWidth - leftOffset, containerWidth - leftOffset),
    left: Math.max(rightHandlePosition - width, minSliderWidth)
  }
}
