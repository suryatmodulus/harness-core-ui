import React, { useState } from 'react'
import {
  Button,
  FlexExpander,
  ExpandingSearchInput,
  Layout,
  Text,
  FontVariation,
  Container,
  Color,
  Popover,
  TableV2
} from '@wings-software/uicore'
import { Classes, Menu, MenuItem, Position } from '@blueprintjs/core'
import type { CellProps, Renderer } from 'react-table'
import { useParams, useHistory } from 'react-router-dom'
import { Page } from '@common/exports'
import { useFetchBudgetQuery, BudgetSummary } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import { useDeleteBudget } from 'services/ce'
import { PageSpinner } from '@common/components'
import routes from '@common/RouteDefinitions'
import formatCost from '@ce/utils/formatCost'
import BudgetStatusBar from '@ce/components/BudgetStatusBar/BudgetStatusBar'
import useBudgetModal from '@ce/components/PerspectiveReportsAndBudget/PerspectiveCreateBudget'
import css from './Budgets.module.scss'

interface BudgetMenuProps {
  onEdit: () => void
  onDelete: () => void
}

const BudgetMenu: (props: BudgetMenuProps) => JSX.Element = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Popover
      isOpen={isOpen}
      onInteraction={nextOpenState => {
        setIsOpen(nextOpenState)
      }}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
    >
      <Button
        minimal
        icon="Options"
        onClick={e => {
          e.stopPropagation()
          setIsOpen(true)
        }}
      />
      <Menu>
        <MenuItem
          text="Edit"
          onClick={(e: any) => {
            e.stopPropagation()
            setIsOpen(false)
            onEdit()
          }}
        />
        <MenuItem
          text="Delete"
          onClick={(e: any) => {
            e.stopPropagation()
            setIsOpen(false)
            onDelete()
          }}
        />
      </Menu>
    </Popover>
  )
}

interface BudgetsListProps {
  budgetData: BudgetSummary[]
  handleDeleteBudget: (id: string) => void
  handleEditBudget: (budget: BudgetSummary) => void
  navigateToBudgetDetailsPage: (id: string, name: string) => void
}

const BudgetsList: (props: BudgetsListProps) => JSX.Element | null = ({
  budgetData,
  handleDeleteBudget,
  handleEditBudget,
  navigateToBudgetDetailsPage
}) => {
  const { getString } = useStrings()

  const BudgetStatusCell: Renderer<CellProps<BudgetSummary>> = ({ row }) => {
    return <BudgetStatusBar rowData={row.original} />
  }

  const CostCell: Renderer<CellProps<BudgetSummary>> = cell => {
    return cell.value ? (
      <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_800}>
        {formatCost(cell.value)}
      </Text>
    ) : null
  }

  const NameCell: Renderer<CellProps<BudgetSummary>> = ({ row }) => {
    const rowData = row.original
    return (
      <Layout.Vertical>
        <Text color={Color.BLACK}>{rowData.name}</Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {getString('ce.budgets.listPage.timePeriodRemaining', {
            scope: rowData.timeScope,
            remaining: rowData.timeLeft,
            unit: rowData.timeUnit
          })}
        </Text>
      </Layout.Vertical>
    )
  }

  const AlertCell: Renderer<CellProps<BudgetSummary>> = ({ row }) => {
    const mtdAlerts = (row.original.actualCostAlerts || []).map(e => `${e}%`)
    const forecastAlerts = (row.original.forecastCostAlerts || []).map(e => `${e}%`)
    return (
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {getString('ce.budgets.listPage.mtdAlert', {
            alert: mtdAlerts.length ? mtdAlerts.join(', ') : '-'
          })}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {getString('ce.budgets.listPage.forecastAlert', {
            alert: forecastAlerts.length ? forecastAlerts.join(', ') : '-'
          })}
        </Text>
      </Layout.Vertical>
    )
  }

  const MenuCell: Renderer<CellProps<BudgetSummary>> = ({ row }) => {
    const budgetId = row.original.id
    const budget = row.original

    const onDelete: () => void = () => {
      budgetId && handleDeleteBudget(budgetId)
    }

    const onEdit: () => void = () => {
      budgetId && handleEditBudget(budget)
    }

    return <BudgetMenu onDelete={onDelete} onEdit={onEdit} />
  }

  if (!budgetData.length) {
    return null
  }

  return (
    <TableV2<BudgetSummary>
      data={budgetData}
      onRowClick={row => {
        navigateToBudgetDetailsPage(row.id, row.name)
      }}
      columns={[
        {
          accessor: 'name',
          Header: getString('ce.budgets.listPage.tableHeaders.name'),
          width: '25%',
          Cell: NameCell
        },
        {
          accessor: 'budgetAmount',
          Header: getString('ce.budgets.listPage.tableHeaders.budgetAmount'),
          width: '20%',
          Cell: CostCell
        },
        {
          Header: getString('ce.budgets.listPage.tableHeaders.monthToDate'),
          width: '35%',
          Cell: BudgetStatusCell
        },
        {
          Header: getString('ce.budgets.listPage.tableHeaders.alerts'),
          width: '15%',
          Cell: AlertCell
        },
        {
          Header: ' ',
          width: '5%',
          Cell: MenuCell
        }
      ]}
    />
  )
}

