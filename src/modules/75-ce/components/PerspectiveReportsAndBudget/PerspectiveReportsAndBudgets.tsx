import React, { useState, useMemo, ReactNode, useEffect, useRef } from 'react'
import cronstrue from 'cronstrue'
import { isEmpty } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import type { Column, CellProps, Renderer } from 'react-table'
import { Button, Container, Text, Layout, Icon, FlexExpander } from '@wings-software/uicore'
import { Popover, Position, Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import routes from '@common/RouteDefinitions'
import { QlceViewFieldInputInput, ViewChartType } from 'services/ce/services'
import {
  CEView,
  CEReportSchedule,
  useGetReportSetting,
  useListBudgetsForPerspective,
  AlertThreshold,
  useDeleteBudget,
  useDeleteReportSetting,
  useGetLastMonthCost,
  useGetForecastCost
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
          <Budgets />
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
  return { reports: data?.resource || [], loading, refetch }
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

  const handleDelete = async (report: CEReportSchedule) => {
    try {
      const deleted = await deleteReport(accountId, { queryParams: { reportId: report?.uuid } })
      if (deleted) refetch()
    } catch (e) {
      // TODO: Error handling
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
  return { budgets: data?.resource || [], loading, refetch }
}

const Budgets = (): JSX.Element => {
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

  const budget = budgets[0] || {}
  const { budgetAmount, alertThresholds = [] } = budget

  const {
    data: lmc,
    loading: lmcLoading,
    refetch: lmcRefetch
  } = useGetLastMonthCost({
    queryParams: { accountIdentifier: accountId, perspectiveId },
    lazy: true
  })

  const {
    data: fc,
    loading: fcLoading,
    refetch: fcRefetch
  } = useGetForecastCost({
    queryParams: { accountIdentifier: accountId, perspectiveId },
    lazy: true
  })

  useDidMountEffect(() => {
    if (isEmpty(budgets[0])) {
      lmcRefetch()
      fcRefetch()
    }
  }, [loading])

  const handleDeleteBudget = async () => {
    try {
      const deleted = await (budget?.uuid && deleteBudget(budget.uuid))
      if (deleted) refetch()
    } catch (e) {
      // TODO: Error handling
    }
  }

  const columns: Column<AlertThreshold>[] = useMemo(
    () => [
      {
        Header: getString('ce.perspectives.budgets.configureAlerts.basedOn'),
        accessor: 'basedOn',
        Cell: RenderBasedOn
      },
      {
        Header: getString('ce.perspectives.budgets.configureAlerts.percent'),
        accessor: 'percentage',
        Cell: RenderAlertThresholds
      },
      {
        Header: getString('ce.perspectives.reports.recipientLabel'),
        accessor: 'emailAddresses',
        Cell: ({ row }: CellProps<AlertThreshold>) => {
          const emailAddresses = [...(row.original.emailAddresses || [])]
          return <RenderEmailAddresses emailAddresses={emailAddresses} />
        }
      }
    ],
    []
  )

  const renderMeta = () => {
    return (
      <Container>
        <Text inline color="grey800" margin={{ right: 'small' }}>
          {getString('ce.perspectives.budgets.configureAlerts.budgetAmount')}
        </Text>
        <Text inline color="grey800" font={{ weight: 'bold', size: 'normal' }}>
          {formatCost(+(budgetAmount || 0))}
        </Text>
      </Container>
    )
  }

  const renderGrid = () => {
    return (
      <Container>
        <Layout.Horizontal
          margin={{ top: 'large', bottom: 'medium' }}
          spacing="small"
          style={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text font="small" color="grey800">
            {getString('ce.perspectives.budgets.sendAlerts')}
          </Text>
          <Container margin={{ right: 'large' }}>
            <RenderEditDeleteActions
              onClickEdit={() => openModal({ isEdit: true, selectedBudget: budget })}
              onClickDelete={handleDeleteBudget}
            />
          </Container>
        </Layout.Horizontal>
        <Table<AlertThreshold> columns={columns} data={alertThresholds || []} />
      </Container>
    )
  }

  return (
    <List
      title={getString('ce.perspectives.budgets.title')}
      subTitle={getString('ce.perspectives.budgets.desc')}
      buttonText={getString('ce.perspectives.budgets.createNew')}
      onButtonClick={() =>
        openModal({
          isEdit: false,
          selectedBudget: {
            lastMonthCost: lmc?.resource,
            forecastCost: fc?.resource
          }
        })
      }
      hasData={!isEmpty(budget)}
      loading={loading || lmcLoading || fcLoading}
      // Show create budget button only when there's no exisiting budget.
      // A user can create only 1 budget at a time. To create a new, they
      // have to delete the existing one, or just edit it.
      showCreateButton={isEmpty(budget)}
      meta={renderMeta()}
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

const RenderBasedOn: Renderer<CellProps<AlertThreshold>> = ({ row }) => {
  const { getString } = useStrings()
  const basedOn = row.original.basedOn!
  const map: Record<string, string> = useMemo(
    () => ({
      ACTUAL_COST: getString('ce.perspectives.budgets.actualSpend'),
      FORECASTED_COST: getString('ce.perspectives.budgets.forecastedCost')
    }),
    []
  )

  return <span>{map[basedOn]}</span>
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

const RenderAlertThresholds: Renderer<CellProps<AlertThreshold>> = ({ row }) => {
  const percentage = row.original.percentage
  return <span>{percentage}%</span>
}

const useDidMountEffect = (func: () => void, deps: any[]) => {
  const didMount = useRef(false)

  useEffect(() => {
    if (didMount.current) func()
    else didMount.current = true
  }, deps)
}

export default ReportsAndBudgets
