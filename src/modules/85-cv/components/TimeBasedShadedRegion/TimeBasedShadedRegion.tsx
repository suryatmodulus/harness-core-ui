import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import css from './TimeBasedShadedRegion.module.scss'

export interface TimeBasedShadedRegionProps {
  top?: number
  leftOffset?: number
  parentRef?: HTMLDivElement | null
  height: number | string
  startTime: number
  endTime: number
  shadedRegionStartTime: number
  shadedRegionEndTime: number
}

function computeWidth(
  shadedRegionStartTime: number,
  shadedRegionEndTime: number,
  startTime: number,
  endTime: number,
  leftOffset?: number,
  parentRef?: HTMLDivElement | null
): { width: number; left: number } | undefined {
  if (!parentRef) {
    return
  }

  const parentContainerWidth = parentRef.getBoundingClientRect()?.width
  const totalTimeDiff = endTime - startTime
  const leftPlacement = parentContainerWidth * ((shadedRegionStartTime - startTime) / totalTimeDiff) + (leftOffset ?? 0)
  const rightPlacement = parentContainerWidth * ((shadedRegionEndTime - startTime) / totalTimeDiff) + (leftOffset ?? 0)

  return {
    width: rightPlacement - leftPlacement,
    left: leftPlacement
  }
}

export function TimeBasedShadedRegion(props: TimeBasedShadedRegionProps): JSX.Element | null {
  const { startTime, endTime, top, height, leftOffset, shadedRegionEndTime, shadedRegionStartTime, parentRef } = props
  const ref = useRef<HTMLDivElement>(null)
  const [info, setInfo] = useState(
    computeWidth(shadedRegionStartTime, shadedRegionEndTime, startTime, endTime, leftOffset, parentRef)
  )

  const onResize = () => {
    if (ref.current) {
      setInfo(computeWidth(shadedRegionStartTime, shadedRegionEndTime, startTime, endTime, leftOffset, parentRef))
    }
  }

  useLayoutEffect(() => {
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setInfo(computeWidth(shadedRegionStartTime, shadedRegionEndTime, startTime, endTime, leftOffset, parentRef))
  }, [shadedRegionStartTime, shadedRegionEndTime, startTime, leftOffset, endTime, parentRef])

  return parentRef && info ? <div className={css.main} ref={ref} style={{ ...info, top: top ?? 0, height }} /> : null
}
