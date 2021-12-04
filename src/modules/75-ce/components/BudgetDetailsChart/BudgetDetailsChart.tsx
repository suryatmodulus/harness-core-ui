import React from 'react'
import type { SeriesColumnOptions, SeriesLineOptions } from 'highcharts/highcharts'
import { Container } from '@wings-software/uicore'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import { CCM_CHART_TYPES } from '@ce/constants'
import { BudgetData, BudgetCostData, BudgetPeriod } from 'services/ce/services'
import CEChart from '../CEChart/CEChart'

const computeCategories: (chartData: BudgetCostData[], budgetPeriod: BudgetPeriod) => string[] = (
  chartData,
  budgetPeriod
) => {
  if (budgetPeriod === BudgetPeriod.Monthly) {
    const cat = chartData.map(item => {
      const startTime = moment.utc(item.time)
      const endTime = moment.utc(item.endTime)
      let rangeTxt = ''

      if (startTime.get('month') === startTime.get('month')) {
        rangeTxt = startTime.format('MMM YYYY')
      } else {
        rangeTxt = `${startTime.format('D MMM YYYY')} - ${endTime.format('D MMM YYYY')}`
      }

      return rangeTxt
    })
    return cat
  }

  if (budgetPeriod === BudgetPeriod.Quarterly || budgetPeriod === BudgetPeriod.Yearly) {
    const cat = chartData.map(item => {
      const startTime = moment.utc(item.time)
      const endTime = moment.utc(item.endTime)
      const rangeTxt = `${startTime.format('MMM YYYY')} - ${endTime.format('MMM YYYY')}`
      return rangeTxt
    })
    return cat
  }

  if (budgetPeriod === BudgetPeriod.Weekly) {
    const cat = chartData.map(item => {
      const startTime = moment.utc(item.time)
      const endTime = moment.utc(item.endTime)
      const rangeTxt = `${startTime.format('D MMM')} - ${endTime.format('D MMM')}`
      return rangeTxt
    })
    return cat
  }

  if (budgetPeriod === BudgetPeriod.Daily) {
    const cat = chartData.map(item => {
      const startTime = moment.utc(item.time)
      const rangeTxt = `${startTime.format('D MMM')}`
      return rangeTxt
    })
    return cat
  }

  const categories = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return categories
}

const getChartSeriesData: (
  chartData: BudgetCostData[],
  forecastedCost: number,
  chartLabels: Record<string, string>
) => (SeriesColumnOptions | SeriesLineOptions)[] = (
  chartData: BudgetCostData[],
  forecastedCost: number,
  chartLabels
) => {
  // This is a temporary hack, remove before merge
  chartData = chartData.slice(-10)

  const columnChartData = chartData.map(item => [item.actualCost])
  const lineChartData = chartData.map(item => [item.budgeted])

  const lastChartEntry = chartData[chartData.length - 1] as any

  // const lastMonthBudget = [forecastedCost]
  // const lastMonthActual = [lastChartEntry.actualCost]

  const lastMonthBudget = chartData.map((_, idx) => {
    if (idx === chartData.length - 1) {
      return [forecastedCost]
    }
    return 0
  })

  const lastMonthActual = chartData.map((_, idx) => {
    if (idx === chartData.length - 1) {
      return [lastChartEntry.actualCost]
    }
    return 0
  })

  const lastMonthBudgetChartSeries: SeriesColumnOptions = {
    name: chartLabels.FORECAST_COST,
    type: CCM_CHART_TYPES.COLUMN,
    data: lastMonthBudget,
    color: 'var(--teal-50)'
  }
  const lastMonthActualChartSeries: SeriesColumnOptions = {
    name: chartLabels.CURRENT_MONTH_COST,
    type: CCM_CHART_TYPES.COLUMN,
    data: lastMonthActual,
    color: 'var(--teal-400)'
  }

  // remove last element because its handeled in lastMonthChartData
  columnChartData.pop()
  const columnChartSeries: SeriesColumnOptions = {
    name: chartLabels.ACTUAL_COST,
    type: CCM_CHART_TYPES.COLUMN,
    data: columnChartData,
    color: 'var(--primary-8)'
  }

  const lineChartSeries: SeriesLineOptions = {
    name: chartLabels.BUDGETED_COST,
    type: CCM_CHART_TYPES.LINE,
    data: lineChartData,
    color: 'var(--yellow-900)'
  }

  return [lastMonthBudgetChartSeries, lastMonthActualChartSeries, columnChartSeries, lineChartSeries]
}

interface BudgetDetailsChartProps {
  chartData: BudgetData
  budgetPeriod: BudgetPeriod
}

const BudgetDetailsChart: (props: BudgetDetailsChartProps) => JSX.Element | null = ({ chartData, budgetPeriod }) => {
  const { getString } = useStrings()

  if (!chartData?.costData?.length) {
    return null
  }

  const chartLabels: Record<string, string> = {
    ACTUAL_COST: getString('ce.budgets.detailsPage.chartNames.actualCost'),
    BUDGETED_COST: getString('ce.budgets.detailsPage.chartNames.budgetedCost'),
    FORECAST_COST: getString('ce.budgets.detailsPage.chartNames.forecastCost'),
    CURRENT_MONTH_COST: getString('ce.budgets.detailsPage.chartNames.currentMonthCost')
  }

  const filteredData = chartData.costData.filter(e => e?.time) as BudgetCostData[]

  const chartSeriesData = getChartSeriesData(filteredData, chartData.forecastCost, chartLabels)

  return (
    <Container>
      <CEChart
        options={{
          series: chartSeriesData,
          plotOptions: {
            column: {
              borderColor: undefined,
              groupPadding: 0.2,
              grouping: false
            }
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
            categories: computeCategories(filteredData, budgetPeriod),
            ordinal: true,
            labels: {
              formatter: function () {
                return `${this.value}`
              }
            }
          },
          legend: {
            align: 'right',
            layout: 'horizontal'
          }
        }}
      />
    </Container>
  )
}

export default BudgetDetailsChart
