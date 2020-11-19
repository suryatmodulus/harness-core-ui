import React, { useEffect } from 'react'
import classnames from 'classnames'
import type { EventData } from './ActivitiesTimelineView'

export default function EventSvg({
  selected,
  item,
  onSelect,
  ...rest
}: {
  item: EventData
  selected?: boolean
  onSelect?(item: EventData | undefined): void
  [x: string]: any
}) {
  const { verificationResult } = item
  const pathProps: any = {
    strokeWidth: 1.5
  }
  if (selected) {
    pathProps.fill = 'var(--blue-500)'
    pathProps.stroke = 'var(--blue-500)'
  } else if (verificationResult === 'IN_PROGRESS' || verificationResult === 'NOT_STARTED') {
    pathProps.fill = '#ffffff'
    pathProps.stroke = 'var(--blue-500)'
  } else if (verificationResult === 'VERIFICATION_PASSED') {
    pathProps.fill = '#ffffff'
    pathProps.stroke = '#86DD29'
  } else if (verificationResult === 'VERIFICATION_FAILED' || verificationResult === 'ERROR') {
    pathProps.fill = '#ffffff'
    pathProps.stroke = '#F45858'
  }
  useEffect(() => {
    return () => onSelect?.(undefined)
  }, [])

  return (
    <svg
      {...rest}
      className={classnames({ 'timeline-flag-target': selected })}
      onClick={() => onSelect?.(selected ? undefined : item)}
      width="18"
      height="16"
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        {...pathProps}
        d="M12.9226 1.20577L16.8453 8L12.9226 14.7942H5.07735L1.1547 8L5.07735 1.20577L12.9226 1.20577Z"
      />
    </svg>
  )
}
