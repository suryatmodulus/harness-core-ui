import React, { useRef, useState, useLayoutEffect } from 'react'
import cx from 'classnames'
import { isEqual } from 'lodash-es'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { Color, Container, Popover, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { HexagonCoordinates, drawGrid, mapNodeHealthStatusToColor } from './DeploymentNodes.utils'
import {
  DeploymentNodeAnalysisResult,
  HEXAGON_CONTAINER_SIZE,
  HEXAGON_SIZE,
  NODE_HEALTH_SIZE
} from './DeploymentNodes.constants'
import css from './DeploymentNodes.module.scss'

export interface DeploymentNodesProps {
  className?: string
  nodes: DeploymentNodeAnalysisResult[]
  onClick?: (node: DeploymentNodeAnalysisResult) => void
  selectedNode?: DeploymentNodeAnalysisResult
}

interface NodeHealthPopoverProps {
  analysisResult: DeploymentNodeAnalysisResult
}

function NodeHealthPopover(props: NodeHealthPopoverProps): JSX.Element {
  const { analysisResult } = props
  const { getString } = useStrings()
  return (
    <Container className={css.nodeHealthPopoverContent}>
      <Container
        className={css.nodeHealth}
        height={10}
        width={10}
        style={{ backgroundColor: mapNodeHealthStatusToColor(analysisResult?.risk) }}
      />
      <Container>
        <Text color={Color.BLACK} font={{ weight: 'bold' }}>
          {analysisResult?.hostName}
        </Text>
        <Text color={Color.BLACK_100}>{`${analysisResult?.anomalousMetricsCount} ${getString(
          'pipeline.verification.metricsInViolation'
        )}`}</Text>
        <Text color={Color.BLACK_100}>{`${analysisResult?.anomalousMetricsCount} ${getString(
          'pipeline.verification.logClustersInViolation'
        )}`}</Text>
      </Container>
    </Container>
  )
}

export function DeploymentNodes(props: DeploymentNodesProps): JSX.Element {
  const { className, nodes, onClick, selectedNode } = props
  const ref = useRef<HTMLDivElement>(null)
  const [coordinates, setCoordinates] = useState<HexagonCoordinates[]>([])

  useLayoutEffect(() => {
    if (!ref?.current) return

    const containerHeight = ref.current.getBoundingClientRect().height
    const containerWidth = ref.current.getBoundingClientRect().width
    setCoordinates(drawGrid(containerWidth, containerHeight, nodes.length || 0))
  }, [ref])

  return (
    <Container className={cx(css.main, className)} ref={ref}>
      {coordinates.map((coordinate, index) => {
        const nodeHealthColor = mapNodeHealthStatusToColor(nodes?.[index]?.risk)
        return (
          <Container
            key={index}
            className={css.hexagonContainer}
            onClick={() => {
              onClick?.(nodes?.[index])
            }}
            style={{
              height: HEXAGON_CONTAINER_SIZE,
              width: HEXAGON_CONTAINER_SIZE,
              top: coordinate.y,
              left: coordinate.x
            }}
          >
            <Popover
              content={<NodeHealthPopover analysisResult={nodes?.[index]} />}
              interactionKind={PopoverInteractionKind.HOVER}
              className={css.nodeHealthPopover}
            >
              <div data-name="popoverContainer">
                <Container
                  className={cx(css.hexagon, isEqual(selectedNode, nodes?.[index]) ? css.selected : undefined)}
                  style={{
                    height: HEXAGON_SIZE,
                    width: HEXAGON_SIZE
                  }}
                />
                <Container
                  key={index}
                  className={css.nodeHealth}
                  data-node-health-color={nodeHealthColor}
                  style={{ backgroundColor: nodeHealthColor, width: NODE_HEALTH_SIZE, height: NODE_HEALTH_SIZE }}
                />
              </div>
            </Popover>
          </Container>
        )
      })}
    </Container>
  )
}
