import React from 'react'
import { useParams } from 'react-router-dom'

import { Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import formatCost from '@ce/utils/formatCost'
import { useGraphQLQuery } from '@common/hooks/useGraphQLQuery'
import FETCH_RECOMMENDATIONS from 'queries/ce/fetch_recommendation.gql'
import type { FetchRecommendationQuery } from 'services/ce/services'

import RecommendationDetails from '../../components/RecommendationDetails/RecommendationDetails'
import css from './RecommendationDetailsPage.module.scss'

interface RecommendationDetails {
  items: Array<RecommendationItem>
}
export interface RecommendationItem {
  containerName: string
  cpuHistogram: {
    bucketWeights: Array<number>
    firstBucketSize: number
    growthRatio: number
    maxBucket: number
    numBuckets: number
    precomputed: Array<number>
    totalWeight: number
    minBucket: number
  }
  memoryHistogram: {
    bucketWeights: Array<number>
    firstBucketSize: number
    growthRatio: number
    maxBucket: number
    minBucket: number
    numBuckets: number
    precomputed: Array<number>
    totalWeight: number
  }
}

const RecommendationHelperText = () => {
  const { getString } = useStrings()

  return (
    <Container padding="xlarge">
      <Layout.Vertical spacing="large">
        <Text font="medium">{getString('ce.recommendation.listPage.listTableHeaders.recommendationType')}</Text>
        <Text color="blue500" font="medium">
          {getString('ce.recommendation.detailsPage.resizeText')}
        </Text>
        <Text color="grey800" font="medium">
          {getString('ce.recommendation.detailsPage.howItWorks')}
        </Text>
        <Text color="grey400">{getString('ce.recommendation.detailsPage.recommendationComputation')}</Text>
        <Text color="grey800" font="medium">
          {getString('ce.recommendation.detailsPage.costOptimized')}
        </Text>
        <Text color="grey400">{getString('ce.recommendation.detailsPage.costOptimizedDetails')}</Text>
        <Text color="grey800" font="medium">
          {getString('ce.recommendation.detailsPage.performanceOptimized')}
        </Text>
        <Text color="grey400">{getString('ce.recommendation.detailsPage.performanceOptimizedDetails')}</Text>
        <Text color="grey800" font="medium">
          {getString('common.repo_provider.customLabel')}
        </Text>
        <Text color="grey400">{getString('ce.recommendation.detailsPage.customDetails')}</Text>
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
  const { getString } = useStrings()

  return (
    <Container padding="xlarge" className={css.savingsContainer}>
      <Layout.Horizontal spacing="large">
        <CostDetails
          costName={getString('ce.recommendation.listPage.monthlySavingsText')}
          totalCost={formatCost(25000)}
          isSavingsCost={true}
        />
        <CostDetails costName={getString('ce.recommendation.detailsPage.totalCost')} totalCost={formatCost(25000)} />
        <CostDetails costName={getString('ce.recommendation.detailsPage.idleCost')} totalCost={formatCost(25000)} />
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

  const { data, initLoading } = useGraphQLQuery<{ data: FetchRecommendationQuery }>({
    path: `/ccm/api/graphql?accountIdentifier=${accountId}`,
    body: { query: FETCH_RECOMMENDATIONS, variables: { id: recommendation } }
  })

  const recommendationDetails = (data?.data.recommendationDetails as RecommendationDetails) || []

  const recommendationItems = recommendationDetails?.items || []

  return (
    <Container className={css.pageBody} style={{ overflow: 'scroll', height: '100vh' }}>
      {initLoading && <Page.Spinner />}
      <Container background="white">
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
        <RecommendationSavingsComponent />
      </Container>
      <Container padding="xlarge">
        <Layout.Vertical spacing="xlarge">
          {recommendationItems.length ? (
            <Container className={css.detailsContainer}>
              {recommendationItems.map((item, index) => {
                return <RecommendationDetails key={`${item.containerName}-${index}`} histogramData={item} />
              })}
              <RecommendationHelperText />
            </Container>
          ) : null}
        </Layout.Vertical>
      </Container>
    </Container>
  )
}

export default RecommendationDetailsPage
