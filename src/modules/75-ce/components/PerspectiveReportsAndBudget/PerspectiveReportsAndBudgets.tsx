import React, { useState, useMemo, ReactNode, useEffect } from 'react'
import cronstrue from 'cronstrue'
import { isEmpty } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import type { Column, CellProps, Renderer } from 'react-table'
import { Button, Container, Text, Layout, Icon, FlexExpander, useToaster, Color } from '@wings-software/uicore'
import { Popover, Position, Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import routes from '@common/RouteDefinitions'
import { QlceViewFieldInputInput, ViewChartType, AlertThreshold } from 'services/ce/services'
import {
  CEView,
  CEReportSchedule,
  useGetReportSetting,
  useListBudgetsForPerspective,
  useDeleteBudget,
  useDeleteReportSetting,
  Budget
} from 'services/ce'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'

import Table from './Table'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
import useCreateReportModal from './PerspectiveCreateReport'
import useBudgetModal from './PerspectiveCreateBudget'
import css from './PerspectiveReportsAndBudgets.module.scss'

interface ListProps {
  title: string
  subTitle: string
  grid: ReactNode
  buttonText: string
  hasData: boolean
  loading: boolean
  meta?: ReactNode
  showCreateButton?: boolean
  onButtonClick: () => void
}

interface TableActionsProps {
  onClickEdit: () => void
  onClickDelete: () => void
}

interface ReportsAndBudgetsProps {
  values?: CEView
  onPrevButtonClick: () => void
}

export interface UrlParams {
  perspectiveId: string
  accountId: string
}

const ReportsAndBudgets: React.FC<ReportsAndBudgetsProps> = ({ values, onPrevButtonClick }) => {
  const [groupBy, setGroupBy] = useState<QlceViewFieldInputInput>(() => {
    return (values?.viewVisualization?.groupBy as QlceViewFieldInputInput) || DEFAULT_GROUP_BY
  })

  useEffect(() => {
    values?.viewVisualization?.groupBy && setGroupBy(values?.viewVisualization?.groupBy as QlceViewFieldInputInput)
  }, [values?.viewVisualization?.groupBy])

  const [chartType, setChartType] = useState<ViewChartType>(() => {
    return (values?.viewVisualization?.chartType as ViewChartType) || ViewChartType.StackedLineChart
  })

  const history = useHistory()
  const { getString } = useStrings()
  const { perspectiveId, accountId } = useParams<UrlParams>()

  const savePerspective = (): void => {
    history.push(
      routes.toPerspectiveDetails({
        accountId,
        perspectiveId,
        perspectiveName: perspectiveId
      })
    )
  }

  return (
    <Container className={css.mainContainer}>
      <Container className={css.innerContainer}>
        <Layout.Vertical
          spacing="xxlarge"
          height="100%"
          padding={{
            left: 'large',
            right: 'xxlarge',
            bottom: 'xxlarge',
            top: 'xxlarge'
          }}
          style={{ overflowY: 'auto' }}
        >
          <ScheduledReports />
          <Budgets perspectiveName={values?.name || ''} />
          <FlexExpander />
          <Layout.Horizontal padding={{ top: 'medium' }} spacing="large">
            <Button icon="chevron-left" text={getString('previous')} onClick={onPrevButtonClick} />
            <Button intent="primary" text={getString('ce.perspectives.save')} onClick={() => savePerspective()} />
          </Layout.Horizontal>
        </Layout.Vertical>
        {values && (
          <PerspectiveBuilderPreview
            setGroupBy={(gBy: QlceViewFieldInputInput) => setGroupBy(gBy)}
            groupBy={groupBy}
            chartType={chartType}
            setChartType={(type: ViewChartType) => {
              setChartType(type)
            }}
            formValues={values}
          />
        )}
      </Container>
    </Container>
  )
}

const useFetchReports = (accountId: string, perspectiveId: string) => {
  const { data, loading, refetch } = useGetReportSetting({
    accountIdentifier: accountId,
    queryParams: { perspectiveId }
  })
  return { reports: data?.data || [], loading, refetch }
}

const ScheduledReports: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, perspectiveId } = useParams<UrlParams>()
  const { reports, loading, refetch } = useFetchReports(accountId, perspectiveId)
  const { mutate: deleteReport } = useDeleteReportSetting({})
  const { openModal, hideModal } = useCreateReportModal({
    onSuccess: () => {
      hideModal()
      refetch()
    }
  })
  const { showSuccess, showError } = useToaster()

  const handleDelete = async (report: CEReportSchedule) => {
    try {
      const deleted = await deleteReport(accountId, {
        queryParams: { reportId: report?.uuid },
        headers: {
          'content-type': 'application/json'
        }
      })
      if (deleted) {
        showSuccess(
          getString('ce.perspectives.reports.reportDeletedTxt', {
            name: report.name
          })
        )
        refetch()
      }
    } catch (err) {
      showError(err?.data?.message || err?.message)
    }
  }

  const columns: Column<CEReportSchedule>[] = useMemo(
    () => [
      {
        Header: getString('ce.perspectives.reports.reportName'),
        accessor: 'name'
      },
      {
        Header: getString('ce.perspectives.reports.frequency'),
        accessor: 'userCron',
        Cell: RenderReportFrequency
      },
      {
        Header: getString('ce.perspectives.reports.recipients'),
        accessor: 'recipients',
        Cell: ({ row }: CellProps<CEReportSchedule>) => {
          const recipients = [...(row.original.recipients || [])]
          return <RenderEmailAddresses emailAddresses={recipients} />
        }
      },
      {
        id: 'edit-delete-action-column',
        Cell: ({ row }: CellProps<CEReportSchedule>) => (
          <RenderEditDeleteActions
            onClickEdit={() => openModal({ isEdit: true, selectedReport: row.original })}
            onClickDelete={() => handleDelete(row.original)}
          />
        )
      }
    ],
    []
  )

  return (
    <List
      title={getString('ce.perspectives.reports.title')}
      subTitle={`${getString('ce.perspectives.reports.desc')} ${
        !reports.length ? getString('ce.perspectives.reports.msg') : ''
      }`}
      buttonText={getString('ce.perspectives.reports.createNew')}
      onButtonClick={() => openModal()}
      hasData={!!reports.length}
      loading={loading}
      grid={<Table<CEReportSchedule> data={reports} columns={columns} />}
      showCreateButton
    />
  )
}

