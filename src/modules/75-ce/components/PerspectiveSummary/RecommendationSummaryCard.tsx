/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import qs from 'qs'
import { Card, Container, Icon, Text, FontVariation, Layout, FlexExpander, Color } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { getViewFilterForId } from '@ce/utils/perspectiveUtils'
import formatCost from '@ce/utils/formatCost'
import { K8sRecommendationFilterDtoInput, useRecommendationsSummaryQuery } from 'services/ce/services'
import css from './PerspectiveSummary.module.scss'

const RecommendationSummaryCard: () => JSX.Element = () => {
  const { perspectiveId, accountId, perspectiveName } = useParams<{
    perspectiveId: string
    accountId: string
    perspectiveName: string
  }>()

  const { getString } = useStrings()

  const history = useHistory()

  const [{ data, fetching: recommendationFetching }] = useRecommendationsSummaryQuery({
    variables: {
      filter: {
        perspectiveFilters: getViewFilterForId(perspectiveId),
        minSaving: 0
      } as unknown as K8sRecommendationFilterDtoInput
    }
  })

  const nagvigateToRecommendations: () => void = () => {
    history.push({
      pathname: routes.toCERecommendations({
        accountId
      }),
      search: qs.stringify({
        perspectiveId,
        perspectiveName
      })
    })
  }

  if (recommendationFetching) {
    return (
      <Card elevation={1} interactive={false}>
        <Container className={cx(css.mainCard, css.loadingContainer)}>
          <Icon name="spinner" color="blue500" size={30} />
        </Container>
      </Card>
    )
  }

  const recommendationData = data?.recommendationStatsV2

  if (!recommendationData || !recommendationData?.count) {
    return (
      <Card elevation={1}>
        <Container className={css.mainCard}>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
            {getString('ce.recommendation.sideNavText')}
          </Text>
          <Text
            margin={{
              top: 'medium',
              bottom: 'small'
            }}
            iconProps={{ size: 21 }}
            font={{ variation: FontVariation.BODY1 }}
            icon="money-icon"
          >
            $--
          </Text>
          <Text color={Color.GREY_600} font={{ variation: FontVariation.TINY }}>
            no Recommendations yet
          </Text>
        </Container>
      </Card>
    )
  }

  return (
    <Card elevation={1} interactive={false}>
      <Container className={css.mainCard}>
        <Layout.Horizontal>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
            {getString('ce.recommendation.sideNavText')}
          </Text>
          <FlexExpander />
          <Text
            className={css.viewLink}
            color={Color.PRIMARY_7}
            font={{ variation: FontVariation.SMALL }}
            onClick={nagvigateToRecommendations}
          >
            {getString('ce.perspectives.recommendations.viewText')}
          </Text>
        </Layout.Horizontal>

        <Text
          color={Color.GREY_400}
          margin={{
            top: 'xsmall'
          }}
          font={{ variation: FontVariation.TINY }}
        >
          {getString('ce.perspectives.recommendations.recommendationCountTxt', {
            count: recommendationData.count
          })}
        </Text>
        <Text
          margin={{
            top: 'xsmall',
            bottom: 'xsmall'
          }}
          iconProps={{ size: 21 }}
          font={{ variation: FontVariation.BODY1 }}
          icon="money-icon"
        >
          {formatCost(recommendationData.totalMonthlySaving)}
        </Text>
        <Text color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
          {getString('ce.perspectives.recommendations.perMonth')}
        </Text>
      </Container>
    </Card>
  )
}

export default RecommendationSummaryCard
