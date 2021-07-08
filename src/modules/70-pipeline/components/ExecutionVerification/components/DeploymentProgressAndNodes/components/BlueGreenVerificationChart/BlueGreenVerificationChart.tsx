import React from 'react'
import { Text, Container, Color } from '@wings-software/uicore'
import { PopoverInteractionKind, Position, Tooltip } from '@blueprintjs/core'
import classnames from 'classnames'
import { getRiskColorStyle } from '@common/components/HeatMap/ColorUtils'
import { useStrings } from 'framework/strings'
import styles from './BlueGreenVerificationChart.module.scss'

const MAX_SERIE_LENGTH = 16

export interface NodeData {
  hostName?: string
  risk?: string
  anomalousLogClustersCount?: number
  anomalousMetricsCount?: number
}

export interface BlueGreenVerificationChartProps {
  before: Array<NodeData>
  after: Array<NodeData>
  percentageBefore?: number
  percentageAfter?: number
  labelBefore?: string
  labelAfter?: string
  selectedNode?: NodeData
  onSelectNode?(node?: NodeData): void
}

export default function BlueGreenVerificationChart({
  before,
  after,
  percentageBefore,
  percentageAfter,
  labelBefore,
  labelAfter,
  selectedNode,
  onSelectNode
}: BlueGreenVerificationChartProps) {
  const { getString } = useStrings()
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
              className={classnames({ [styles.nodeSelected]: cell === selectedNode }, getRiskColorStyle(cell.risk))}
              onClick={canSelectNodes ? () => onSelectNode?.(cell === selectedNode ? undefined : cell) : undefined}
            />
          </Tooltip>
        )
    )

  return (
    <Container className={styles.chart}>
      <div className={styles.boxWrap}>
        <Text className={styles.boxTitle}>{labelBefore || getString('primary')}</Text>
        <div className={styles.box}>{renderSeries(before, false)}</div>
        {!!percentageBefore && <Text font={{ size: 'small' }}>{`${percentageBefore}% Traffic`}</Text>}
      </div>
      <div className={styles.separator}>{/* <Text>Verification Triggered</Text> */}</div>
      <div className={styles.boxWrap}>
        <Text className={styles.boxTitle}>{labelAfter || getString('canary')}</Text>
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
