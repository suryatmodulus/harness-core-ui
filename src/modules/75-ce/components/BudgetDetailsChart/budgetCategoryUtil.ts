/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { BudgetCostData, BudgetPeriod } from 'services/ce/services'

export const computeCategories: (chartData: BudgetCostData[], budgetPeriod: BudgetPeriod) => string[] = (
  chartData,
  budgetPeriod
) => {
  const cat = chartData.map(item => {
    const startTime = moment.utc(item.time)
    const endTime = moment.utc(item.endTime)
    return getTimeRangeExpression(budgetPeriod, startTime, endTime)
  })

  return cat
}

export const getTimeRangeExpression: (
  budgetPeriod: BudgetPeriod,
  startTime: moment.Moment,
  endTime: moment.Moment
) => string = (budgetPeriod, startTime, endTime) => {
  let rangeTxt = ''

  switch (budgetPeriod) {
    case BudgetPeriod.Monthly:
      if (startTime.get('month') === endTime.get('month')) {
        rangeTxt = startTime.format('MMM YYYY')
      } else {
        rangeTxt = `${startTime.format('D MMM YY')} -  ${endTime.format('D MMM YY')}`
      }
      break

    case BudgetPeriod.Quarterly:
    case BudgetPeriod.Yearly:
      rangeTxt = `${startTime.format('D MMM YYYY')} - ${endTime.format('D MMM YYYY')}`
      break

    case BudgetPeriod.Weekly:
      rangeTxt = `${startTime.format('D MMM')} - ${endTime.format('D MMM')}`
      break

    case BudgetPeriod.Daily:
      rangeTxt = `${startTime.format('D MMM')}`
      break

    default:
      rangeTxt = startTime.format('MMM YYYY')
  }

  return rangeTxt
}
