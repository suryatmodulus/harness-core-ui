import React, { useMemo } from 'react'
import { Container, Text, Color, Icon, Layout, Button } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more'
import gauge from 'highcharts/modules/solid-gauge'
import cx from 'classnames'
import { isNumber } from 'lodash-es'
import moment from 'moment'
import { useHistory, useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { RiskScoreTile } from '@cv/components/RiskScoreTile/RiskScoreTile'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/exports'
import { MetricCategoryNames } from '@cv/components/MetricCategoriesWithRiskScore/MetricCategoriesWithRiskScore'
import { CategoryRisk, RestResponseCategoryRisksDTO, useGetCategoryRiskMap } from 'services/cv'
import { getColorStyle } from '@common/components/HeatMap/ColorUtils'
import i18n from './CategoryRiskCards.i18n'
import getRiskGaugeChartOptions from './RiskGauge'
import RiskCardTooltip from './RiskCardTooltip/RiskCardTooltip'
import css from './CategoryRiskCards.module.scss'

interface CategoryRiskCardsWithApiProps {
  environmentIdentifier?: string
  serviceIdentifier?: string
  className?: string
  onCardSelect?(category?: string): void
}

interface CategoryRiskCardProps {
  categoryName: string
  riskScore: number
  className?: string
  onClick?(): void
}

interface CategoryRiskCardsProps {
  className?: string
  data: RestResponseCategoryRisksDTO | null
  loading?: boolean
  error?: string
  onCardSelect?(category?: string): void
}

interface OverallRiskScoreCard {
  overallRiskScore: number
  className?: string
  onClick?(): void
  hasConfigsSetup?: boolean
}

highchartsMore(Highcharts)
gauge(Highcharts)

export function riskScoreToRiskLabel(riskScore?: number): string {
  if (!isNumber(riskScore)) return ''
  if (riskScore >= 0 && riskScore <= 29) {
    return 'Low'
  }
  if (riskScore >= 30 && riskScore < 70) {
    return 'Medium'
  }

  return 'High'
}

function getOverallRisk(data: CategoryRiskCardsProps['data']): number {
  const riskValues: CategoryRisk[] = Object.values(data?.resource?.categoryRisks || [])
  if (!riskValues.length) return -1
  const maxValue = riskValues.reduce((currMax = -1, currVal) => {
    if (!isNumber(currVal?.risk)) return currMax
    return currVal.risk > currMax ? currVal.risk : currMax
  }, -1)
  return maxValue
}

function transformCategoryRiskResponse(
  data: CategoryRiskCardsProps['data']
): Array<{ categoryName: string; riskScore: number }> {
  if (!data || !data.resource || !data.resource.categoryRisks?.length) {
    return [
      { categoryName: MetricCategoryNames.PERFORMANCE, riskScore: -1 },
      { categoryName: MetricCategoryNames.ERRORS, riskScore: -1 },
      { categoryName: MetricCategoryNames.INFRASTRUCTURE, riskScore: -1 }
    ]
  }
  const { categoryRisks } = data.resource
  return categoryRisks
    .sort((categoryA, categoryB) => {
      if (categoryA?.category === MetricCategoryNames.PERFORMANCE) {
        return -1
      }
      if (categoryA?.category === MetricCategoryNames.ERRORS) {
        return categoryB?.category === MetricCategoryNames.PERFORMANCE ? 1 : -1
      }
      return 1
    })
    .map(sortedCategoryName => ({
      categoryName: sortedCategoryName.category,
      riskScore: sortedCategoryName.risk
    })) as Array<{ categoryName: string; riskScore: number }>
}

export function CategoryRiskCard(props: CategoryRiskCardProps): JSX.Element {
  const { riskScore = 0, categoryName = '', className } = props
  return (
    <Container className={cx(css.categoryRiskCard, className)} onClick={props.onClick}>
      <Container className={css.riskInfoContainer}>
        <Text color={Color.BLACK} className={css.categoryName}>
          {categoryName}
        </Text>
        <Container className={css.riskScoreContainer}>
          <RiskScoreTile riskScore={riskScore} />
          <Text className={css.riskScoreText}>{i18n.riskScoreText}</Text>
        </Container>
      </Container>
      <Container className={css.chartContainer}>
        <HighchartsReact highchart={Highcharts} options={getRiskGaugeChartOptions(riskScore)} />
      </Container>
    </Container>
  )
}

export function OverallRiskScoreCard(props: OverallRiskScoreCard): JSX.Element {
  const { className, overallRiskScore, hasConfigsSetup } = props
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const history = useHistory()
  const { getString } = useStrings()

  if (hasConfigsSetup === false) {
    return (
      <Container
        className={cx(css.overallRiskScoreCard, css.overallRiskScoreCardNoData, className)}
        background={Color.GREY_250}
      >
        <Text color={Color.BLACK} className={css.overallRiskScoreNoData}>
          {getString('cv.getRiskAssessment')}
        </Text>
        <Button
          intent="primary"
          onClick={() => {
            history.push(
              routes.toCVAdminSetup({
                accountId,
                projectIdentifier,
                orgIdentifier
              })
            )
          }}
        >
          {getString('cv.setup')}
        </Button>
      </Container>
    )
  }

  return overallRiskScore === -1 ? (
    <Container className={cx(css.overallRiskScoreCard, className)} background={Color.GREY_250}>
      <Text color={Color.BLACK} className={css.overallRiskScoreNoData}>
        {i18n.noAnalysisText}
      </Text>
    </Container>
  ) : (
    <Container
      onClick={props.onClick}
      className={cx(css.overallRiskScoreCard, className, getColorStyle(overallRiskScore, 0, 100))}
    >
      <Text color={Color.BLACK} className={css.overallRiskScoreValue}>
        {overallRiskScore}
      </Text>
      <Layout.Vertical>
        <Text font={{ weight: 'bold' }} color={Color.BLACK}>
          {i18n.overallText}
        </Text>
        <Text style={{ fontSize: 12 }} color={Color.GREY_250}>
          {i18n.riskScoreText}
        </Text>
      </Layout.Vertical>
    </Container>
  )
}

export function CategoryRiskCardsWithApi(props: CategoryRiskCardsWithApiProps): JSX.Element {
  const { environmentIdentifier, serviceIdentifier, className } = props
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const { data, error, loading } = useGetCategoryRiskMap({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId,
      envIdentifier: environmentIdentifier,
      serviceIdentifier
    }
  })

  return (
    <CategoryRiskCards
      className={className}
      data={data}
      error={error?.message}
      loading={loading}
      onCardSelect={props.onCardSelect}
    />
  )
}

