import React from 'react'
import { useParams } from 'react-router-dom'

import { Color, Container, Layout, Text } from '@wings-software/uicore'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import formatCost from '@ce/utils/formatCost'

import RecommendationDetails from '../../components/RecommendationDetails/RecommendationDetails'
import css from './RecommendationDetailsPage.module.scss'

const RecommendationHelperText = () => {
  return (
    <Container padding="xlarge" className={css.detailsTextContainer}>
      <Layout.Vertical spacing="large">
        <Text font="medium">RECOMMENDATION TYPE</Text>
        <Text color="blue500" font="medium">
          Resize from a to b
        </Text>
        <Text color="grey800" font="medium">
          How it works / Options you have
        </Text>
        <Text color="grey400">
          The recommendations are computed by analyzing the past utilization of CPU and memory of your workload. The
          implementation uses a decaying histogram of CPU and memory peaks weighted by recency. The recommendation
          resources are computed as the following:
        </Text>
        <Text color="grey400">The lower bound is based on the 80th percentiles of CPU samples and memory peaks.</Text>{' '}
        <Text color="grey400">
          The upper bound is based on the 95th percentile for memory peaks and no upper bound for CPU samples.
        </Text>
      </Layout.Vertical>
    </Container>
  )
}

const CostDetails: React.FC<{ costName: string; totalCost: string; isSavingsCost?: boolean }> = ({
  costName,
  totalCost,
  isSavingsCost
}) => {
  return (
    <Layout.Vertical spacing="large">
      <Text font="normal">{costName}</Text>
      <Text
        font="medium"
        color={isSavingsCost ? 'green600' : 'grey800'}
        icon={isSavingsCost ? 'money-icon' : undefined}
        iconProps={{ size: 24 }}
      >
        {totalCost}
      </Text>
    </Layout.Vertical>
  )
}

const RecommendationSavingsComponent = () => {
  return (
    <Container className={css.savingsContainer}>
      <Layout.Horizontal spacing="large">
        <CostDetails costName="POTENTIAL MONTHLY SAVINGS" totalCost={formatCost(25000)} isSavingsCost={true} />
        <CostDetails costName="TOTAL COST" totalCost={formatCost(25000)} />
        <CostDetails costName="IDLE COST" totalCost={formatCost(25000)} />
      </Layout.Horizontal>
    </Container>
  )
}

const RecommendationDetailsPage: React.FC = () => {
  const { projectIdentifier, recommendation, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    recommendation: string
    orgIdentifier: string
    accountId: string
  }>()

  return (
    <Container style={{ overflow: 'scroll', height: '100vh', backgroundColor: 'var(--white)' }}>
      <Breadcrumbs
        className={css.breadCrumb}
        links={[
          {
            url: routes.toCEProject({ accountId, orgIdentifier, projectIdentifier }),
            label: projectIdentifier
          },
          {
            url: routes.toCERecommendations({ accountId, orgIdentifier, projectIdentifier }),
            label: 'Recommendation'
          },
          {
            url: '',
            label: recommendation
          }
        ]}
      />
      <Container padding="xlarge">
        <Layout.Vertical spacing="xlarge">
          <RecommendationSavingsComponent />
          <Container className={css.detailsContainer}>
            <RecommendationDetails />
            <RecommendationHelperText />
          </Container>
        </Layout.Vertical>
      </Container>
    </Container>
  )
}

export default RecommendationDetailsPage
