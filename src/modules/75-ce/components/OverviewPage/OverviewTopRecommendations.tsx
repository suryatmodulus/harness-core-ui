import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container, Layout, Text } from '@wings-software/uicore'
import { K8sRecommendationFilterDtoInput, RecommendationItemDto, useRecommendationsQuery } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import formatCost from '@ce/utils/formatCost'
import { Loader } from './OverviewPageLayout'
import css from './OverviewPage.module.scss'

type Params = {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
}

const OverviewTopRecommendations = () => {
  const { getString } = useStrings()
  const pathParams = useParams<Params>()
  const [result] = useRecommendationsQuery({
    requestPolicy: 'network-only',
    variables: {
      filter: { offset: 0, limit: 20, resourceTypes: ['WORKLOAD'], minSaving: 0 } as K8sRecommendationFilterDtoInput
    }
  })

  const { data, fetching } = result
  const recommendationItems = data?.recommendationsV2?.items || []

  if (fetching) {
    return <Loader />
  }

  return (
    <div className={css.topRecommendations}>
      <Layout.Vertical spacing="medium">
        <Layout.Horizontal style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Text color="grey800" font={{ weight: 'semi-bold', size: 'medium' }}>
            {getString('ce.overview.cardtitles.topRecommendation')}
          </Text>
          <Link to={routes.toCERecommendations({ ...pathParams })}>
            <Text inline color="primary7">
              {getString('ce.overview.seeAll')}
            </Text>
          </Link>
        </Layout.Horizontal>
        <div className={css.recommendations}>
          {recommendationItems.map((rec, idx) => {
            return <Recommendation key={idx} data={rec as RecommendationItemDto} />
          })}
        </div>
      </Layout.Vertical>
    </div>
  )
}

interface RecommendationProps {
  data: RecommendationItemDto
}

const Recommendation = (props: RecommendationProps) => {
  const { getString } = useStrings()
  const map: Record<string, string> = useMemo(
    () => ({
      WORKLOAD: getString('ce.overview.workload')
    }),
    []
  )

  return (
    <div className={css.recommendation}>
      <Layout.Vertical spacing="xsmall">
        <Container>
          <Text inline className={css.resourceType}>
            {map[props.data.resourceType]}
          </Text>
        </Container>
        <Text font="normal" color="grey800" lineClamp={1}>
          {props.data.resourceName}
        </Text>
      </Layout.Vertical>
      <Layout.Vertical spacing="xsmall" style={{ alignItems: 'flex-end' }}>
        <Text color="green700">{formatCost(props.data.monthlySaving as number)}</Text>
        <Text font="small" color="grey400">
          {getString('ce.overview.savings')}
        </Text>
      </Layout.Vertical>
    </div>
  )
}

export default OverviewTopRecommendations
