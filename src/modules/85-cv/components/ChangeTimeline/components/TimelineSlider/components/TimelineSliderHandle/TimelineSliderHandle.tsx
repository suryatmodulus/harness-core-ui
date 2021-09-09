import React from 'react'
import { Icon } from '@wings-software/uicore'
import Draggable from 'react-draggable'
import type { TimelineSliderHandleProps } from './TimelineSliderHandle.types'
import css from './TimelineSliderHandle.module.scss'

export default function TimelineSliderHandle(props: TimelineSliderHandleProps): JSX.Element {
  const { className, onDrag, onDragEnd, bounds, defaultPosition, position } = props
  return (
    <Draggable
      onDrag={onDrag}
      onStop={onDragEnd}
      position={position}
      defaultPosition={defaultPosition}
      bounds={bounds}
      axis="x"
    >
      <div className={className}>
        <Icon name="drag-handle-horizontal" className={css.main} />
      </div>
    </Draggable>
  )
}