const useFetchBudget = (accountId: string, perspectiveId: string) => {
  const { data, loading, refetch } = useListBudgetsForPerspective({
    queryParams: { accountIdentifier: accountId, perspectiveId: perspectiveId }
  })
  return { budgets: data?.data || [], loading, refetch }
}

const Budgets = ({ perspectiveName }: { perspectiveName: string }): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, perspectiveId } = useParams<UrlParams>()
  const { mutate: deleteBudget } = useDeleteBudget({ queryParams: { accountIdentifier: accountId } })
  const { budgets, loading, refetch } = useFetchBudget(accountId, perspectiveId)
  const { openModal, hideModal } = useBudgetModal({
    onSuccess: () => {
      hideModal()
      refetch()
    }
  })
  const { showSuccess, showError } = useToaster()

  const budget = budgets[0] || {}

  const handleDeleteBudget: (id?: string, name?: string) => void = async (id, name) => {
    try {
      const deleted = await (id &&
        deleteBudget(id, {
          headers: {
            'content-type': 'application/json'
          }
        }))
      if (deleted) {
        showSuccess(
          getString('ce.budgets.budgetDeletedTxt', {
            name: name
          })
        )
        refetch()
      }
    } catch (err) {
      showError(err?.data?.message || err?.message)
    }
  }

  const EditDeleteCell: Renderer<CellProps<Budget>> = ({ row }) => {
    const originalData = row.original
    return (
      <RenderEditDeleteActions
        onClickEdit={() =>
          openModal({
            perspectiveName: perspectiveName,
            perspective: perspectiveId,
            isEdit: true,
            selectedBudget: originalData
          })
        }
        onClickDelete={() => handleDeleteBudget(originalData.uuid, originalData.name)}
      />
    )
  }

  const columns: Column<Budget>[] = useMemo(
    () => [
      {
        Header: 'Budgeted amount',
        accessor: 'budgetAmount',
        Cell: CostCell
      },
      {
        Header: 'Alert at',
        accessor: 'alertThresholds',
        Cell: AlertsAtCell
      },
      {
        Header: 'Cost till date',
        accessor: 'actualCost',
        Cell: CostCell
      },
      {
        Header: 'Last period spend',
        accessor: 'lastMonthCost',
        Cell: CostCell
      },
      {
        Header: ' ',
        Cell: EditDeleteCell
      }
    ],
    []
  )

  const renderGrid = () => {
    return <Table<Budget> columns={columns} data={budgets || []} />
  }

  return (
    <List
      title={getString('ce.perspectives.budgets.title')}
      subTitle={getString('ce.perspectives.budgets.desc')}
      buttonText={getString('ce.perspectives.budgets.createNew')}
      onButtonClick={() =>
        openModal({
          isEdit: false,
          perspectiveName: perspectiveName,
          perspective: perspectiveId,
          selectedBudget: {}
        })
      }
      hasData={!isEmpty(budget)}
      loading={loading}
      // Show create budget button only when there's no exisiting budget.
      // A user can create only 1 budget at a time. To create a new, they
      // have to delete the existing one, or just edit it.
      showCreateButton={isEmpty(budget)}
      // meta={renderMeta()}
      grid={renderGrid()}
    />
  )
}

