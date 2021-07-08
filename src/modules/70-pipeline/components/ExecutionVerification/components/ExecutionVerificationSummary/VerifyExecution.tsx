import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import moment from 'moment'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import type { ExecutionNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { PrimaryAndCanaryNodes } from './components/PrimaryandCanaryNodes/PrimaryAndCanaryNodes'
import { SummaryOfDeployedNodes } from './components/SummaryOfDeployedNodes/SummaryOfDeployedNodes'
import css from './VerifyExecution.module.scss'

export interface VerifyExecutionProps extends StepDetailProps {
  step: ExecutionNode
}

export function VerifyExecution(props: VerifyExecutionProps): JSX.Element {
  const { step } = props
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      <Container className={css.verifyHeader}>
        <Container>
          <Text font={{ size: 'small' }}>{`${getString('pipeline.startedOn')}: ${moment(step.startTs).format(
            'MMM DD, YYYY h:m a'
          )}`}</Text>
          <Text font={{ size: 'small' }}>{getString('pipeline.duration')}</Text>
        </Container>
      </Container>
      <Container className={css.details}>
        <PrimaryAndCanaryNodes primaryNodeProps={{ totalNodes: 25 }} canaryNodeProps={{ totalNodes: 20 }} />
        <SummaryOfDeployedNodes
          metricsInViolation={12}
          totalMetrics={25}
          logClustersInViolation={1}
          totalLogClusters={35}
        />
      </Container>
    </Container>
  )
}
