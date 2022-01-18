/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { minBy, maxBy } from 'lodash-es'
import type Highcharts from 'highcharts'
import { Color, Utils } from '@wings-software/uicore'
import type { Point } from 'services/cv'

const MILLISECONDS_PER_HOUR = 1000 * 60 * 60 * 4

export const getDefaultChartOptions = (): Highcharts.Options => ({
  chart: { spacing: [20, 0, 20, 0] },
  xAxis: {
    tickInterval: MILLISECONDS_PER_HOUR,
    allowDecimals: false,
    type: 'datetime',
    labels: {
      formatter: function () {
        return moment(this.value).format('h:mm A')
      }
    }
  },
  yAxis: {
    labels: {
      formatter: function () {
        return `${this.value}%`
      }
    }
  },
  tooltip: { enabled: false },
  plotOptions: {
    area: {
      color: Utils.getRealCSSColor(Color.PRIMARY_3),
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: false
          }
        }
      }
    }
  }
})

export const getDataPointsWithMinMaxXLimit = (
  data: Point[]
): {
  dataPoints: number[][]
  minXLimit: number
  maxXLimit: number
} => {
  const divider = 10
  const dataPoints = data.map(point => [Number(point.timestamp) || 0, Number(point.value) || 0])

  const minPoint = minBy(dataPoints, point => point[1]) ?? [0, 0]
  const maxPoint = maxBy(dataPoints, point => point[1]) ?? [0, 0]

  const minValue = Math.floor(minPoint[1])
  const maxValue = Math.ceil(maxPoint[1])

  const minValueReminder = minValue % divider
  const maxValueReminder = maxValue % divider

  const minXLimit = minValue - minValueReminder
  const maxXLimit = maxValueReminder ? maxValue + divider - maxValueReminder : maxValue

  return {
    dataPoints,
    minXLimit: minXLimit === maxXLimit ? minXLimit - divider : minXLimit,
    maxXLimit
  }
}
