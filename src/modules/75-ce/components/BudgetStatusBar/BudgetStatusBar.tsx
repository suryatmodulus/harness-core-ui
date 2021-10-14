import React, { useEffect, useState } from 'react'
import { Layout, Text, FontVariation, Container, Color } from '@wings-software/uicore'
import cx from 'classnames'
import type { BudgetSummary } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import css from './BudgetStatusBar.module.scss'

const BAR_WIDTH = 266

interface BudgetStatusBarProps {
  rowData: BudgetSummary
}

const BudgetStatusBar: (props: BudgetStatusBarProps) => JSX.Element | null = ({ rowData }) => {
  const { getString } = useStrings()

  const [widthState, setWidthState] = useState({
    actualCostBarWidth: 0,
    forecastCostBarWidth: 0
  })

  const [cost, setCost] = useState({
    actualCost: 0,
    budgetAmount: 0,
    forecastCost: 0
  })

  useEffect(() => {
    const actualCost = rowData.actualCost || 0
    const budgetAmount = rowData.budgetAmount || 1
    const forecastCost = actualCost * 1.2
    const baseCost = Math.max(actualCost, forecastCost, budgetAmount)

    setCost({
      actualCost,
      budgetAmount,
      forecastCost
    })
    const actualCostBarWidth = Math.floor(BAR_WIDTH * (actualCost / baseCost))
    const forecastCostBarWidth = Math.floor(BAR_WIDTH * (forecastCost / baseCost))
    setWidthState({
      actualCostBarWidth,
      forecastCostBarWidth
    })
  }, [rowData])

  return (
    <Layout.Horizontal
      spacing="xsmall"
      padding={{
        top: 'medium'
      }}
    >
      <Text color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
        {formatCost(0)}
      </Text>
      <Container className={css.budgetBar} width={BAR_WIDTH} background={Color.GREY_200}>
        <div
          style={{
            width: widthState.actualCostBarWidth
          }}
          className={cx(css.actualCostBar, { [css.alert]: cost.forecastCost > cost.budgetAmount })}
        ></div>

        <div
          style={{
            width: widthState.forecastCostBarWidth
          }}
          className={cx(css.forecastedBar, { [css.alert]: cost.forecastCost > cost.budgetAmount })}
        ></div>
        <div
          style={{
            left: widthState.actualCostBarWidth
          }}
          className={cx(css.actualCostMarker, { [css.alert]: cost.forecastCost > cost.budgetAmount })}
        ></div>
        <Text
          font={{ variation: FontVariation.SMALL_BOLD }}
          padding={{
            right: 'xsmall',
            left: 'xsmall'
          }}
          style={{
            left: widthState.actualCostBarWidth
          }}
          className={cx(css.actualCost, { [css.left]: widthState.actualCostBarWidth > 80 })}
        >
          {formatCost(cost.actualCost)}
        </Text>

        <div
          style={{
            left: widthState.forecastCostBarWidth,
            opacity: cost.forecastCost > cost.budgetAmount ? 1 : 0
          }}
          className={css.overBudgetMarker}
        ></div>

        <Text
          font={{ variation: FontVariation.SMALL_BOLD }}
          padding={{
            right: 'xsmall',
            left: 'xsmall'
          }}
          color={Color.RED_700}
          icon="execution-warning"
          iconProps={{
            color: Color.RED_500,
            size: 14
          }}
          style={{
            left: widthState.forecastCostBarWidth,
            opacity: cost.forecastCost > cost.budgetAmount ? 1 : 0
          }}
          className={css.overBudgetText}
        >
          {getString('ce.budgets.listPage.overBudgetText', { cost: formatCost(cost.forecastCost - cost.budgetAmount) })}
        </Text>
      </Container>
      <Text
        color={cost.forecastCost > cost.budgetAmount ? Color.RED_800 : Color.GREY_400}
        font={{ variation: FontVariation.TINY }}
      >
        {formatCost(cost.forecastCost > cost.budgetAmount ? cost.forecastCost : cost.budgetAmount)}
      </Text>
    </Layout.Horizontal>
  )
}

export default BudgetStatusBar
