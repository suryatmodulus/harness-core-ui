/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Color, Container, Layout, Text, FontVariation } from '@wings-software/uicore'
import { K8sRecommendationFilterDtoInput, RecommendationItemDto, useRecommendationsQuery } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import formatCost from '@ce/utils/formatCost'
import EmptyView from '@ce/images/empty-state.svg'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Loader } from './OverviewPageLayout'
import css from './OverviewPage.module.scss'

const OverviewTopRecommendations = () => {
  const { getString } = useStrings()
  const pathParams = useParams<AccountPathProps>()
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
          {recommendationItems.length ? (
            <Link to={routes.toCERecommendations({ ...pathParams })}>
              <Text inline color="primary7">
                {getString('ce.overview.seeAll')}
              </Text>
            </Link>
          ) : null}
        </Layout.Horizontal>
        {recommendationItems.length ? (
          <div className={css.recommendations}>
            {recommendationItems.map((rec, idx) => {
              return <Recommendation key={idx} data={rec as RecommendationItemDto} />
            })}
          </div>
        ) : (
          <Container className={css.noDataContainer}>
            <img className={css.noDataImg} src={EmptyView} />
            <Text className={css.noDataText}>{getString('ce.pageErrorMsg.noRecommendations')}</Text>
          </Container>
        )}
      </Layout.Vertical>
    </div>
  )
}

interface RecommendationProps {
  data: RecommendationItemDto
}

const Recommendation = (props: RecommendationProps) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const {
    data: { id, resourceName }
  } = props

  const map: Record<string, string> = useMemo(
    () => ({
      WORKLOAD: getString('ce.overview.workload')
    }),
    []
  )

  return (
    <Link
      to={routes.toCERecommendationDetails({ accountId, recommendation: id, recommendationName: resourceName || id })}
    >
      <div className={css.recommendation}>
        <Layout.Vertical spacing="xsmall">
          <Container>
            <Text inline className={css.resourceType}>
              {map[props.data.resourceType]}
            </Text>
          </Container>
          <Text color={Color.GREY_800} lineClamp={1}>
            {props.data.resourceName}
          </Text>
        </Layout.Vertical>
        <Layout.Vertical spacing="xsmall" style={{ alignItems: 'flex-end' }}>
          <Text color={Color.GREEN_700}>{formatCost(props.data.monthlySaving as number)}</Text>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_400}>
            {getString('ce.overview.savings')}
          </Text>
        </Layout.Vertical>
      </div>
    </Link>
  )
}

export default OverviewTopRecommendations
