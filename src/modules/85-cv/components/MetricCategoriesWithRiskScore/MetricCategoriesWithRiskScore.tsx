/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import classnames from 'classnames'
import type { CategoryRisk } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { RiskScoreTile, RiskScoreTileProps } from '../RiskScoreTile/RiskScoreTile'
import css from './MetricCategoriesWithRiskScore.module.scss'

export interface CategoriesWithRiskScoreProps {
  categoriesWithRiskScores: CategoryRisk[]
  className?: string
  infoContainerClassName?: string
  riskScoreTileProps?: Omit<RiskScoreTileProps, 'riskScore'>
}

function getAbbreviatedMetricCategories(category: string, getString: UseStringsReturn['getString']): string {
  switch (category) {
    case getString('errors'):
      return getString('cv.abbreviatedCategories.errors')
    case getString('infrastructureText'):
      return getString('cv.abbreviatedCategories.infrastructure')
    case getString('performance'):
      return getString('cv.abbreviatedCategories.performance')
    default:
      return ' '
  }
}

function sortCategories(getString: UseStringsReturn['getString'], categoryRiskScores?: CategoryRisk[]): void {
  if (!categoryRiskScores) {
    return
  }
  categoryRiskScores.sort((a, b) => {
    if (a?.category === getString('performance')) {
      return -1
    }
    if (a?.category === getString('errors')) {
      return b?.category === getString('performance') ? 1 : -1
    }
    return 1
  })
}

export function MetricCategoriesWithRiskScore(props: CategoriesWithRiskScoreProps): JSX.Element {
  const {
    categoriesWithRiskScores: categoriesAndRiskScore = [],
    className,
    infoContainerClassName,
    riskScoreTileProps
  } = props
  const { getString } = useStrings()
  sortCategories(getString, categoriesAndRiskScore)
  return (
    <Container className={className}>
      <Container className={css.main}>
        {categoriesAndRiskScore?.map(riskScoreMapping => {
          const { category, risk = -1 } = riskScoreMapping
          return !category ? undefined : (
            <Container key={category} className={classnames(css.infoContainer, infoContainerClassName)}>
              <Text style={{ fontSize: 12 }}>{getAbbreviatedMetricCategories(category, getString)}</Text>
              <RiskScoreTile riskScore={risk} isSmall {...riskScoreTileProps} />
            </Container>
          )
        })}
      </Container>
    </Container>
  )
}
