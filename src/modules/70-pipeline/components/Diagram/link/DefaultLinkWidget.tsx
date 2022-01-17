/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { DiagramEngine, LinkWidget, PointModel } from '@projectstorm/react-diagrams-core'
import type { MouseEvent } from 'react'
import type { DefaultLinkModel } from './DefaultLinkModel'
import { DefaultLinkPointWidget } from './DefaultLinkPointWidget'
import { DefaultLinkSegmentWidget } from './DefaultLinkSegmentWidget'
import css from './Default.module.scss'

export interface DefaultLinkProps {
  link: DefaultLinkModel
  diagramEngine: DiagramEngine
  pointAdded?: (point: PointModel, event: MouseEvent) => any
}

export interface DefaultLinkState {
  selected: boolean
}

const addPointToLink = (event: MouseEvent, index: number, props: DefaultLinkProps): void => {
  if (
    !event.shiftKey &&
    !props.link.isLocked() &&
    props.link.getPoints().length - 1 <= props.diagramEngine.getMaxNumberPointsPerLink()
  ) {
    const point = new PointModel({
      link: props.link,
      position: props.diagramEngine.getRelativeMousePoint(event)
    })
    props.link.addPoint(point, index)
    event.persist()
    event.stopPropagation()
  }
}

const generatePoint = (point: PointModel, props: DefaultLinkProps): JSX.Element => {
  return (
    <DefaultLinkPointWidget
      key={point.getID()}
      point={point as any}
      colorSelected={props.link.getOptions().selectedColor || ''}
      color={props.link.getOptions().color}
    />
  )
}

export const DefaultLinkWidget: React.FC<DefaultLinkProps> = props => {
  const [state, setState] = React.useState<DefaultLinkState>({ selected: false })
  const refPaths: React.RefObject<SVGPathElement>[] = []

  React.useEffect(() => {
    const renderedPaths: SVGPathElement[] = []
    refPaths.forEach(ref => {
      if (ref.current !== null) {
        renderedPaths.push(ref.current)
      }
    })
    props.link.setRenderedPaths(renderedPaths)
    return () => {
      props.link.setRenderedPaths([])
    }
  }, [refPaths, props.link])

  const { diagramEngine, link } = props
  const { selected } = state

  const generateLink = React.useCallback(
    (path: string, extraProps: any, id: string | number): JSX.Element => {
      const ref = React.createRef<SVGPathElement>()
      refPaths.push(ref)
      return (
        <DefaultLinkSegmentWidget
          key={`link-${id}`}
          path={path}
          selected={selected}
          diagramEngine={diagramEngine}
          factory={diagramEngine.getFactoryForLink(link)}
          link={link}
          forwardRef={ref}
          onSelection={(select: boolean) => {
            setState(prevState => ({ ...prevState, selected: select }))
          }}
          extras={extraProps}
        />
      )
    },
    [diagramEngine, link, refPaths, selected]
  )

  //ensure id is present for all points on the path
  const points = props.link.getPoints()
  const paths = []

  if (points.length === 2) {
    if (points[1].getPosition().x === 0 && points[1].getPosition().y === 0) {
      return null
    }
    paths.push(generateLink(props.link.getSVGPath() || '', {}, '0'))

    // draw the link as dangeling
    if (props.link.getTargetPort() == null) {
      paths.push(generatePoint(points[1], props))
    }
  } else {
    //draw the multiple anchors and complex line instead
    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        generateLink(
          LinkWidget.generateLinePath(points[j], points[j + 1]),
          {
            'data-linkid': props.link.getID(),
            'data-point': j,
            onMouseDown: (event: MouseEvent) => {
              addPointToLink(event, j + 1, props)
            }
          },
          j
        )
      )
    }

    //render the circles
    for (let i = 1; i < points.length - 1; i++) {
      paths.push(generatePoint(points[i], props))
    }

    if (props.link.getTargetPort() == null) {
      paths.push(generatePoint(points[points.length - 1], props))
    }
  }

  return (
    <g className={css.link} data-default-link-test={props.link.getOptions().testName}>
      {paths}
    </g>
  )
}
