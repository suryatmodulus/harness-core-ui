/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import { RecommendationType } from './constants'

import css from './RecommendationDetails.module.scss'

interface RecommendationTabsProps {
  selectedRecommendation: RecommendationType
  setSelectedRecommendation: React.Dispatch<React.SetStateAction<RecommendationType>>
  setCPUReqVal: React.Dispatch<React.SetStateAction<number>>
  setMemReqVal: React.Dispatch<React.SetStateAction<number>>
  setMemLimitVal: React.Dispatch<React.SetStateAction<number>>
  costOptimizedSavings: number
  performanceOptimizedSavings: number
  currentSavings: number
  isPerfOptimizedCustomized: boolean
  isCostOptimizedCustomized: boolean
}

const RecommendationTabs: React.FC<RecommendationTabsProps> = ({
  selectedRecommendation,
  setSelectedRecommendation,
  setCPUReqVal,
  setMemReqVal,
  setMemLimitVal,
  costOptimizedSavings,
  performanceOptimizedSavings,
  currentSavings,
  isPerfOptimizedCustomized,
  isCostOptimizedCustomized
}) => {
  const { getString } = useStrings()

  return (
    <Container padding="small" className={css.recommendationTypeContainer}>
      <Layout.Horizontal className={css.recommendations}>
        <Layout.Horizontal
          className={cx(css.recommendationTypeText, {
            [css.selectedTab]: selectedRecommendation === RecommendationType.CostOptimized
          })}
          spacing="xsmall"
          onClick={() => {
            setCPUReqVal(50)
            setMemReqVal(50)
            setMemLimitVal(95)
            setSelectedRecommendation(RecommendationType.CostOptimized)
          }}
        >
          <Text
            font={{
              size: 'small',
              align: 'center'
            }}
            className={cx({ [css.selectedTab]: selectedRecommendation === RecommendationType.CostOptimized })}
          >
            {getString('ce.recommendation.detailsPage.costOptimized')}
          </Text>
          {costOptimizedSavings > 0 ? (
            <Text
              font={{
                size: 'xsmall',
                align: 'center'
              }}
              className={cx(css.recommendationCost, {
                [css.selectedTabCost]: selectedRecommendation === RecommendationType.CostOptimized
              })}
              padding={{
                left: 'small',
                right: 'small'
              }}
            >
              {formatCost(
                selectedRecommendation === RecommendationType.CostOptimized ? currentSavings : costOptimizedSavings
              )}
              {isCostOptimizedCustomized ? (
                <Text className={css.astericSign} inline font="normal">
                  *
                </Text>
              ) : null}
            </Text>
          ) : null}
        </Layout.Horizontal>

        <Layout.Horizontal
          className={cx(css.recommendationTypeText, {
            [css.selectedTab]: selectedRecommendation === RecommendationType.PerformanceOptimized
          })}
          spacing="xsmall"
          onClick={() => {
            setCPUReqVal(95)
            setMemReqVal(95)
            setMemLimitVal(95)
            setSelectedRecommendation(RecommendationType.PerformanceOptimized)
          }}
        >
          <Text
            font={{
              size: 'small',
              align: 'center'
            }}
            className={cx({ [css.selectedTab]: selectedRecommendation === RecommendationType.PerformanceOptimized })}
          >
            {getString('ce.recommendation.detailsPage.performanceOptimized')}
          </Text>
          {performanceOptimizedSavings > 0 ? (
            <Text
              font={{
                size: 'xsmall',
                align: 'center'
              }}
              className={cx(css.recommendationCost, {
                [css.selectedTabCost]: selectedRecommendation === RecommendationType.PerformanceOptimized
              })}
              padding={{
                left: 'small',
                right: 'small'
              }}
            >
              {formatCost(
                selectedRecommendation === RecommendationType.PerformanceOptimized
                  ? currentSavings
                  : performanceOptimizedSavings
              )}
              {isPerfOptimizedCustomized ? (
                <Text className={css.astericSign} inline font="normal">
                  *
                </Text>
              ) : null}
            </Text>
          ) : null}
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default RecommendationTabs
