import React, { useState, useMemo, ReactNode } from 'react'
import cronstrue from 'cronstrue'
import * as Yup from 'yup'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import type { Column, CellProps, Renderer } from 'react-table'
import {
  Container,
  Text,
  Layout,
  useModalHook,
  Button,
  Icon,
  FlexExpander,
  Formik,
  FormInput,
  FormikForm
} from '@wings-software/uicore'
import { Popover, Position, Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import { useGetReportSetting, useCreateReportSetting, useDeleteReportSetting } from 'services/ce'
import routes from '@common/RouteDefinitions'
import { QlceViewFieldInputInput, ViewChartType } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import { regexName } from '@common/utils/StringUtils'
import type { CEView } from 'services/ce'

import Table from './Table'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
import { getBudgetsResponse } from './Mock'
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

interface ReportTableParams {
  uuid?: string
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

interface ReportsAndBudgetsProps {
  values: CEView
  onPrevButtonClick: () => void
}

const ReportsAndBudgets = ({ values, onPrevButtonClick }: ReportsAndBudgetsProps) => {
  const [groupBy, setGroupBy] = useState<QlceViewFieldInputInput>(() => {
    return (values?.viewVisualization?.groupBy as QlceViewFieldInputInput) || DEFAULT_GROUP_BY
  })

  const [chartType, setChartType] = useState<ViewChartType>(() => {
    return (values?.viewVisualization?.chartType as ViewChartType) || ViewChartType.StackedLineChart
  })

  const history = useHistory()
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()

  const savePerspective = () => {
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
            <Button icon="chevron-left" text="Previous" onClick={onPrevButtonClick} />
            <Button intent="primary" text="Save Perspective" onClick={() => savePerspective()} />
          </Layout.Horizontal>
        </Layout.Vertical>
        <PerspectiveBuilderPreview
          setGroupBy={(gBy: QlceViewFieldInputInput) => setGroupBy(gBy)}
          groupBy={groupBy}
          chartType={chartType}
          setChartType={(type: ViewChartType) => {
            setChartType(type)
          }}
          formValues={values}
        />
      </Container>
    </Container>
  )
}

const ScheduledReports = () => {
  const [openModal, hideModal] = useCreateReportModal()
  const { accountId, perspectiveId } = useParams<{ accountId: string; perspectiveId: string }>()
  const { data, loading } = useGetReportSetting({ accountId, queryParams: { perspectiveId } })
  const { mutate: createReport } = useCreateReportSetting({ accountId })
  // const { mutate: deleteReport } = useDeleteReportSetting({ pathParams: { accountId } }) // find out how to pass selected uuid

  const handleCreateNewReport = async () => {
    openModal()

    const sampleCron = ['30 * * * * *', '0 13 * * 1 *', '*/5 * * * * *', '0 */2 * * * *']
    const rand = ~~(Math.random() * 4)

    try {
      const response = await createReport({
        viewsId: [perspectiveId],
        name: `Bdj ${rand}`,
        userCron: sampleCron[rand],
        description: 'Hello, I am description',
        recipients: ['akash.bhardwaj@harness.io', 'yo@lo.com', 'no@email.com']
      })

      console.log('response of create report: ', response)
    } catch (e) {
      console.log('error in creating report::::: ', e)
    }
  }

  const handleEdit = (value: ReportTableParams) => {
    console.log('Edit values: ', value)
  }

  const handleDelete = (value: ReportTableParams) => {
    // deleteReport()
  }

  const columns: Column<ReportTableParams>[] = useMemo(
    () => [
      {
        Header: 'Report Name',
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
        Cell: ({ row }: CellProps<ReportTableParams>) => (
          <RenderEditDeleteActions
            onClickEdit={() => handleEdit(row.original)}
            onClickDelete={() => handleDelete(row.original)}
          />
        )
      }
    ],
    []
  )

  const reports = data?.resource || []
  return (
    <List
      title="Report Schedules"
      subTitle={`Reports can send a cost report to specified users at the specified frequency. ${
        !reports.length ? 'You have not created any yet.' : ''
      }`}
      buttonText="+ create new Report schedule"
      onButtonClick={() => handleCreateNewReport()}
      hasData={!!reports.length}
      loading={loading}
      grid={<Table<ReportTableParams> data={reports} columns={columns} />}
    />
  )
}

const Budgets = () => {
  const response = getBudgetsResponse()
  const columns: Column<BudgetTableParams>[] = useMemo(
    () => [
      {
        Header: 'Budgeted amount',
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
        Cell: ({ row }: CellProps<BudgetTableParams>) => (
          <RenderEditDeleteActions onClickEdit={() => row.original} onClickDelete={() => row.original} />
        )
      }
    ],
    []
  )

  const budgets = response?.resource || []
  return (
    <List
      title="Budget"
      subTitle="Budget can help you recieve alerts when the spend exceeds or is about to exceed a specified threshold so that it can be prevented."
      buttonText="+ create new Budget"
      onButtonClick={() => 'TEST'}
      hasData={!!budgets.length}
      loading={false}
      grid={<Table<BudgetTableParams> columns={columns} data={budgets} />}
    />
  )
}

const List = (props: ListProps) => {
  const { title, subTitle, grid, buttonText, hasData, onButtonClick, loading } = props

  const renderLoader = () => {
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

interface ReportDetailsForm {
  name: string
  viewsId: string[]
  recipients: string[]
  description: string
  frequency: string
  day: number
  time: number
}

const NameSchema = () => {
  const { getString } = useStrings()
  return Yup.string()
    .trim()
    .required(getString('common.validation.nameIsRequired'))
    .matches(regexName, getString('common.validation.namePatternIsNotValid'))
}

const useCreateReportModal = () => {
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const modalPropsLight: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    className: Classes.DIALOG,
    style: { width: 450, height: 650 }
  }

  const handleSubmit = (data: ReportDetailsForm) => {
    console.log('onSubmit: ', data)
  }

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog onClose={hideModal} {...modalPropsLight}>
      <Container padding="xlarge">
        <Layout.Vertical spacing="xlarge">
          <Container padding="small">
            <Formik<ReportDetailsForm>
              onSubmit={formData => {
                handleSubmit(formData)
              }}
              formName="createReportScheduleForm"
              // validationSchema={Yup.object().shape({
              //   name: NameSchema(),
              //   viewId: Yup.string().required(),
              //   userCron: Yup.string().required(),
              //   recipients: Yup.string().required()
              // })}
              initialValues={{
                viewsId: [perspectiveId],
                name: '',
                recipients: ['a'],
                description: '',
                frequency: 'weekly',
                day: 2,
                time: 9
              }}
            >
              {formikProps => {
                return (
                  <FormikForm>
                    <Container style={{ minHeight: 560 }}>
                      <FormInput.Text name={'name'} label={'Name'} />
                      <FormInput.Select
                        items={[
                          { label: 'Weekly', value: 'weekly' },
                          { label: 'Monthly', value: 'monthly' }
                        ]}
                        name={'frequency'}
                        label={'Add a report schedule'}
                      />
                      <FormInput.Select
                        items={[
                          { label: 'Sunday', value: 0 },
                          { label: 'Monday', value: 1 },
                          { label: 'Tuesday', value: 2 },
                          { label: 'Wednesday', value: 3 },
                          { label: 'Thursday', value: 4 },
                          { label: 'Friday', value: 5 },
                          { label: 'Saturday', value: 6 }
                        ]}
                        name={'day'}
                      />
                      <FormInput.Select
                        items={[
                          { label: '9am', value: 9 },
                          { label: '1pm', value: 13 }
                        ]}
                        name={'time'}
                      />
                    </Container>
                    <Layout.Horizontal>
                      <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={false}>
                        Save
                      </Button>
                    </Layout.Horizontal>
                  </FormikForm>
                )
              }}
            </Formik>
          </Container>
        </Layout.Vertical>
      </Container>
    </Dialog>
  ))

  return [openModal, hideModal]
}

export default ReportsAndBudgets
