import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, IconName, Layout, Text } from '@wings-software/uicore'
import { TimeRange, TimeRangeType, TimeRangeValue } from '@ce/types'
import { GET_DATE_RANGE } from '@ce/utils/momentUtils'
import { Page } from '@common/exports'
import {
  NodeRecommendationDto,
  RecommendationItemDto,
  RecommendationOverviewStats,
  ResourceType,
  useFetchRecommendationQuery
} from 'services/ce/services'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import Recommender from '@ce/components/NodeRecommendation/Recommender'
import InstructionPanel from '@ce/components/NodeRecommendation/NodeRecommendationInstructionPanel'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import formatCost from '@ce/utils/formatCost'
import css from './NodeRecommendationDetailsPage.module.scss'

interface Params {
  recommendation: string
  recommendationName: string
  accountId: string
}

const NodeRecommendationDetailsPage = () => {
  const { getString } = useStrings()
  const { recommendation, accountId, recommendationName } = useParams<Params>()
  const [timeRange] = useState<TimeRangeValue>({ value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 })
  const timeRangeFilter = GET_DATE_RANGE[timeRange.value]

  const breadCrumbLinks = useMemo(() => {
    return [
      { url: routes.toCERecommendations({ accountId }), label: getString('ce.recommendation.sideNavText') },
      { url: '', label: recommendationName }
    ]
  }, [])

  const [{ data, fetching }] = useFetchRecommendationQuery({
    variables: {
      id: recommendation,
      resourceType: ResourceType.NodePool,
      startTime: timeRangeFilter[0],
      endTime: timeRangeFilter[1]
    }
  })

  if (fetching) {
    return <Page.Spinner />
  }

  const recommendationStats = (data?.recommendationStatsV2 || {}) as RecommendationOverviewStats
  const recommendationDetails = (data?.recommendationDetails || {}) as NodeRecommendationDto
  const nodePoolData =
    (data?.recommendationsV2?.items?.length && data?.recommendationsV2?.items[0]) || ({} as RecommendationItemDto)
  // console.log('Dayayayay>>>>> ', data)

  return (
    <Container>
      <Container className={css.header}>
        <NGBreadcrumbs className={css.breadCrumb} links={breadCrumbLinks} />
        <Layout.Horizontal
          style={{
            justifyContent: 'space-between',
            padding: 'var(--spacing-medium) var(--spacing-huge) var(--spacing-xlarge)'
          }}
        >
          <Layout.Horizontal spacing="huge">
            <Container>
              <Layout.Vertical spacing="xxxlarge">
                <CostDetails totalCost={formatCost(recommendationStats.totalMonthlySaving)} />
                <Distribution service={recommendationDetails.current?.service || ''} />
              </Layout.Vertical>
            </Container>
            <Container>
              <NodePoolDetails
                clusterName={nodePoolData.clusterName || ''}
                resourceName={nodePoolData.resourceName || ''}
              />
            </Container>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Container>
      <Container className={css.body}>
        <Recommender stats={recommendationStats} details={recommendationDetails} />
        <InstructionPanel />
      </Container>
    </Container>
  )
}

const CostDetails = ({ totalCost }: { totalCost: string }) => {
  const { getString } = useStrings()
  return (
    <Container>
      <Layout.Vertical spacing="small">
        <Text font="normal" color="grey400">
          {getString('ce.recommendation.listPage.monthlySavingsText')}
        </Text>
        <Text
          font={{ weight: 'bold', size: 'medium' }}
          color="green600"
          icon="money-icon"
          iconProps={{ size: 24, style: { paddingRight: 10 } }}
        >
          {totalCost}
        </Text>
      </Layout.Vertical>
    </Container>
  )
}

const Distribution = ({ service }: { service: string }) => {
  const { getString } = useStrings()
  const map: Record<string, { label: string; icon: IconName }> = useMemo(() => {
    return {
      gke: {
        label: getString('ce.nodeRecommendation.gke'),
        icon: 'gcp'
      },
      aks: {
        label: getString('ce.nodeRecommendation.aks'),
        icon: 'service-azure'
      },
      eks: {
        label: getString('ce.nodeRecommendation.eks'),
        icon: 'service-aws'
      }
    }
  }, [])

  return (
    <Container>
      <Layout.Vertical spacing="small">
        <Text font="normal" color="grey400">
          {getString('ce.nodeRecommendation.distribution')}
        </Text>
        <Text
          font="small"
          color="grey700"
          icon={map[service]?.icon}
          iconProps={{ size: 18, style: { paddingRight: 10 } }}
        >
          {map[service]?.label}
        </Text>
      </Layout.Vertical>
    </Container>
  )
}

const NodePoolDetails = ({ clusterName, resourceName }: { clusterName: string; resourceName: string }) => {
  const { getString } = useStrings()
  return (
    <Container>
      <Layout.Vertical spacing="small">
        <Text font="normal" color="grey400">
          {getString('ce.nodeRecommendation.poolDetails')}
        </Text>
        <Container>
          <Layout.Vertical spacing="xxlarge">
            <Container>
              <Layout.Vertical spacing="xsmall">
                <Text font="normal" color="grey800">
                  {getString('common.cluster')}
                </Text>
                <Text font="small" color="grey500">
                  {clusterName}
                </Text>
              </Layout.Vertical>
            </Container>
            <Container>
              <Layout.Vertical spacing="xsmall">
                <Text font="normal" color="grey800">
                  {getString('ce.nodeRecommendation.nodepool')}
                </Text>
                <Text font="small" color="grey500">
                  {resourceName}
                </Text>
              </Layout.Vertical>
            </Container>
          </Layout.Vertical>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default NodeRecommendationDetailsPage
