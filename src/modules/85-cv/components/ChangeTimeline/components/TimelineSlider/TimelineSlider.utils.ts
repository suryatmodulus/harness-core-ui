import type { DraggableBounds, DraggableData } from 'react-draggable'
import { SLIDER_HANDLE_WIDTH } from './TimelineSlider.constants'
import type { SliderAspects, SliderEndpoints } from './TimelineSlider.types'

export function isLeftHandleWithinBounds({
  draggableEvent,
  leftOffset,
  minSliderWidth,
  width
}: {
  draggableEvent: MouseEvent
  leftOffset: number
  minSliderWidth: number
  width: number
}): boolean | undefined {
  if (draggableEvent.movementX === 0) return
  const diff = leftOffset + draggableEvent.movementX
  return diff >= -3 && width - draggableEvent.movementX >= minSliderWidth
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
  sliderAspects
}: {
  clickEventX: number
  containerOffset: number
  containerWidth: number
  sliderAspects: SliderAspects
}): SliderAspects | undefined {
  const offset = clickEventX - containerOffset
  if (
    offset < 0 ||
    offset > containerWidth ||
    (offset >= sliderAspects.leftOffset - SLIDER_HANDLE_WIDTH &&
      offset <= sliderAspects.leftOffset + sliderAspects.width + SLIDER_HANDLE_WIDTH)
  )
    return

  for (let percentageValue = 0.5; percentageValue >= 0; percentageValue -= 0.01) {
    const centerOffset = offset - sliderAspects.width * percentageValue
    if (centerOffset < 0 || centerOffset + sliderAspects.width > containerWidth) continue
    return { ...sliderAspects, leftOffset: centerOffset, onClickTransition: 'left 250ms ease-in-out' }
  }
  return {
    ...sliderAspects,
    leftOffset: containerWidth - sliderAspects.width,
    onClickTransition: 'left 250ms ease-in-out'
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
  return {
    startX: aspects.leftOffset,
    endX: aspects.width + aspects.leftOffset,
    startXPercentage: aspects.leftOffset / containerWidth,
    endXPercentage: (aspects.width + aspects.leftOffset) / containerWidth
  }
}

export function calculateRightHandleBounds(
  sliderAspects: SliderAspects,
  containerWidth: number,
  minSliderWidth: number
): DraggableBounds {
  const { leftOffset, rightHandlePosition, width } = sliderAspects
  return { right: containerWidth - leftOffset, left: Math.max(rightHandlePosition - width, minSliderWidth) }
}
