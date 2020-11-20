import React from 'react'
import { Text, Container, Color } from '@wings-software/uikit'
import { PopoverInteractionKind, Position, Tooltip } from '@blueprintjs/core'
import classnames from 'classnames'
import styles from './BlueGreenVerificationChart.module.scss'

const MAX_SERIE_LENGTH = 16

export interface NodeData {
  hostName?: string
  riskScore?: string
  anomalousLogClustersCount?: number
  anomalousMetricsCount?: number
}

export interface BlueGreenVerificationChartProps {
  before: Array<NodeData>
  after: Array<NodeData>
  percentageBefore?: number
  percentageAfter?: number
  selectedNode?: NodeData
  onSelectNode?(node?: NodeData): void
}

const mapColor = (riskScore?: string): Color => {
  switch (riskScore) {
    case 'LOW_RISK':
      return Color.GREEN_400
    case 'MEDIUM_RISK':
      return Color.ORANGE_500
    case 'HIGH_RISK':
      return Color.RED_500
    default:
      return Color.GREY_300
  }
}

export default function BlueGreenVerificationChart({
  before,
  after,
  percentageBefore,
  percentageAfter,
  selectedNode,
  onSelectNode
}: BlueGreenVerificationChartProps) {
  const renderSeries = (data: Array<NodeData>, canSelectNodes: boolean) =>
    data.map(
      (cell, i) =>
        i < MAX_SERIE_LENGTH && (
          <Tooltip
            key={i}
            lazy={true}
            position={Position.TOP}
            interactionKind={PopoverInteractionKind.HOVER}
            content={
              <Container>
                <Text color={Color.GREY_300} font={{ size: 'small', weight: 'bold' }}>
                  {cell.hostName}
                </Text>
                <Container margin={{ top: 'small' }}>
                  <Text color={Color.GREY_300} font={{ size: 'small' }}>
                    {cell.anomalousMetricsCount} anomalous metrics
                  </Text>
                  <Text color={Color.GREY_300} font={{ size: 'small' }}>
                    {cell.anomalousLogClustersCount} anomalous log clusters
                  </Text>
                </Container>
              </Container>
            }
          >
            <Container
              className={classnames({ [styles.nodeSelected]: cell === selectedNode })}
              background={cell === selectedNode ? Color.BLUE_500 : mapColor(cell.riskScore)}
              onClick={canSelectNodes ? () => onSelectNode?.(cell === selectedNode ? undefined : cell) : undefined}
            />
          </Tooltip>
        )
    )

  return (
    <Container className={styles.chart}>
      <div className={styles.boxWrap}>
        <Text>PRIMARY</Text>
        <div className={styles.box}>{renderSeries(before, false)}</div>
        {!!percentageBefore && <Text font={{ size: 'small' }}>{`${percentageBefore}% Traffic`}</Text>}
      </div>
      <div className={styles.separator}>{/* <Text>Verification Triggered</Text> */}</div>
      <div className={styles.boxWrap}>
        <Text>CANARY</Text>
        <div className={styles.boxGroup}>
          <div className={styles.boxWrap}>
            <div className={styles.box}>{renderSeries(after, true)}</div>
            {!!percentageAfter && <Text font={{ size: 'small' }}>{`${percentageAfter}% Traffic`}</Text>}
          </div>
        </div>
      </div>
    </Container>
  )
}
