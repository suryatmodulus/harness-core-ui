import React, { useRef, useState, useLayoutEffect } from 'react'
import { Container } from '@wings-software/uicore'
import cx from 'classnames'
import { HexagonCoordinates, drawGrid, mapNodeHealthStatusToColor } from './DeploymentNodes.utils'
import css from './Deployment.module.scss'

export interface DeploymentNodesProps {
  className?: string
  totalNodes?: number
  nodeHealth?: Array<{ health: string; nodeName: string; anomalousMetrics: number; anomalousLogClusters: number }>
}

export function DeploymentNodes(props: DeploymentNodesProps): JSX.Element {
  const { className, totalNodes = 0, nodeHealth = [] } = props
  const ref = useRef<HTMLDivElement>(null)
  const [coordinates, setCoordinates] = useState<HexagonCoordinates[]>([])

  useLayoutEffect(() => {
    if (!ref?.current) return

    const containerHeight = ref.current.getBoundingClientRect().height
    const containerWidth = ref.current.getBoundingClientRect().width

    const canvas: HTMLCanvasElement = document.createElement('canvas')
    canvas.height = containerHeight
    canvas.width = containerWidth

    if (ref.current.children.length) {
      ref.current.removeChild(ref.current.children[0])
    }
    ref.current.appendChild(canvas)
    const twoDContext = canvas.getContext('2d')
    if (twoDContext) {
      setCoordinates(drawGrid(twoDContext, containerWidth, containerHeight, totalNodes))
    }
  }, [ref])

  return (
    <Container className={cx(css.main, className)} ref={ref}>
      {coordinates.length > 0 &&
        nodeHealth.map((info, index) => {
          return (
            <Container
              className={css.nodeHealth}
              key={index}
              height={10}
              width={10}
              style={{
                top: coordinates[index].y,
                left: coordinates[index].x,
                backgroundColor: mapNodeHealthStatusToColor(info.health)
              }}
            />
          )
        })}
    </Container>
  )
}