export function CategoryRiskCards(props: CategoryRiskCardsProps): JSX.Element {
  const { className, data, loading, error } = props
  const overallRiskScore = useMemo(() => getOverallRisk(data), [data])
  const categoriesAndRisk = useMemo(() => transformCategoryRiskResponse(data), [data])

  if (loading) {
    return (
      <Container className={css.errorOrLoading} height={105}>
        <Icon name="steps-spinner" size={20} color={Color.GREY_250} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className={css.errorOrLoading} height={105}>
        <Icon name="error" size={20} color={Color.RED_500} />
        <Text intent="danger">{error}</Text>
      </Container>
    )
  }

  const { endTimeEpoch = -1, startTimeEpoch = -1, hasConfigsSetup } = data?.resource || {}

  return (
    <Container className={css.main}>
      <Container className={css.timeRange}>
        <Text color={Color.BLACK} font={{ weight: 'bold' }}>
          {i18n.productionRisk}
        </Text>
        {isNumber(overallRiskScore) &&
          overallRiskScore > -1 &&
          endTimeEpoch &&
          startTimeEpoch &&
          new Date(endTimeEpoch).getTime() > 0 &&
          new Date(startTimeEpoch).getTime() > 0 && (
            <Text style={{ fontSize: 12 }}>{`${i18n.evaluationPeriodText} ${moment(startTimeEpoch).format(
              'MMM D, YYYY h:mma'
            )} - ${moment(endTimeEpoch).format('h:mma')}`}</Text>
          )}
      </Container>
      <Container className={css.cardContainer}>
        {isNumber(overallRiskScore) && (
          <RiskCardTooltip disabled endTime={endTimeEpoch}>
            <OverallRiskScoreCard
              hasConfigsSetup={hasConfigsSetup}
              overallRiskScore={overallRiskScore}
              onClick={() => props?.onCardSelect?.()}
            />
          </RiskCardTooltip>
        )}
        {categoriesAndRisk.map(({ categoryName, riskScore }) => (
          <RiskCardTooltip disabled key={categoryName} category={categoryName} endTime={endTimeEpoch}>
            <CategoryRiskCard
              categoryName={categoryName || ''}
              riskScore={riskScore ?? -1}
              className={className}
              onClick={() => props?.onCardSelect?.(categoryName)}
            />
          </RiskCardTooltip>
        ))}
      </Container>
    </Container>
  )
}
