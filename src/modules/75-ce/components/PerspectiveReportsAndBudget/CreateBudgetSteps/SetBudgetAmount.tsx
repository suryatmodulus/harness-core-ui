import React, { useMemo } from 'react'
import { get } from 'lodash-es'
import {
  Text,
  Container,
  StepProps,
  Layout,
  Button,
  FormInput,
  Formik,
  FormikForm,
  FontVariation,
  FlexExpander,
  DateInput,
  Color
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import Highcharts from 'highcharts/highcharts'
import { useParams } from 'react-router-dom'
import { Position } from '@blueprintjs/core'
import { Budget, useGetLastMonthCost, useGetForecastCost } from 'services/ce'
import formatCost from '@ce/utils/formatCost'
import CEChart from '@ce/components/CEChart/CEChart'
import { todayInUTC } from '@ce/utils/momentUtils'
import { useStrings } from 'framework/strings'
import type { BudgetStepData } from '../types'
import css from '../PerspectiveCreateBudget.module.scss'

interface GrowthRateChartProps {
  growthRateVal: number
  amount: number
}

const GrowthRateChart: (props: GrowthRateChartProps) => JSX.Element = ({ growthRateVal, amount }) => {
  const { getString } = useStrings()

  return (
    <Container
      background={Color.PRIMARY_1}
      padding="medium"
      margin={{
        top: 'huge'
      }}
    >
      <Text font={{ variation: FontVariation.SMALL_SEMI }} margin={{ left: 'small', bottom: 'medium' }}>
        {getString('ce.perspectives.budgets.setBudgetAmount.chartTitle', { rate: growthRateVal })}
      </Text>
      <CEChart
        options={{
          series: [
            {
              color: 'var(--primary-8)',
              data: [
                [Number(todayInUTC().startOf('month').format('x')), +amount],
                [
                  Number(todayInUTC().startOf('month').add(1, 'month').format('x')),
                  +amount * (1 + growthRateVal / 100)
                ],
                [
                  Number(todayInUTC().startOf('month').add(2, 'months').format('x')),
                  +amount * (1 + growthRateVal / 100) * (1 + growthRateVal / 100)
                ]
              ],
              name: '',
              type: 'line',
              dashStyle: 'ShortDash',
              marker: {
                enabled: false
              }
            }
          ],
          chart: {
            height: 122,
            backgroundColor: 'transparent'
          },
          yAxis: {
            tickAmount: 3,
            title: {
              text: ''
            },
            labels: {
              step: 2,
              formatter: function () {
                return `$ ${this['value']}`
              }
            }
          },
          xAxis: {
            lineWidth: 0,
            type: 'datetime',
            ordinal: true,
            labels: {
              formatter: function () {
                return Highcharts.dateFormat('%b %Y', Number(this.value))
              }
            }
          },
          legend: {
            enabled: false
          }
        }}
      />
    </Container>
  )
}

interface SetBudgetFormProps {
  formikProps: FormikProps<Form>
  isEditMode: boolean
  lastMonthCost: number | undefined
}

const SetBudgetForm: (props: SetBudgetFormProps) => JSX.Element = ({ formikProps, isEditMode, lastMonthCost }) => {
  const { getString } = useStrings()

  const BUDGET_PERIOD = useMemo(() => {
    return [{ label: getString('ce.perspectives.budgets.setBudgetAmount.budgetPeriods.monthly'), value: 'MONTHLY' }]
  }, [])

  const BUDGET_TYPE = useMemo(() => {
    return [
      { label: getString('ce.perspectives.budgets.setBudgetAmount.specifiedAmount'), value: 'SPECIFIED_AMOUNT' },
      { label: getString('ce.perspectives.budgets.setBudgetAmount.lastMonthSpend'), value: 'PREVIOUS_MONTH_SPEND' }
    ]
  }, [])

  return (
    <Container
      padding={{
        right: 'medium'
      }}
    >
      <FormInput.Select
        disabled={isEditMode}
        items={BUDGET_PERIOD}
        name={'period'}
        label={getString('ce.perspectives.budgets.setBudgetAmount.budgetPeriod')}
      />
      <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_600}>
        {getString('ce.perspectives.budgets.setBudgetAmount.monthStartsFrom')}
      </Text>
      <DateInput
        disabled={isEditMode}
        popoverProps={{
          position: Position.BOTTOM
        }}
        value={String(formikProps.values.startTime)}
        onChange={val => {
          formikProps.setValues({
            ...formikProps.values,
            startTime: Number(val)
          })
        }}
      />
      <FormInput.Select
        value={BUDGET_TYPE.find(op => op.value === formikProps.values.type)}
        items={BUDGET_TYPE}
        name={'type'}
        label={getString('ce.perspectives.budgets.setBudgetAmount.budgetType')}
        onChange={option => {
          if (option.value === 'PREVIOUS_MONTH_SPEND') {
            formikProps.setFieldValue('budgetAmount', lastMonthCost || 0)
          }
        }}
      />
      <FormInput.Text
        disabled={formikProps.values.type === 'PREVIOUS_MONTH_SPEND'}
        name={'budgetAmount'}
        label={
          formikProps.values.type === 'PREVIOUS_MONTH_SPEND'
            ? getString('ce.perspectives.budgets.setBudgetAmount.lastMonthSpend')
            : getString('ce.perspectives.budgets.setBudgetAmount.specifyAmount')
        }
      />
      <FormInput.CheckBox
        name="growthRateCheck"
        label={getString('ce.perspectives.budgets.setBudgetAmount.growthRateCheck')}
        tooltipProps={{
          dataTooltipId: 'growthRateCheckbox'
        }}
      />
      {formikProps.values.growthRateCheck ? (
        <Layout.Horizontal
          margin={{
            top: 'xlarge'
          }}
          spacing="small"
        >
          <FormInput.Text
            name={'growthRate'}
            label={getString('ce.perspectives.budgets.setBudgetAmount.growthRateLabel')}
          />
          <Text
            margin={{
              top: 'xxlarge'
            }}
          >
            %
          </Text>
        </Layout.Horizontal>
      ) : null}
    </Container>
  )
}

