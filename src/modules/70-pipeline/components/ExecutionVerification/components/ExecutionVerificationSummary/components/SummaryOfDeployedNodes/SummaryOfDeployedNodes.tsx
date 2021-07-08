import React from 'react'
import { Color, Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './SummaryOfDeployedNodes.module.scss'

interface SummaryOfDeployedNodesProps {
  metricsInViolation: number
  totalMetrics: number
  logClustersInViolation: number
  totalLogClusters: number
  onClickViewDetails?: (isMetrics: boolean) => void
}

interface SummaryTextProps {
  numerator: number
  denominator: number
  titleText: string
}

function SummaryText(props: SummaryTextProps): JSX.Element {
  const { numerator, denominator, titleText } = props
  const { getString } = useStrings()
  return (
    <Container className={css.summaryContent}>
      <Container className={css.violations}>
        <Text intent="danger" font={{ size: 'large', weight: 'bold' }}>
          {numerator}
        </Text>
        <Text color={Color.BLACK} className={css.outOf}>
          {getString('pipeline.outOf').toLocaleUpperCase()}
        </Text>
        <Text font={{ size: 'large', weight: 'bold' }}>{denominator}</Text>
      </Container>
      <Text color={Color.BLACK}>{titleText}</Text>
    </Container>
  )
}

export function SummaryOfDeployedNodes(props: SummaryOfDeployedNodesProps): JSX.Element {
  const { metricsInViolation, totalMetrics, logClustersInViolation, totalLogClusters } = props
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      <Text font={{ size: 'medium' }}>{getString('summary').toLocaleUpperCase()}</Text>
      <hr />
      <Container className={css.summaryContainer}>
        <SummaryText
          numerator={metricsInViolation}
          denominator={totalMetrics}
          titleText={getString('pipeline.verification.metricsInViolation')}
        />
        <SummaryText
          numerator={logClustersInViolation}
          denominator={totalLogClusters}
          titleText={getString('pipeline.verification.logClustersInViolation')}
        />
      </Container>
    </Container>
  )
}
