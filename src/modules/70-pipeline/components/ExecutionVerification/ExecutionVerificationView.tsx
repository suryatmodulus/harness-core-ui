import React, { useState } from 'react'
import { Container, Tabs, Tab } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ExecutionNode } from 'services/pipeline-ng'
import { DeploymentMetrics } from './components/DeploymentMetrics/DeploymentMetrics'
import { ExecutionVerificationSummary } from './components/ExecutionVerificationSummary/ExecutionVerificationSummary'
import type { DeploymentNodeAnalysisResult } from './components/DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import LogAnalysisContainer from './components/LogAnalysisContainer/LogAnalysisView.container'
import css from './ExecutionVerificationView.module.scss'

interface ExecutionVerificationViewProps {
  step: ExecutionNode
}

export function ExecutionVerificationView(props: ExecutionVerificationViewProps): JSX.Element {
  const { step } = props
  const { getString } = useStrings()
  const [selectedNode, setSelectedNode] = useState<DeploymentNodeAnalysisResult | undefined>()
  const content = step?.progressData?.activityId ? (
    <Tabs id="AnalysisTypeTabs">
      <Tab
        id={getString('pipeline.verification.analysisTab.metrics')}
        title={getString('pipeline.verification.analysisTab.metrics')}
        panel={
          <DeploymentMetrics
            step={step}
            selectedNode={selectedNode}
            activityId={step.progressData.activityId as unknown as string}
          />
        }
      />
      <Tab
        id={getString('pipeline.verification.analysisTab.logs')}
        title={getString('pipeline.verification.analysisTab.logs')}
        panel={<LogAnalysisContainer step={step} hostName={selectedNode?.hostName} />}
      />
    </Tabs>
  ) : (
    <Container className={css.noAnalysis}>
      <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
    </Container>
  )
  return (
    <Container className={css.main}>
      <ExecutionVerificationSummary
        displayAnalysisCount={false}
        step={step}
        className={css.executionSummary}
        onSelectNode={setSelectedNode}
      />
      {content}
    </Container>
  )
}
