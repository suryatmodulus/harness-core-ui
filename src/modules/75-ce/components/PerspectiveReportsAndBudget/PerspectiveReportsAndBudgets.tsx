import React, { useState, useMemo, ReactNode } from 'react'
import cronstrue from 'cronstrue'
import { useHistory, useParams } from 'react-router-dom'
import type { Column, CellProps, Renderer } from 'react-table'
import { Button, Container, Text, Layout, Icon, FlexExpander } from '@wings-software/uicore'
import { Popover, Position, Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import routes from '@common/RouteDefinitions'
import { QlceViewFieldInputInput, ViewChartType } from 'services/ce/services'
import { CEView, useGetReportSetting } from 'services/ce'
import { useStrings } from 'framework/strings'

import Table from './Table'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
import { getBudgetsResponse } from './Mock'
import useCreateReportModal from './PerspectiveCreateReport'
import css from './PerspectiveReportsAndBudgets.module.scss'

interface ListProps {
  title: string
  subTitle: string
  grid: ReactNode
  buttonText: string
  hasData: boolean
  loading: boolean
  onButtonClick: () => void
}

export interface Report {
  uuid?: string
  name?: string
  userCron?: string
  recipients?: string[]
}

interface Budget {
  budgetAmount?: number
  alertThresholds?: { percentage?: number }[]
  actualCost?: number
  lastMonthCost?: number
}

interface TableActionsProps {
  onClickEdit: () => void
  onClickDelete: () => void
}

interface ReportsAndBudgetsProps {
  values?: CEView
  onPrevButtonClick: () => void
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
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()

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
          padding={{ left: 'large', right: 'xxlarge', bottom: 'xxlarge', top: 'xxlarge' }}
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

const useFetchReports = () => {
  const { accountId, perspectiveId } = useParams<{ accountId: string; perspectiveId: string }>()
  const { data, loading, refetch } = useGetReportSetting({ accountId, queryParams: { perspectiveId } })
  return { reports: data?.resource || [], loading, refetch }
}

const ScheduledReports: React.FC = () => {
  const { getString } = useStrings()
  const { reports, loading, refetch } = useFetchReports()
  const { openModal, hideModal } = useCreateReportModal({
    onSuccess: () => {
      hideModal()
      refetch()
    }
  })

  // const { mutate: deleteReport } = useDeleteReportSetting({ pathParams: { accountId } }) // find out how to pass selected uuid
  const handleDelete = (): void => {
    return // fix this when api is integrated
  }

  const columns: Column<Report>[] = useMemo(
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
        Cell: RenderReportRecipients
      },
      {
        id: 'edit-delete-action-column',
        Cell: ({ row }: CellProps<Report>) => (
          <RenderEditDeleteActions
            onClickEdit={() => openModal({ isEdit: true, selectedReport: row.original })}
            onClickDelete={() => handleDelete()}
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
      grid={<Table<Report> data={reports} columns={columns} />}
    />
  )
}

const Budgets = (): JSX.Element => {
  const { getString } = useStrings()
  const response = getBudgetsResponse()
  const columns: Column<Budget>[] = useMemo(
    () => [
      {
        Header: getString('ce.perspectives.budgets.amount'),
        accessor: 'budgetAmount'
      },
      {
        Header: getString('ce.perspectives.budgets.alerts'),
        accessor: 'alertThresholds',
        Cell: RenderAlertThresholds
      },
      {
        Header: getString('ce.perspectives.budgets.actualCost'),
        accessor: 'actualCost'
      },
      {
        Header: getString('ce.perspectives.budgets.lastMonthCost'),
        accessor: 'lastMonthCost'
      },
      {
        id: 'edit-delete-action-column',
        Cell: ({ row }: CellProps<Budget>) => (
          <RenderEditDeleteActions onClickEdit={() => row.original} onClickDelete={() => row.original} />
        )
      }
    ],
    []
  )

  const budgets = response?.resource || []
  return (
    <List
      title={getString('ce.perspectives.budgets.title')}
      subTitle={getString('ce.perspectives.budgets.desc')}
      buttonText={getString('ce.perspectives.budgets.createNew')}
      onButtonClick={() => 'TEST'}
      hasData={!!budgets.length}
      loading={false}
      grid={<Table<Budget> columns={columns} data={budgets} />}
    />
  )
}

const List = (props: ListProps): JSX.Element => {
  const { title, subTitle, grid, buttonText, hasData, onButtonClick, loading } = props

  const renderLoader = (): JSX.Element => {
    return (
      <Container className={css.loader}>
        <Icon name="spinner" color="blue500" size={30} />
      </Container>
    )
  }

  return (
    <Container>
      <Text color="grey800" style={{ fontSize: 16 }}>
        {title}
      </Text>
      <Text padding={{ top: 'large', bottom: 'large' }} color="grey800" font={'small'}>
        {subTitle}
      </Text>
      {loading && renderLoader()}
      {!loading && hasData && grid}
      {!loading && (
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
      )}
    </Container>
  )
}

const RenderReportFrequency: Renderer<CellProps<Report>> = ({ row }) => {
  const cron = row.original.userCron || ''
  return <span>{cronstrue.toString(cron)}</span>
}

const RenderReportRecipients: Renderer<CellProps<Report>> = ({ row }) => {
  const recipients = [...(row.original.recipients || [])]
  const email = recipients.shift()
  const remainingEmailsCount = recipients.length ? `(+${recipients.length})` : ''

  return (
    <Layout.Horizontal spacing="xsmall">
      <Text color="grey700" font="small">
        {email}
      </Text>
      {recipients.length ? (
        <Popover
          popoverClassName={Classes.DARK}
          position={Position.BOTTOM}
          interactionKind={PopoverInteractionKind.HOVER}
          content={
            <div className={css.popoverContent}>
              <ul>
                {recipients.map((em, idx) => (
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

const RenderAlertThresholds: Renderer<CellProps<Budget>> = ({ row }) => {
  const alerts = row.original.alertThresholds || []
  const percentages = alerts.map(a => a.percentage)
  return <span>{percentages.join(', ')}</span>
}

export default ReportsAndBudgets
