import { Container, Text, FontVariation, Color } from '@wings-software/uicore'
import React from 'react'
import moment from 'moment'
import type { CellProps, Renderer } from 'react-table'
import type { BudgetData, BudgetCostData } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import Grid from '@ce/components/PerspectiveGrid/Grid'
import formatCost from '@ce/utils/formatCost'

interface BudgetDetailsGridProps {
  gridData: BudgetData
}

const BudgetDetailsGrid: (props: BudgetDetailsGridProps) => JSX.Element | null = ({ gridData }) => {
  const { getString } = useStrings()

  if (!gridData) {
    return null
  }

  const costData = gridData.costData || []

  const CostCell: Renderer<CellProps<BudgetCostData>> = ({ cell }) => {
    return <Text font={{ variation: FontVariation.BODY }}>{formatCost(cell.value)}</Text>
  }

  const BudgetVarianceCell: Renderer<CellProps<BudgetCostData>> = ({ cell }) => {
    return (
      <Text
        rightIcon={cell.value > 0 ? 'caret-up' : 'caret-down'}
        rightIconProps={{
          color: cell.value > 0 ? Color.RED_600 : Color.GREEN_600
        }}
        font={{ variation: FontVariation.BODY }}
        color={cell.value > 0 ? Color.RED_600 : Color.GREEN_600}
      >
        {formatCost(cell.value)}
      </Text>
    )
  }

  const BudgetVariancePercentageCell: Renderer<CellProps<BudgetCostData>> = ({ cell }) => {
    return (
      <Text
        rightIcon={cell.value > 0 ? 'caret-up' : 'caret-down'}
        rightIconProps={{
          color: cell.value > 0 ? Color.RED_600 : Color.GREEN_600
        }}
        font={{ variation: FontVariation.BODY }}
        color={cell.value > 0 ? Color.RED_600 : Color.GREEN_600}
      >
        {`${cell.value}%`}
      </Text>
    )
  }

  const TimeCell: Renderer<CellProps<BudgetCostData>> = ({ cell }) => {
    return <Text font={{ variation: FontVariation.BODY }}>{moment.utc(cell.value).format('MMM YYYY')}</Text>
  }

  const formattedData = costData.filter(e => e?.time).sort((a, b) => b?.time - a?.time) as BudgetCostData[]

  return (
    <Container>
      <Grid<BudgetCostData>
        columns={[
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.month'),
            accessor: 'time',
            Cell: TimeCell
          },
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.actualCost'),
            accessor: 'actualCost',
            Cell: CostCell
          },
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.budgetCost'),
            accessor: 'budgeted',
            Cell: CostCell
          },
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.budgetVariance'),
            accessor: 'budgetVariance',
            Cell: BudgetVarianceCell
          },
          {
            Header: getString('ce.budgets.detailsPage.tableHeaders.budgetVariancePercentage'),
            accessor: 'budgetVariancePercentage',
            Cell: BudgetVariancePercentageCell
          }
        ]}
        data={formattedData}
      />
    </Container>
  )
}

export default BudgetDetailsGrid
