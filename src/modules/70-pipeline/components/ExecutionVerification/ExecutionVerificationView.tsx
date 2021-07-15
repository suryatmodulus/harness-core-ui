import React, { useState } from 'react'
import { Container, Tabs, Tab } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import { DeploymentMetrics } from './components/DeploymentMetrics/DeploymentMetrics'
import { ExecutionVerificationSummary } from './components/ExecutionVerificationSummary/ExecutionVerificationSummary'
import type { DeploymentNodeAnalysisResult } from './components/DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import css from './ExecutionVerificationView.module.scss'

interface ExecutionVerificationViewProps {
  step: ExecutionNode
}

export function ExecutionVerificationView(props: ExecutionVerificationViewProps): JSX.Element {
  const { step } = props
  const { getString } = useStrings()
  const [selectedNode, setSelectedNode] = useState<DeploymentNodeAnalysisResult | undefined>()
  return (
    <Container className={css.main}>
      <ExecutionVerificationSummary
        displayAnalysisCount={false}
        step={step}
        className={css.executionSummary}
        onSelectNode={setSelectedNode}
      />
      <Tabs id="AnalysisTypeTabs">
        <Tab
          id={getString('pipeline.verification.analysisTab.metrics')}
          title={getString('pipeline.verification.analysisTab.metrics')}
          panel={<DeploymentMetrics step={step} selectedNode={selectedNode} />}
        />
        <Tab
          id={getString('pipeline.verification.analysisTab.logs')}
          title={getString('pipeline.verification.analysisTab.logs')}
          panel={<Container />}
        />
      </Tabs>
    </Container>
  )
}
