import React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import type { DefaultLinkFactory } from './DefaultLinkFactory'
import type { DefaultLinkModel } from './DefaultLinkModel'
import { Event, DiagramDrag } from '../Constants'

export interface DefaultLinkSegmentWidgetProps {
  path: string
  link: DefaultLinkModel
  selected: boolean
  forwardRef: React.RefObject<SVGPathElement>
  factory: DefaultLinkFactory
  diagramEngine: DiagramEngine
  onSelection: (selected: boolean) => void
  extras: Record<string, any>
}

export const DefaultLinkSegmentWidget = (props: DefaultLinkSegmentWidgetProps): JSX.Element => {
  const { onSelection, link } = props
  const allowAdd = link.getOptions().allowAdd ?? true
  const prevColorRef = React.useRef('')
  const color = link.getOptions().color
  React.useEffect(() => {
    prevColorRef.current = color || ''
  })
  const Bottom = React.cloneElement(
    props.factory.generateLinkSegment(
      props.link,
      props.selected || props.link.isSelected(),
      props.path,
      allowAdd,
      prevColorRef.current
    ),
    {
      ref: props.forwardRef
    }
  )

  const BeforePath = React.cloneElement(Bottom, {
    stroke: prevColorRef.current,
    className: ''
  })

  const onMouseLeave = React.useCallback(() => {
    onSelection(false)
  }, [onSelection])

  const onMouseEnter = React.useCallback(() => {
    onSelection(true)
  }, [onSelection])

  const onContextMenu = React.useCallback(() => {
    if (!link.isLocked()) {
      event?.preventDefault()
      link.remove()
    }
  }, [link])

  const onClick = React.useCallback(() => {
    allowAdd && link.fireEvent({}, Event.AddLinkClicked)
  }, [link, allowAdd])

  const pathRef = React.useRef<SVGPathElement>()

  const [point, setPoint] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    if (pathRef.current) {
      const totalLength = pathRef.current?.getTotalLength() * 0.5
      const position = pathRef.current.getPointAtLength(totalLength)
      setPoint({ x: position.x, y: position.y })
    }
  }, [pathRef])

  const Top = React.cloneElement(Bottom, {
    strokeLinecap: 'round',
    onMouseLeave,
    onMouseEnter,
    ...props.extras,
    ref: pathRef,
    'data-linkid': props.link.getID(),
    strokeOpacity: props.selected ? 0.1 : 0,
    strokeWidth: 20,
    fill: 'none',
    onContextMenu,
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
      if (allowAdd) {
        onSelection(true)
        event.preventDefault()
      }
    },
    onDragLeave: () => {
      if (allowAdd) {
        onSelection(false)
      }
    },
    onDrop: (event: React.DragEvent<HTMLDivElement>) => {
      if (allowAdd) {
        const dropData: { id: string; identifier: string } = JSON.parse(
          event.dataTransfer.getData(DiagramDrag.NodeDrag)
        )
        link.fireEvent({ node: dropData }, Event.DropLinkEvent)
      }
    }
  })

  return (
    <g>
      {link.getOptions().color !== prevColorRef.current && BeforePath}
      {Bottom}
      {Top}
      {allowAdd && (
        <>
          <circle
            fill={props.link.getOptions().selectedColor}
            r={10}
            cx={point.x}
            pointerEvents="all"
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            cy={point.y}
            opacity={props.selected ? 1 : 0}
            onClick={onClick}
          />
          <line
            stroke="var(--white)"
            x1={point.x - 5}
            y1={point.y}
            x2={point.x + 5}
            y2={point.y}
            strokeWidth="1"
            opacity={props.selected ? 1 : 0}
          ></line>
          <line
            stroke="var(--white)"
            x1={point.x}
            y1={point.y - 5}
            x2={point.x}
            y2={point.y + 5}
            strokeWidth="1"
            opacity={props.selected ? 1 : 0}
          ></line>
        </>
      )}
    </g>
  )
}
