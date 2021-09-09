import type React from 'react'

export type SliderEndpoints = {
  startX: number
  endX: number
  startXPercentage: number
  endXPercentage: number
}
export interface TimelineSliderProps {
  initialSliderWidth: number
  minSliderWidth: number
  containerWidth?: number | string
  onSliderDragEnd?: (sliderEndPoints: SliderEndpoints) => void
  leftContainerOffset?: number
  className?: string
}

export type SliderAspects = {
  width: number
  leftOffset: number
  rightHandlePosition: number
  leftHandlePosition: number
  onClickTransition?: React.CSSProperties['transition']
}
