import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'urql'

import { Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import formatCost from '@ce/utils/formatCost'
import { GET_DATE_RANGE } from '@ce/utils/momentUtils'
import type { RecommendationItem, TimeRangeValue } from '@ce/types'
import { TimeRange, TimeRangeType } from '@ce/types'
import FETCH_RECOMMENDATIONS from 'queries/ce/fetch_recommendation.gql'
import type { FetchRecommendationQuery, RecommendationOverviewStats } from 'services/ce/services'
import CustomizeRecommendationsImg from './images/custom-recommendations.gif'

import RecommendationDetails from '../../components/RecommendationDetails/RecommendationDetails'
import css from './RecommendationDetailsPage.module.scss'

interface ResourceDetails {
  cpu?: string
  memory: string
}
interface ResourceObject {
  limits: ResourceDetails
  requests: ResourceDetails
}
interface ContainerRecommendaitons {
  current: ResourceObject
}
interface RecommendationDetails {
  items: Array<RecommendationItem>
  containerRecommendations: Record<string, ContainerRecommendaitons>
}

const RecommendationHelperText: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Container padding="xlarge">
      <Layout.Vertical spacing="large">
        <Text font="medium">{getString('ce.recommendation.listPage.listTableHeaders.recommendationType')}</Text>
        <Text color="primary5" font="medium">
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
        <Container
          style={{
            alignSelf: 'center'
          }}
        >
          <img className={css.customImage} src={CustomizeRecommendationsImg} alt="custom-recommendation-img" />
        </Container>
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
    <Layout.Vertical spacing="medium">
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

interface RecommendationSavingsComponentProps {
  recommendationStats: RecommendationOverviewStats
}

const RecommendationSavingsComponent: React.FC<RecommendationSavingsComponentProps> = ({ recommendationStats }) => {
  const { getString } = useStrings()

  const { totalMonthlyCost, totalMonthlySaving } = recommendationStats

  return (
    <Container padding="xlarge" className={css.savingsContainer}>
      <Layout.Horizontal spacing="large">
        {totalMonthlyCost ? (
          <CostDetails
            costName={getString('ce.recommendation.listPage.monthlySavingsText')}
            totalCost={formatCost(totalMonthlyCost)}
            isSavingsCost={true}
          />
        ) : null}
        {totalMonthlySaving ? (
          <CostDetails
            costName={getString('ce.recommendation.listPage.monthlyForcastedCostText')}
            totalCost={formatCost(totalMonthlySaving)}
          />
        ) : null}
        {/* <CostDetails costName={getString('ce.recommendation.detailsPage.idleCost')} totalCost={formatCost(25000)} /> */}
      </Layout.Horizontal>
    </Container>
  )
}

const RecommendationDetailsPage: React.FC = () => {
  const { recommendation, accountId } = useParams<{
    recommendation: string
    accountId: string
  }>()

  const [timeRange, setTimeRange] = useState<TimeRangeValue>({ value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 })

  const timeRangeFilter = GET_DATE_RANGE[timeRange.value]

  const [result] = useQuery<FetchRecommendationQuery>({
    query: FETCH_RECOMMENDATIONS,
    variables: { id: recommendation, startTime: timeRangeFilter[0], endTime: timeRangeFilter[1] }
  })

  const { data, fetching } = result

  const recommendationDetails = (data?.recommendationDetails as RecommendationDetails) || []

  const recommendationStats = data?.recommendationStats as RecommendationOverviewStats

  const recommendationItems = recommendationDetails?.items || []

  return (
    <Container className={css.pageBody} style={{ overflow: 'scroll', height: '100vh' }}>
      {fetching && <Page.Spinner />}
      <Container background="white">
        <Breadcrumbs
          className={css.breadCrumb}
          links={[
            {
              url: routes.toCERecommendations({ accountId }),
              label: 'Recommendation'
            },
            {
              url: '',
              label: recommendation
            }
          ]}
        />
        {recommendationStats ? <RecommendationSavingsComponent recommendationStats={recommendationStats} /> : null}
      </Container>
      <Container padding="xlarge" className={css.mainContainer}>
        <Layout.Vertical spacing="xlarge">
          {recommendationItems.length ? (
            <Container className={css.detailsContainer}>
              {recommendationItems.map((item, index) => {
                const { containerName } = item
                const currentResources = recommendationDetails?.containerRecommendations[containerName]?.current
                return (
                  <RecommendationDetails
                    key={`${item.containerName}-${index}-${timeRange.label}`}
                    histogramData={item}
                    currentResources={currentResources}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                  />
                )
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
