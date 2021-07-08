import React, { useMemo, useState } from 'react'
import { Container, Text } from '@wings-software/uicore'
import moment from 'moment'
import cx from 'classnames'
import type { DeploymentVerificationJobInstanceSummary } from 'services/cv'
import { useStrings } from 'framework/strings'
import TestsSummaryView from './components/TestSummaryView/TestsSummaryView'
import CVProgressBar from './components/CVProgressBar/CVProgressBar'
import BlueGreenVerificationChart, {
  NodeData
} from './components/BlueGreenVerificationChart/BlueGreenVerificationChart'
import css from './DeploymentProgressAndNodes.module.scss'

export interface DeploymentProgressAndNodesProps {
  deploymentSummary?: DeploymentVerificationJobInstanceSummary
  onSelectNode?: (node: NodeData) => void
  className?: string
}

export function DeploymentProgressAndNodes(props: DeploymentProgressAndNodesProps): JSX.Element {
  const { deploymentSummary, onSelectNode, className } = props
  const [selectedNode, setSelectedNode] = useState<NodeData | undefined>()
  const { getString } = useStrings()
  const deploymentNodesData = useMemo(() => {
    if (deploymentSummary?.additionalInfo?.type === 'CANARY') {
      const {
        primary: before = [],
        canary: after = [],
        trafficSplitPercentage,
        primaryInstancesLabel: labelBefore,
        canaryInstancesLabel: labelAfter
      } = deploymentSummary.additionalInfo as any
      return {
        before,
        after,
        percentageBefore: Math.round(trafficSplitPercentage?.preDeploymentPercentage),
        percentageAfter: Math.round(trafficSplitPercentage?.postDeploymentPercentage),
        labelBefore,
        labelAfter
      }
    }
  }, [deploymentSummary])
  const baselineSummaryData = useMemo(() => {
    if (deploymentSummary && deploymentSummary.additionalInfo && deploymentSummary.additionalInfo.type === 'TEST') {
      const { baselineDeploymentTag, baselineStartTime, currentDeploymentTag, currentStartTime } =
        deploymentSummary.additionalInfo as any
      return {
        baselineTestName: baselineDeploymentTag,
        baselineTestDate: baselineStartTime,
        currentTestName: currentDeploymentTag,
        currentTestDate: currentStartTime
      }
    }
  }, [deploymentSummary])

  return (
    <Container className={cx(css.main, className)}>
      <CVProgressBar value={deploymentSummary?.progressPercentage ?? 0} status={deploymentSummary?.status} />
      {deploymentSummary && (
        <>
          <Text
            font={{ size: 'small' }}
            data-name={getString('pipeline.startedOn')}
            margin={{ top: 'xsmall', bottom: 'xsmall' }}
          >
            {getString('pipeline.startedOn')}: {moment(deploymentSummary.startTime).format('MMM D, YYYY h:mm A')}
          </Text>
          <Text font={{ size: 'small' }} data-name={getString('duration')}>
            {getString('duration')}: {moment.duration(deploymentSummary.durationMs, 'ms').humanize()}
          </Text>
        </>
      )}
      {deploymentNodesData && (
        <BlueGreenVerificationChart
          {...deploymentNodesData}
          selectedNode={selectedNode}
          onSelectNode={(node: NodeData) => {
            setSelectedNode(node)
            onSelectNode?.(node)
          }}
        />
      )}
      {baselineSummaryData && <TestsSummaryView {...baselineSummaryData} />}
    </Container>
  )
}
