import React from 'react'
import { Container, FontVariation, Text } from '@harness/uicore'
import css from '../DeploymentMetrics.module.scss'

const DeploymentMetricsLables: React.FC = () => {
  return (
    <Container className={css.deploymentMetricsLables}>
      <Text font={{ variation: FontVariation.LEAD }}>Metric Name</Text>
      <Text font={{ variation: FontVariation.LEAD }}>Group</Text>
      <Text font={{ variation: FontVariation.LEAD }}>Risk</Text>
      <Text font={{ variation: FontVariation.LEAD }}>Nodes</Text>
    </Container>
  )
}

export default DeploymentMetricsLables