interface Props {
  name: string
  budget?: Budget
  isEditMode: boolean
  perspective?: string
}

interface Form {
  type: 'SPECIFIED_AMOUNT' | 'PREVIOUS_MONTH_SPEND' | 'PREVIOUS_PERIOD_SPEND'
  budgetAmount: number
  period: string
  startTime: number
  growthRate: number
  growthRateCheck: boolean
}

const SetBudgetAmount: React.FC<StepProps<BudgetStepData> & Props> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const {
    nextStep,
    prevStepData,
    previousStep,
    budget: { budgetAmount = 0, type, period, startTime, growthRate } = {},
    isEditMode
  } = props

  const { perspective } = prevStepData || {}

  const { data: lmc } = useGetLastMonthCost({
    queryParams: { accountIdentifier: accountId, perspectiveId: perspective }
  })

  const { data: fc } = useGetForecastCost({
    queryParams: { accountIdentifier: accountId, perspectiveId: perspective }
  })

  const COSTS = useMemo(
    () => [
      [getString('ce.perspectives.budgets.setBudgetAmount.lastMonthCost'), lmc?.data],
      [getString('ce.perspectives.budgets.setBudgetAmount.projectedCost'), fc?.data]
    ],
    [lmc?.data, fc?.data]
  )

  const handleSubmit = (data: Form) => {
    const nextStepData = {
      ...((prevStepData || {}) as Budget & { perspective: string }),
      type: data.type,
      budgetAmount: data.budgetAmount,
      lastMonthCost: lmc?.data,
      forecastCost: fc?.data,
      period: data.period,
      startTime: data.startTime,
      growthRate: data.growthRate
    } as BudgetStepData

    nextStep?.(nextStepData)
  }

  const renderCosts = () => {
    return (
      <div className={css.costs}>
        {COSTS.map((cost, idx) => {
          return (
            <>
              <div key={idx}>
                <Text color="grey800" margin={{ bottom: 'small' }} font={{ variation: FontVariation.SMALL }}>
                  {cost[0] || 0}
                </Text>
                <Text color="grey800" font={{ variation: FontVariation.H5 }}>
                  {formatCost((cost[1] as number) || 0)}
                </Text>
              </div>
              {idx === 0 && <div className={css.separator}></div>}
            </>
          )
        })}
      </div>
    )
  }

  return (
    <Container>
      <Formik<Form>
        onSubmit={data => {
          handleSubmit(data)
        }}
        formName="selectPerspective"
        enableReinitialize={true}
        initialValues={{
          type: type || get(prevStepData, 'type') || 'SPECIFIED_AMOUNT',
          budgetAmount: budgetAmount || get(prevStepData, 'budgetAmount') || 0,
          period: period || get(prevStepData, 'period') || 'MONTHLY',
          startTime: startTime || get(prevStepData, 'startTime') || Number(todayInUTC().startOf('month').format('x')),
          growthRate: growthRate || get(prevStepData, 'growthRate') || 0,
          growthRateCheck: !!growthRate || !!get(prevStepData, 'growthRate')
        }}
      >
        {formikProps => {
          return (
            <FormikForm className={css.selectPerspectiveContainer}>
              <Container className={css.selectPerspectiveContainer}>
                <Text font={{ variation: FontVariation.H4 }}>
                  {getString('ce.perspectives.budgets.setBudgetAmount.title')}
                </Text>

                <Container
                  margin={{
                    top: 'xxlarge'
                  }}
                  className={css.setBudgetContainer}
                >
                  <SetBudgetForm formikProps={formikProps} isEditMode={isEditMode} lastMonthCost={lmc?.data} />
                  <Container
                    padding={{
                      left: 'medium'
                    }}
                  >
                    {renderCosts()}
                    {formikProps.values.growthRateCheck ? (
                      <GrowthRateChart
                        growthRateVal={formikProps.values.growthRate}
                        amount={formikProps.values.budgetAmount}
                      />
                    ) : null}
                  </Container>
                </Container>

                <FlexExpander />
                <Layout.Horizontal spacing="medium">
                  <Button
                    text={getString('previous')}
                    icon="chevron-left"
                    onClick={() => previousStep?.(prevStepData)}
                  />
                  <Button type="submit" intent="primary" rightIcon={'chevron-right'} disabled={false}>
                    {getString('continue')}
                  </Button>
                </Layout.Horizontal>
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default SetBudgetAmount
