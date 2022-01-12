import React from 'react'
import { Text } from '@wings-software/uicore'
import type { MetricsAccordionPanelSummaryProps } from './MetricsAccordionPanelSummary.types'

const MetricsAccordionPanelSummary: React.FC<MetricsAccordionPanelSummaryProps> = props => {
  const { analysisRow } = props
  return (
    <>
      <Text>{analysisRow.metricName}</Text>
      <Text>Group</Text>
      <Text>Risk</Text>
      <Text>Nodes</Text>
    </>
  )
}

export default MetricsAccordionPanelSummary
