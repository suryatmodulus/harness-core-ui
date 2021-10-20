import React from 'react'
import { Container, FontVariation, Heading, Icon, Layout, Tabs } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './PipelinePolicySets.module.scss'

export interface PipelinePolicySetsProps {
  pipelineName?: string
}

export const PipelinePolicySets: React.FC<PipelinePolicySetsProps> = ({ pipelineName }) => {
  const { getString } = useStrings()

  return (
    <Container className={css.main}>
      <Layout.Horizontal spacing="small" padding="xlarge" className={css.header}>
        <Icon name="governance" size={16} />
        <Heading level={4} font={{ variation: FontVariation.H4 }}>
          {getString('pipeline.policyEvaluations.policySetsApplied', { pipelineName })}
        </Heading>
      </Layout.Horizontal>

      <Container className={css.tabs}>
        <Tabs
          id={'pipelinePolicySets'}
          defaultSelectedTabId={'evaluations'}
          tabList={[
            {
              id: 'policySets',
              title: getString('pipeline.policyEvaluations.policySets', { count: 0 }),
              panel: <Container className={css.tabContent}>Policy Sets</Container>
            },
            {
              id: 'evaluations',
              title: getString('pipeline.policyEvaluations.evaluations'),
              panel: <Container className={css.tabContent}>Evaluations</Container>
            }
          ]}
        />
      </Container>
    </Container>
  )
}
