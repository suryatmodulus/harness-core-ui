import React from 'react'
import { FontVariation, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { RiskValues } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { MetricsAccordionPanelSummaryProps } from './MetricsAccordionPanelSummary.types'
import { getRiskDisplayName } from './MetricsAccordionPanelSummary.utils'
import css from '../DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow.module.scss'

const MetricsAccordionPanelSummary: React.FC<MetricsAccordionPanelSummaryProps> = props => {
  const {
    analysisRow: { metricName, risk }
  } = props

  const { HEALTHY, NEED_ATTENTION, NO_ANALYSIS, NO_DATA, OBSERVE, UNHEALTHY } = RiskValues

  const { getString } = useStrings()

  const riskDisplayName = getRiskDisplayName(risk, getString)

  const {
    metricRisk,
    metricRiskHealthy,
    metricRiskWarning,
    metricRiskNoAnalysis,
    metricRiskNoData,
    metricRiskObserve,
    metricRiskUnhealthy
  } = css

  return (
    <>
      <Text margin={{ left: 'small' }}>{metricName}</Text>
      <Text>Group</Text>
      <Text
        font={{ variation: FontVariation.TABLE_HEADERS }}
        className={cx(metricRisk, {
          [metricRiskHealthy]: risk === HEALTHY,
          [metricRiskWarning]: risk === NEED_ATTENTION,
          [metricRiskNoAnalysis]: risk === NO_ANALYSIS,
          [metricRiskNoData]: risk === NO_DATA,
          [metricRiskObserve]: risk === OBSERVE,
          [metricRiskUnhealthy]: risk === UNHEALTHY
        })}
      >
        {riskDisplayName}
      </Text>
      <Text>Nodes</Text>
    </>
  )
}

export default MetricsAccordionPanelSummary
