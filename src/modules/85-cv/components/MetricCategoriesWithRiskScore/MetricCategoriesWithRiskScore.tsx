import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import classnames from 'classnames'
import type { CategoryRisk } from 'services/cv'
import { RiskScoreTile, RiskScoreTileProps } from '../RiskScoreTile/RiskScoreTile'
import i18n from './MetricCategoriesWithRiskScore.i18n'
import css from './MetricCategoriesWithRiskScore.module.scss'

export interface CategoriesWithRiskScoreProps {
  categoriesWithRiskScores: CategoryRisk[]
  className?: string
  infoContainerClassName?: string
  riskScoreTileProps?: Omit<RiskScoreTileProps, 'riskScore'>
}

export const MetricCategoryNames = {
  ERRORS: i18n.categoryRiskLabels.errors,
  INFRASTRUCTURE: i18n.categoryRiskLabels.infrastructure,
  PERFORMANCE: i18n.categoryRiskLabels.performance
}

function getAbbreviatedMetricCategories(category: string): string {
  switch (category) {
    case MetricCategoryNames.ERRORS:
    case i18n.categoryRiskLabels.errors:
      return i18n.categoryRiskAbbreviatedLabels.errors
    case MetricCategoryNames.INFRASTRUCTURE:
    case i18n.categoryRiskLabels.infrastructure:
      return i18n.categoryRiskAbbreviatedLabels.infrastructure
    case MetricCategoryNames.PERFORMANCE:
    case i18n.categoryRiskLabels.performance:
      return i18n.categoryRiskAbbreviatedLabels.performance
    default:
      return ' '
  }
}

function sortCategories(categoryRiskScores?: CategoryRisk[]): void {
  if (!categoryRiskScores) {
    return
  }
  categoryRiskScores.sort((a, b) => {
    if (a?.category === MetricCategoryNames.PERFORMANCE) {
      return -1
    }
    if (a?.category === MetricCategoryNames.ERRORS) {
      return b?.category === MetricCategoryNames.PERFORMANCE ? 1 : -1
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
  sortCategories(categoriesAndRiskScore)
  return (
    <Container className={className}>
      <Container className={css.main}>
        {categoriesAndRiskScore?.map(riskScoreMapping => {
          const { category, risk = -1 } = riskScoreMapping
          return !category ? undefined : (
            <Container key={category} className={classnames(css.infoContainer, infoContainerClassName)}>
              <Text style={{ fontSize: 12 }}>{getAbbreviatedMetricCategories(category)}</Text>
              <RiskScoreTile riskScore={risk} isSmall {...riskScoreTileProps} />
            </Container>
          )
        })}
      </Container>
    </Container>
  )
}
