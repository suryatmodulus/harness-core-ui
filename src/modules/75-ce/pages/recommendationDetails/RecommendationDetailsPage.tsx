import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useQuery } from 'urql'

import { Color, Container, Layout, Text, Button } from '@wings-software/uicore'
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

const CostDetails: React.FC<{ costName: string; totalCost: React.ReactNode; isSavingsCost?: boolean }> = ({
  costName,
  totalCost,
  isSavingsCost
}) => {
  return (
    <Layout.Vertical spacing="small">
      <Text font="normal" color="grey400">
        {costName}
      </Text>
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

interface WorkloadDataType {
  clusterName?: string
  namespace?: string
  id?: string
  resourceName?: string
}
interface RecommendationSavingsComponentProps {
  recommendationStats: RecommendationOverviewStats
  workloadData: WorkloadDataType
}

const RecommendationSavingsComponent: React.FC<RecommendationSavingsComponentProps> = ({
  recommendationStats,
  workloadData
}) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { recommendation, accountId, recommendationName } = useParams<{
    recommendation: string
    recommendationName: string
    accountId: string
  }>()

  const { totalMonthlyCost, totalMonthlySaving } = recommendationStats

  return (
    <Container padding="xlarge" className={css.savingsContainer}>
      <Container>
        {totalMonthlyCost ? (
          <CostDetails
            costName={getString('ce.recommendation.listPage.monthlySavingsText')}
            totalCost={
              <Layout.Horizontal
                spacing="xsmall"
                style={{
                  alignItems: 'flex-end'
                }}
                className={css.costContainer}
              >
                <Text color="green600" className={css.subText}>
                  {getString('ce.recommendation.listPage.uptoText')}
                </Text>
                <Text font="medium" color="green600">
                  {formatCost(totalMonthlySaving)}
                </Text>
              </Layout.Horizontal>
            }
            isSavingsCost={true}
          />
        ) : null}
        {totalMonthlySaving ? (
          <Container padding={{ top: 'xlarge' }}>
            <CostDetails
              totalCost={
                <Layout.Horizontal
                  spacing="xsmall"
                  style={{
                    alignItems: 'flex-end'
                  }}
                >
                  <Text font="medium" color="grey800">
                    {formatCost(totalMonthlyCost)}
                  </Text>
                  <Text className={css.subText} color="grey300">
                    {getString('ce.recommendation.listPage.forecatedCostSubText')}
                  </Text>
                </Layout.Horizontal>
              }
              costName={getString('ce.recommendation.listPage.monthlyForcastedCostText')}
            />
          </Container>
        ) : null}
      </Container>
      {/* <FlexExpander /> */}
      <Container
        padding={{
          left: 'large'
        }}
      >
        <Layout.Horizontal spacing="huge">
          <Text color={Color.GREY_400}>{getString('ce.perspectives.workloadDetails.workloadDetailsText')}</Text>
          <Button
            className={css.viewDetailsButton}
            round
            font="small"
            minimal
            intent="primary"
            text={getString('ce.recommendation.detailsPage.viewMoreDetailsText')}
            border={true}
            onClick={() => {
              workloadData.clusterName &&
                workloadData.resourceName &&
                workloadData.namespace &&
                history.push(
                  routes.toCERecommendationWorkloadDetails({
                    accountId,
                    recommendation,
                    recommendationName,
                    clusterName: workloadData.clusterName,
                    namespace: workloadData.namespace,
                    workloadName: workloadData.resourceName
                  })
                )
            }}
          />
        </Layout.Horizontal>
        <Container>
          <Text color={Color.GREY_400}>{getString('ce.recommendation.listPage.filters.clusterName')}</Text>
          <Text
            padding={{
              top: 'xsmall'
            }}
          >
            {workloadData.clusterName}
          </Text>
        </Container>
        <Container padding={{ top: 'large' }}>
          <Text color={Color.GREY_400}>{getString('ce.perspectives.workloadDetails.fieldNames.workload')}</Text>
          <Text
            padding={{
              top: 'xsmall'
            }}
          >
            {workloadData.resourceName}
          </Text>
        </Container>
      </Container>
    </Container>
  )
}

const RecommendationDetailsPage: React.FC = () => {
  const { recommendation, accountId, recommendationName } = useParams<{
    recommendation: string
    recommendationName: string
    accountId: string
  }>()
  const { getString } = useStrings()
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({ value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 })

  const timeRangeFilter = GET_DATE_RANGE[timeRange.value]

  const [result] = useQuery<FetchRecommendationQuery>({
    query: FETCH_RECOMMENDATIONS,
    variables: { id: recommendation, startTime: timeRangeFilter[0], endTime: timeRangeFilter[1] }
  })

  const { data, fetching } = result

  const recommendationDetails = (data?.recommendationDetails as RecommendationDetails) || []
  const recommendationStats = data?.recommendationStatsV2 as RecommendationOverviewStats
  const recommendationItems = recommendationDetails?.items || []
  const workloadData = data?.recommendationsV2?.items?.length && data?.recommendationsV2?.items[0]

  return (
    <Container className={css.pageBody} style={{ overflow: 'scroll', height: '100vh' }}>
      {fetching && <Page.Spinner />}
      <Container background="white">
        <Breadcrumbs
          className={css.breadCrumb}
          links={[
            {
              url: routes.toCERecommendations({ accountId }),
              label: getString('ce.recommendation.sideNavText')
            },
            {
              url: '',
              label: recommendationName
            }
          ]}
        />
        {recommendationStats ? (
          <RecommendationSavingsComponent
            recommendationStats={recommendationStats}
            workloadData={workloadData as WorkloadDataType}
          />
        ) : null}
      </Container>
      <Container padding="xlarge" className={css.mainContainer}>
        <Layout.Vertical spacing="xlarge">
          {recommendationItems.length ? (
            <Container className={css.detailsContainer}>
              <Layout.Vertical spacing="huge">
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
              </Layout.Vertical>
              <RecommendationHelperText />
            </Container>
          ) : null}
        </Layout.Vertical>
      </Container>
    </Container>
  )
}

export default RecommendationDetailsPage