const Budgets: () => JSX.Element = () => {
  const history = useHistory()
  const { getString } = useStrings()
  const [{ data, fetching }, refetchBudget] = useFetchBudgetQuery()
  const [searchParam, setSearchParam] = useState<string>('')
  const { accountId } = useParams<{ accountId: string }>()
  const { openModal, hideModal } = useBudgetModal({
    onSuccess: () => {
      hideModal()
      refetchBudget({
        requestPolicy: 'network-only'
      })
    }
  })

  const { mutate: deleteBudget, loading } = useDeleteBudget({ queryParams: { accountIdentifier: accountId } })

  const handleDeleteBudget: (id: string) => void = async id => {
    try {
      await deleteBudget(id)
      refetchBudget({
        requestPolicy: 'network-only'
      })
    } catch (e) {
      // Catch errors here
    }
  }

  const handleEditBudget: (budget: BudgetSummary) => void = budget => {
    openModal({
      isEdit: true,
      perspective: budget.perspectiveId,
      selectedBudget: budget
    })
  }

  const navigateToBudgetDetailsPage: (budgetId: string, budgetName: string) => void = (budgetId, budgetName) => {
    history.push(
      routes.toCEBudgetDetails({
        accountId,
        budgetName,
        budgetId
      })
    )
  }

  const budgetData = (data?.budgetList || []) as unknown as BudgetSummary[]

  const filteredBudgetData = budgetData.filter(budget => {
    if (!budget.name) {
      return false
    }
    return budget.name?.toLocaleLowerCase().indexOf(searchParam.toLowerCase()) < 0 ? false : true
  })

  return (
    <>
      <Page.Header title={getString('ce.budgets.listPage.title')} />
      <Page.Body>
        {loading || fetching ? <PageSpinner /> : null}
        <Layout.Horizontal
          padding={{
            left: 'large',
            right: 'large',
            top: 'medium',
            bottom: 'medium'
          }}
          background="white"
        >
          <Button
            intent="primary"
            text={getString('ce.budgets.listPage.newBudget')}
            iconProps={{
              size: 10
            }}
            onClick={() =>
              openModal({
                isEdit: false,
                selectedBudget: {
                  lastMonthCost: 0,
                  forecastCost: 0
                }
              })
            }
            icon="plus"
          />
          <FlexExpander />
          <ExpandingSearchInput
            className={css.search}
            onChange={text => {
              setSearchParam(text.trim())
            }}
            placeholder={getString('ce.budgets.listPage.searchText')}
          />
        </Layout.Horizontal>

        <Layout.Horizontal padding="large">
          <Text font={{ variation: FontVariation.H5 }}>
            {getString('ce.budgets.listPage.budgetCount', {
              count: filteredBudgetData?.length
            })}
          </Text>
        </Layout.Horizontal>
        <Container padding="large">
          <BudgetsList
            navigateToBudgetDetailsPage={navigateToBudgetDetailsPage}
            handleDeleteBudget={handleDeleteBudget}
            handleEditBudget={handleEditBudget}
            budgetData={filteredBudgetData}
          />
        </Container>
      </Page.Body>
    </>
  )
}

export default Budgets
