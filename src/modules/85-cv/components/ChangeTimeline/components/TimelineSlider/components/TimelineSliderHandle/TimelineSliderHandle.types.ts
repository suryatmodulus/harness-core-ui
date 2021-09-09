import type { DraggableProps } from 'react-draggable'

export interface TimelineSliderHandleProps {
  className?: string
  bounds?: DraggableProps['bounds']
  onDrag: DraggableProps['onDrag']
  onDragEnd?: DraggableProps['onStop']
  defaultPosition?: DraggableProps['defaultPosition']
  position?: DraggableProps['defaultPosition']
}
