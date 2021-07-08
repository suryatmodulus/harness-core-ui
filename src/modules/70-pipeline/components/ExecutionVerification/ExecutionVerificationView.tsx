import React from 'react'
import { Container, Tabs, Tab } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { DeploymentProgressAndNodes } from './components/DeploymentProgressAndNodes/DeploymentProgressAndNodes'
import { DeploymentMetrics } from './components/DeploymentMetrics/DeploymentMetrics'
import css from './ExecutionVerificationView.module.scss'

export function ExecutionVerificationView(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      <DeploymentProgressAndNodes />
      <Tabs id="AnalysisTypeTabs">
        <Tab
          id={getString('pipeline.verification.analysisTab.metrics')}
          title={getString('pipeline.verification.analysisTab.metrics')}
          panel={<DeploymentMetrics />}
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