const List = (props: ListProps): JSX.Element => {
  const { title, subTitle, grid, buttonText, hasData, onButtonClick, loading, meta, showCreateButton } = props

  const renderLoader = (): JSX.Element => {
    return (
      <Container className={css.loader}>
        <Icon name="spinner" color="blue500" size={30} />
      </Container>
    )
  }

  const renderCreateNewButton = () => {
    return (
      <Layout.Horizontal
        spacing="small"
        style={{
          justifyContent: hasData ? 'flex-end' : 'center',
          alignItems: 'center'
        }}
      >
        <Button
          type="submit"
          withoutBoxShadow={true}
          className={css.createBtn}
          text={buttonText}
          onClick={onButtonClick}
        />
      </Layout.Horizontal>
    )
  }

  return (
    <Container>
      <Text color="grey800" style={{ fontSize: 16 }}>
        {title}
      </Text>
      <Text padding={{ top: 'large', bottom: 'large' }} color="grey800" font="small">
        {subTitle}
      </Text>
      {loading && renderLoader()}
      {!loading && hasData && (
        <>
          {meta}
          {grid}
        </>
      )}
      {!loading && showCreateButton && renderCreateNewButton()}
    </Container>
  )
}

const RenderReportFrequency: Renderer<CellProps<CEReportSchedule>> = ({ row }) => {
  const cron = row.original.userCron || ''
  return <span>{cronstrue.toString(cron)}</span>
}

const RenderEmailAddresses = ({ emailAddresses = [] }: { emailAddresses: string[] }) => {
  const email = emailAddresses.shift()
  const remainingEmailsCount = emailAddresses.length ? `(+${emailAddresses.length})` : ''

  return (
    <Layout.Horizontal spacing="xsmall">
      <Text color="grey700" font="small">
        {email}
      </Text>
      {emailAddresses.length ? (
        <Popover
          popoverClassName={Classes.DARK}
          position={Position.BOTTOM}
          interactionKind={PopoverInteractionKind.HOVER}
          content={
            <div className={css.popoverContent}>
              <ul>
                {emailAddresses.map((em, idx) => (
                  <li key={idx}>{em}</li>
                ))}
              </ul>
            </div>
          }
        >
          <Text color="primary7" font="small">
            {remainingEmailsCount}
          </Text>
        </Popover>
      ) : null}
    </Layout.Horizontal>
  )
}

const RenderEditDeleteActions = (props: TableActionsProps): JSX.Element => {
  const { onClickEdit, onClickDelete } = props
  return (
    <Layout.Horizontal
      spacing="medium"
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Icon size={14} name={'Edit'} color="primary7" onClick={onClickEdit} className={css.icon} />
      <Icon size={14} name={'trash'} color="primary7" onClick={onClickDelete} className={css.icon} />
    </Layout.Horizontal>
  )
}

const CostCell: Renderer<CellProps<Budget>> = cell => {
  return cell.value || cell.value === 0 ? <Text color={Color.GREY_800}>{formatCost(cell.value)}</Text> : null
}

const AlertsAtCell: Renderer<CellProps<Budget>> = cell => {
  const alertString = cell.value?.length ? cell.value.map((al: AlertThreshold) => `${al.percentage}%`).join(', ') : '-'
  return <Text lineClamp={1}>{alertString}</Text>
}

export default ReportsAndBudgets
