import React, { useMemo, ReactNode } from 'react'
import cronstrue from 'cronstrue'

// import { useParams } from 'react-router-dom'
import type { Column, CellProps, Renderer } from 'react-table'
import { Container, Text, Layout, Button, Icon, FlexExpander } from '@wings-software/uicore'
import { Popover, Position, Classes, PopoverInteractionKind } from '@blueprintjs/core'
// import { useGetScheduledReports } from 'services/ce'
// import { QlceViewFieldInputInput, ViewChartType, ViewFieldIdentifier } from 'services/ce/services'

import Table from './Table'
// import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
import { getScheduledReportsResponse, getBudgetsResponse } from './Mock'
import css from './PerspectiveReportsAndBudgets.module.scss'

// TODO: Where to move it? Check with Jenil
// const DEFAULT_GROUP_BY = {
//   fieldId: 'product',
//   fieldName: 'Product',
//   identifier: ViewFieldIdentifier.Common,
//   identifierName: 'Common'
// }

interface ListProps {
  title: string
  subTitle: string
  grid: ReactNode
  buttonText: string
  onButtonClick: () => void
}

interface ReportTableParams {
  name?: string
  userCron?: string
  recipients?: string[]
}

interface BudgetTableParams {
  budgetAmount?: number
  alertThresholds?: { percentage?: number }[]
  actualCost?: number
  lastMonthCost?: number
}

interface TableActionsProps {
  onClickEdit: () => void
  onClickDelete: () => void
}

const ReportsAndBudgets = () => {
  return (
    <Container className={css.mainContainer}>
      <Container className={css.innerContainer}>
        <Layout.Vertical spacing="xxlarge" height="100%" padding={{ left: 'huge', right: 'xxlarge' }}>
          <ScheduledReports />
          <Budgets />
          <FlexExpander />
          <Layout.Horizontal padding={{ top: 'medium' }} spacing="large">
            <Button icon="chevron-left" text="Previous" />
            <Button intent="primary" text="Save Perspective" />
          </Layout.Horizontal>
        </Layout.Vertical>
        {/* <PerspectiveBuilderPreview
          setGroupBy={(groupBy: QlceViewFieldInputInput) => {
            // formikProps.setFieldValue('viewVisualization.groupBy', groupBy)
            console.log('setGroupBy: ', groupBy)
          }}
          groupBy={DEFAULT_GROUP_BY}
          chartType={ViewChartType.StackedLineChart}
          setChartType={(type: ViewChartType) => {
            console.log('setChartTYpe: ', type)
          }}
        /> */}
      </Container>
    </Container>
  )
}

const ScheduledReports = () => {
  // const { accountId } = useParams<{ accountId: string }>()
  // const { data, loading, response: yeah } = useGetScheduledReports({ accountId })

  const response = getScheduledReportsResponse()
  const columns: Column<ReportTableParams>[] = useMemo(
    () => [
      {
        Header: 'Report Nameyy',
        accessor: 'name'
      },
      {
        Header: 'Frequency',
        accessor: 'userCron',
        Cell: RenderReportFrequency
      },
      {
        Header: 'Recipients',
        accessor: 'recipients',
        Cell: RenderReportRecipients
      },
      {
        id: 'edit-delete-action-column',
        Cell: ({ row }: { row: CellProps<ReportTableParams> }) => (
          <RenderEditDeleteActions onClickEdit={() => row.orginal} onClickDelete={() => row.original} />
        )
      }
    ],
    []
  )

  const reports = response?.resource || []
  return (
    <List
      title="Report Schedules"
      subTitle={`Reports can send a cost report to specified users at the specified frequency. ${
        !reports.length ? 'You have not created any yet.' : ''
      }`}
      buttonText="+ create new Report schedule"
      onButtonClick={() => 'TEST'}
      grid={<Table<ReportTableParams> data={response?.resource} columns={columns} />}
    />
  )
}

const Budgets = () => {
  const response = getBudgetsResponse()
  const columns: Column<BudgetTableParams>[] = useMemo(
    () => [
      {
        Header: 'Budgeted amounttt',
        accessor: 'budgetAmount'
      },
      {
        Header: 'Alert at',
        accessor: 'alertThresholds',
        Cell: RenderAlertThresholds
      },
      {
        Header: 'Cost till date',
        accessor: 'actualCost'
      },
      {
        Header: "Last month's spend",
        accessor: 'lastMonthCost'
      },
      {
        id: 'edit-delete-action-column',
        Cell: ({ row }: { row: CellProps<BudgetTableParams> }) => (
          <RenderEditDeleteActions onClickEdit={() => row.orginal} onClickDelete={() => row.orginal} />
        )
      }
    ],
    []
  )

  return (
    <List
      title="Budget"
      subTitle="Budget can help you recieve alerts when the spend exceeds or is about to exceed a specified threshold so that it can be prevented."
      buttonText="+ create new Budget"
      onButtonClick={() => 'TEST'}
      grid={<Table<BudgetTableParams> columns={columns} data={response?.resource} />}
    />
  )
}

const List = (props: ListProps) => {
  const { title, subTitle, grid, buttonText, onButtonClick } = props
  return (
    <Container>
      <Text color="grey800" style={{ fontSize: 16 }}>
        {title}
      </Text>
      <Text padding={{ top: 'large', bottom: 'large' }} color="grey800" font={'small'}>
        {subTitle}
      </Text>
      {grid}
      <Layout.Horizontal
        spacing="small"
        style={{
          justifyContent: 'center',
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
    </Container>
  )
}

const RenderReportFrequency: Renderer<CellProps<ReportTableParams>> = ({ row }) => {
  const cron = row.original.userCron || ''
  return <span>{cronstrue.toString(cron)}</span>
}

const RenderReportRecipients: Renderer<CellProps<ReportTableParams>> = ({ row }) => {
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

const RenderEditDeleteActions = (props: TableActionsProps) => {
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

const RenderAlertThresholds: Renderer<CellProps<BudgetTableParams>> = ({ row }) => {
  const alerts = row.original.alertThresholds || []
  const percentages = alerts.map((a: any) => a.percentage)
  return <span>{percentages.join(', ')}</span>
}

export default ReportsAndBudgets
