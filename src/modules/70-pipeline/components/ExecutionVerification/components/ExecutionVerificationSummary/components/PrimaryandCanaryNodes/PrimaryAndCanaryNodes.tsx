import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import {
  DeploymentNodes,
  DeploymentNodesProps
} from '@pipeline/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes'
import css from './PrimaryAndCanaryNodes.module.scss'

interface PrimaryAndCanaryNodesProps {
  primaryNodeProps: DeploymentNodesProps
  canaryNodeProps: DeploymentNodesProps
}

export function PrimaryAndCanaryNodes(props: PrimaryAndCanaryNodesProps): JSX.Element {
  const { canaryNodeProps, primaryNodeProps } = props
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      <Container className={css.primaryNodes}>
        <Text font={{ size: 'medium' }}>{getString('primary').toLocaleUpperCase()}</Text>
        <DeploymentNodes {...primaryNodeProps} />
      </Container>
      <Container className={css.canaryNodes}>
        <Text font={{ size: 'medium' }}>{getString('canary').toLocaleUpperCase()}</Text>
        <DeploymentNodes {...canaryNodeProps} />
      </Container>
    </Container>
  )
}
