import React, { useState, useCallback } from 'react'
import { isEqual } from 'lodash-es'
import { Container, Text } from '@wings-software/uicore'
import { DeploymentNodes } from '@pipeline/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes'
import type { DeploymentNodeAnalysisResult } from '../../../DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import css from './PrimaryAndCanaryNodes.module.scss'

interface PrimaryAndCanaryNodesProps {
  primaryNodes: DeploymentNodeAnalysisResult[]
  canaryNodes: DeploymentNodeAnalysisResult[]
  primaryNodeLabel: string
  canaryNodeLabel: string
  onSelectNode?: (selectedNode?: DeploymentNodeAnalysisResult) => void
}

export function PrimaryAndCanaryNodes(props: PrimaryAndCanaryNodesProps): JSX.Element {
  const { canaryNodes, primaryNodes, onSelectNode, primaryNodeLabel, canaryNodeLabel } = props
  const [selectedNode, setSelectedNode] = useState<DeploymentNodeAnalysisResult | undefined>()
  const onNodeSelect = useCallback(
    (newlySelectedNode?: DeploymentNodeAnalysisResult) => {
      setSelectedNode(newlySelectedNode)
      onSelectNode?.(newlySelectedNode)
    },
    [setSelectedNode]
  )
  const onSelectCallback = onSelectNode ? onNodeSelect : undefined

  return (
    <Container className={css.main}>
      <Container className={css.primaryNodes}>
        <Text>{primaryNodeLabel?.toLocaleUpperCase()}</Text>
        <DeploymentNodes nodes={primaryNodes} selectedNode={selectedNode} />
      </Container>
      <Container className={css.canaryNodes}>
        <Text>{canaryNodeLabel?.toLocaleUpperCase()}</Text>
        <DeploymentNodes
          nodes={canaryNodes}
          selectedNode={selectedNode}
          onClick={node => {
            onSelectCallback?.(isEqual(node, selectedNode) ? undefined : node)
          }}
        />
      </Container>
    </Container>
  )
}
