import React from 'react'
import { Layout, Card, Text, Container, FlexExpander, Icon, FontVariation, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { PerspectiveTrendStats, Maybe, useFetchPerspectiveBudgetQuery } from 'services/ce/services'
import useBudgetModal from '@ce/components/PerspectiveReportsAndBudget/PerspectiveCreateBudget'
import formatCost from '@ce/utils/formatCost'
import { useGetLastMonthCost, useGetForecastCost } from 'services/ce'

import css from './PerspectiveSummary.module.scss'

const StatsTrendRenderer: React.FC<{ val: number }> = ({ val }) => {
  if (+val === 0) {
    return null
  }
  if (val < 0) {
    return (
      <Text
        iconProps={{
          color: 'green500'
        }}
        icon="caret-down"
        color="green500"
      >
        {`${val * -1}%`}
      </Text>
    )
  }
  return (
    <Text
      iconProps={{
        color: 'red500'
      }}
      icon="caret-up"
      color="red500"
    >
      {`${val}%`}
    </Text>
  )
}

interface CostCardProps {
  fetching: boolean
  statsLabel: string | undefined
  statsValue: string | undefined
  statsTrend: any
  statsDescription: string | undefined
  isEmpty: boolean
}

const CostCard: (val: CostCardProps) => JSX.Element = ({
  fetching,
  statsLabel,
  statsValue,
  statsTrend,
  statsDescription,
  isEmpty
}) => {
  if (fetching) {
    return (
      <Card elevation={1} interactive={false}>
        <Container className={cx(css.mainCard, css.loadingContainer)}>
          <Icon name="spinner" color="blue500" size={30} />
        </Container>
      </Card>
    )
  }

  return (
    <Card elevation={1} interactive={false}>
      <Container className={css.mainCard}>
        {!isEmpty ? (
          <>
            <Text color="grey500" font="small">
              {statsLabel}
            </Text>
            <Layout.Horizontal
              style={{
                alignItems: 'center'
              }}
              margin={{
                top: 'small',
                bottom: 'small'
              }}
            >
              <Text color="black" font="medium">
                {statsValue}
              </Text>
              <FlexExpander />
              <StatsTrendRenderer val={statsTrend} />
            </Layout.Horizontal>

            <Text color="grey400" font="xsmall">
              {statsDescription}
            </Text>
          </>
        ) : null}
      </Container>
    </Card>
  )
}

const BudgetCard: () => JSX.Element | null = () => {
  const { perspectiveId, accountId } = useParams<{
    perspectiveId: string
    accountId: string
  }>()

  const { getString } = useStrings()

  const [{ data, fetching: budgetFetching }, refetchBudget] = useFetchPerspectiveBudgetQuery({
    variables: {
      perspectiveId: perspectiveId
    }
  })

  const budgetData = data?.budgetSummary

  const { openModal, hideModal } = useBudgetModal({
    onSuccess: () => {
      hideModal()
      refetchBudget({
        requestPolicy: 'cache-and-network'
      })
    }
  })

  const { data: lmc } = useGetLastMonthCost({
    queryParams: { accountIdentifier: accountId, perspectiveId }
  })

  const { data: fc } = useGetForecastCost({
    queryParams: { accountIdentifier: accountId, perspectiveId }
  })

  if (budgetFetching) {
    return (
      <Card elevation={1} interactive={false}>
        <Container className={cx(css.mainCard, css.budgetCard, { [css.loadingContainer]: budgetFetching })}>
          <Icon name="spinner" color="blue500" size={30} />
        </Container>
      </Card>
    )
  }

  const { actualCost, budgetAmount } = budgetData || {}

  if (!budgetData || !actualCost || !budgetAmount) {
    return (
      <Card elevation={1} interactive={false}>
        <Container className={cx(css.mainCard, css.budgetCard)}>
          <Text color="grey800" font="small">
            {getString('ce.perspectives.budgets.title')}
          </Text>
          <Text
            margin={{
              top: 'small',
              bottom: 'small'
            }}
            color="black"
            font={{ weight: 'semi-bold', size: 'medium' }}
          >
            {'$---'}
          </Text>
          <Text
            className={css.addBudgetText}
            color="primary7"
            font="small"
            onClick={() => {
              openModal({
                isEdit: false,
                selectedBudget: {
                  lastMonthCost: lmc?.resource,
                  forecastCost: fc?.resource
                }
              })
            }}
          >
            {getString('ce.perspectives.budgets.addBudget')}
          </Text>
        </Container>
      </Card>
    )
  }

  const percentage = Math.round((actualCost * 100) / (budgetAmount || 1))

  let width = 262

  if (percentage > 100) {
    width = 262 * (budgetAmount / actualCost)
  }

  let intentColor = Color.GREEN_500
  if (percentage > 50) {
    intentColor = Color.ORANGE_500
  }
  if (percentage > 90) {
    intentColor = Color.RED_500
  }

  return (
    <Card elevation={1} interactive={false}>
      <Container className={cx(css.mainCard, css.budgetCard)}>
        <Text color="grey500" font="small">
          {getString('ce.perspectives.budgets.budgetMonthlyTxt')}
        </Text>
        <Layout.Horizontal
          margin={{
            top: 'small',
            bottom: 'small'
          }}
          spacing="xsmall"
          style={{
            alignItems: 'flex-end'
          }}
        >
          <Text font="medium" color="black">
            {formatCost(budgetAmount)}
          </Text>
          <Text className={css.thisMonthText} color="grey400" font="xsmall">
            {getString('ce.perspectives.budgets.thisMonth')}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="xsmall">
          {percentage > 100 ? (
            <>
              <Text className={css.spendText} color="grey500" font={{ variation: FontVariation.TINY }}>
                {getString('ce.perspectives.budgets.spendExceededBy')}
              </Text>
              <Text color="red500" font={{ variation: FontVariation.TINY_SEMI }}>
                {formatCost(actualCost - budgetAmount)}
              </Text>
            </>
          ) : (
            <>
              <Text className={css.spendText} color="grey500" font={{ variation: FontVariation.TINY }}>
                {getString('ce.perspectives.budgets.monthToDateSpend')}
              </Text>
              <Text color="grey500" font={{ variation: FontVariation.TINY_SEMI }}>{`${percentage}%`}</Text>
              <Text color="grey500" font={{ variation: FontVariation.TINY }}>
                {getString('ce.perspectives.budgets.budgetSmallTxt')}
              </Text>
            </>
          )}
        </Layout.Horizontal>
        <div className={cx(css.indicatorBar, css.indicatorBarWithPattern)}></div>
        <Container width={width} background={intentColor} className={css.indicatorBar}></Container>
      </Container>
    </Card>
  )
}

interface PerspectiveSummaryProps {
  fetching: boolean
  data: Maybe<PerspectiveTrendStats> | undefined
  forecastedCostData: Maybe<PerspectiveTrendStats> | undefined
  errors?: any[] | null
  isDefaultPerspective: boolean
}

const PerspectiveSummary: React.FC<PerspectiveSummaryProps> = ({
  fetching,
  data,
  forecastedCostData,
  isDefaultPerspective
}) => {
  return (
    <Layout.Horizontal margin="xlarge" spacing="large">
      <CostCard
        fetching={fetching}
        statsLabel={data?.cost?.statsLabel}
        statsDescription={data?.cost?.statsDescription}
        statsTrend={data?.cost?.statsTrend}
        statsValue={data?.cost?.statsValue}
        isEmpty={!data?.cost}
      />
      {!isDefaultPerspective && <BudgetCard />}
      <CostCard
        fetching={fetching}
        statsLabel={forecastedCostData?.cost?.statsLabel}
        statsDescription={forecastedCostData?.cost?.statsDescription}
        statsTrend={forecastedCostData?.cost?.statsTrend}
        statsValue={forecastedCostData?.cost?.statsValue}
        isEmpty={!forecastedCostData?.cost}
      />
    </Layout.Horizontal>
  )
}

export default PerspectiveSummary
